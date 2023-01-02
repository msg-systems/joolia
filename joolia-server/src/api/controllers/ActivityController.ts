import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors';
import { Activity, ActivityConfiguration, ActivityTemplate, LinkEntry, Phase, User } from '../models';
import { ActivityCanvasRepo, ActivityRepo } from '../repositories';
import { respond, withTransaction } from './utils';
import { ActivityDetailsResponseBuilder, ActivityReorderResBuilder, ActivityResponseBuilder } from '../responses';
import { DeepPartial, DeleteResult, QueryRunner } from 'typeorm';
import { ActivityService } from '../services';
import { isOrganizer } from '../utils/helpers';
import { LinkType } from '../models/LinkModel';

export class ActivityController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const phase = res.locals.phase as Phase;
                const [activities, count] = await runner.manager.getCustomRepository(ActivityRepo).getEntities(req.query, phase);
                const builder = new ActivityResponseBuilder(req.query);
                respond(res, builder.buildMany(activities, count), 200);
            },
            res,
            next
        );
    }

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const createdBy = req.user as DeepPartial<User>;
                const phase = res.locals.phase as Phase;
                const configuration = req.body.configuration
                    ? new ActivityConfiguration(req.body.configuration)
                    : new ActivityConfiguration();

                let activity = new Activity({ ...req.body, phase, configuration, createdBy });
                activity = await runner.manager.getCustomRepository(ActivityRepo).saveEntity(activity);
                const builder = new ActivityResponseBuilder(req.query);
                respond(res, builder.buildOne(activity), 201);
            },
            res,
            next
        );
    }

    public static async getActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const activity = await runner.manager.getCustomRepository(ActivityRepo).getEntity(req.params.activityId);
                if (!activity) {
                    throw new NotFoundError(`Activity ${req.params.activityId} not found`);
                }
                res.locals.activity = activity;
            },
            res,
            next
        );
    }

    public static async getActivityWithSubmissionsAndSteps(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                // instead of performing 1 query that retrieves both submissions and steps, it is faster to use 2 separate queries
                const activity = await runner.manager.getCustomRepository(ActivityRepo).getEntityWithSubmissions(req.params.activityId);
                if (!activity) {
                    throw new NotFoundError(`Activity ${req.params.activityId} not found`);
                }
                const activityWithSteps = await runner.manager.getCustomRepository(ActivityRepo).getEntityWithSteps(req.params.activityId);
                activity.steps = activityWithSteps.steps;
                res.locals.activity = activity;
            },
            res,
            next
        );
    }

    public static async showActivityDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const activity = res.locals.activity as Activity;

                /**
                 * TODO: JOOLIA-2190 - Use a view instead and avoid this extra query.
                 */
                const repo: ActivityCanvasRepo = runner.manager.getCustomRepository(ActivityCanvasRepo);
                const hasCanvasSubmissions = await repo.hasCanvasSubmissions(activity);

                const builder = new ActivityDetailsResponseBuilder(req.query, req.user, isOrganizer(res));
                respond(res, builder.buildOne([activity, hasCanvasSubmissions]), 200);
            },
            res,
            next
        );
    }

    public static async showActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async () => {
                const activity = res.locals.activity as Activity;

                const builder = new ActivityResponseBuilder(req.query);
                respond(res, builder.buildOne(activity), 200);
            },
            res,
            next
        );
    }

    public static async deleteActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const repo = runner.manager.getCustomRepository(ActivityRepo);
                await repo.deleteEntity(res.locals.activity);
                respond(res);
            },
            res,
            next
        );
    }

    public static async patchActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                let activity = res.locals.activity as Activity;
                const repo = runner.manager.getCustomRepository(ActivityRepo);
                const links = req.body.collaborationLinks as Array<Partial<LinkEntry>>;

                if (links) {
                    const linksToRemove: Array<Promise<DeleteResult>> = [];
                    const linksToAdd: Array<Promise<LinkEntry>> = [];

                    for (const link of links) {
                        if (!link.id) {
                            const newLink = new LinkEntry({
                                linkUrl: link.linkUrl,
                                createdBy: req.user,
                                description: link.description,
                                type: LinkType.COLLABORATION
                            });

                            linksToAdd.push(runner.manager.save(newLink));
                        } else {
                            if (link.id && link.linkUrl === null) {
                                linksToRemove.push(runner.manager.delete(LinkEntry, link.id));
                            }
                            /** code to edit a url comes here */
                        }
                    }

                    if (linksToRemove.length !== 0) {
                        await Promise.all(linksToRemove);
                        activity = await repo.getEntity(activity.id);
                    }

                    if (activity.collaborationLinks) {
                        req.body.collaborationLinks = activity.collaborationLinks;
                    }

                    const createdLinks = await Promise.all(linksToAdd);
                    // the body is kept with the up to date data to keep current behaviour of patch and return this field
                    req.body.collaborationLinks = req.body.collaborationLinks.concat(createdLinks);
                }

                const patchedActivity = await repo.patchEntity(activity, req.body);
                respond(res, patchedActivity);
            },
            res,
            next
        );
    }

    public static async updatePosition(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const activity = res.locals.activity as Activity;
                const repo = runner.manager.getCustomRepository(ActivityRepo);
                const updatedActivity = await repo.reorder(activity, req.body.position);
                const builder = new ActivityReorderResBuilder(req.query);
                respond(res, builder.buildOne(updatedActivity), 200);
            },
            res,
            next
        );
    }

    public static async createFromTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const activityTemplate = await runner.manager.getRepository(ActivityTemplate).findOne(req.body.activityTemplateId, {
                    relations: [
                        'stepTemplates',
                        'keyVisual',
                        'keyVisual.keyVisualFile',
                        'keyVisual.keyVisualFile.createdBy',
                        'keyVisual.keyVisualLink',
                        'keyVisual.keyVisualLink.createdBy',
                        'configuration',
                        'files',
                        'canvases',
                        'canvases.slots'
                    ]
                });

                if (!activityTemplate) {
                    throw new NotFoundError('No activityTemplate found');
                }

                const activity = await ActivityService.createActivityFromTemplate(
                    runner,
                    res.locals.phase,
                    activityTemplate,
                    req.user,
                    req.body.position
                );

                const repo = runner.manager.getCustomRepository(ActivityRepo);
                const createdActivity = await repo.getEntity(activity.id);
                const builder = new ActivityResponseBuilder();
                respond(res, builder.buildOne(createdActivity), 201);
            },
            res,
            next
        );
    }
}
