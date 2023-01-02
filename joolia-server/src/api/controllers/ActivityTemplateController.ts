import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, NotFoundError } from '../errors';
import { ActivityTemplateRepo, FormatMemberRepo } from '../repositories';
import { respond, withErrorHandler, withTransaction } from './utils';
import { ActivityTemplateService } from '../services';
import { ActivityTemplateResponseBuilder } from '../responses';
import { QueryRunner } from 'typeorm';
import { Activity, ActivityTemplate, Library, User } from '../models';

export class ActivityTemplateController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const user = req.user as User;
                const [templates, count] = await runner.manager.getCustomRepository(ActivityTemplateRepo).getEntities(req.query, user);
                const builder = new ActivityTemplateResponseBuilder(req.query);
                respond(res, builder.buildMany(templates, count));
            },
            res,
            next
        );
    }

    public static async getTemplatesOfLibrary(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const library = res.locals.library as Library;
                const [templates, count] = await runner.manager.getCustomRepository(ActivityTemplateRepo).getEntities(req.query, library);
                const builder = new ActivityTemplateResponseBuilder(req.query);
                respond(res, builder.buildMany(templates, count));
            },
            res,
            next
        );
    }

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const user = req.user as User;
                const library = res.locals.library as Library;
                const activity = await runner.manager.getRepository(Activity).findOne(req.body.activityId, {
                    relations: [
                        'steps',
                        'configuration',
                        'keyVisual',
                        'keyVisual.keyVisualFile',
                        'keyVisual.keyVisualLink',
                        'keyVisual.keyVisualFile.createdBy',
                        'keyVisual.keyVisualLink.createdBy',
                        'files',
                        'phase',
                        'phase.format',
                        'phase.format.members',
                        'phase.format.members.user',
                        'canvases',
                        'canvases.slots'
                    ]
                });

                if (!activity) {
                    throw new NotFoundError(`Activity ${req.body.activityId} not found`);
                }

                const format = activity.phase.format;
                const memberRepo = runner.manager.getCustomRepository(FormatMemberRepo);
                const isOrganizer = await memberRepo.isOrganizer(format, user.id);

                if (!isOrganizer) {
                    return next(new ForbiddenError('User is not an Organizer of Format'));
                }

                const activityTemplate = await ActivityTemplateService.createActivityTemplate(user, runner, activity, req, library);

                const repo = runner.manager.getCustomRepository(ActivityTemplateRepo);
                const createdTemplate = await repo.getEntity(activityTemplate.id, library);
                const builder = new ActivityTemplateResponseBuilder();
                respond(res, builder.buildOne(createdTemplate), 201);
            },
            res,
            next
        );
    }

    public static async getActivityTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const library = res.locals.library as Library;
                const repo = runner.manager.getCustomRepository(ActivityTemplateRepo);
                const activityTemplate = await repo.getEntity(req.params.activityTemplateId, library);

                if (!activityTemplate) {
                    throw new NotFoundError('Activity template not found');
                }

                res.locals.activityTemplate = activityTemplate;
            },
            res,
            next
        );
    }

    public static async showActivityTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const activityTemplate = res.locals.activityTemplate as ActivityTemplate;
                const builder = new ActivityTemplateResponseBuilder(req.query);
                respond(res, builder.buildOne(activityTemplate));
            },
            res,
            next
        );
    }

    public static async deleteActivityTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const activityTemplate = res.locals.activityTemplate as ActivityTemplate;
                await runner.manager.getCustomRepository(ActivityTemplateRepo).deleteEntity(activityTemplate);
                respond(res);
            },
            res,
            next
        );
    }

    public static async patchActivityTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const activityTemplate = res.locals.activityTemplate as ActivityTemplate;
                const patched = await runner.manager.getCustomRepository(ActivityTemplateRepo).patchEntity(activityTemplate, req.body);
                respond(res, patched);
            },
            res,
            next
        );
    }
}
