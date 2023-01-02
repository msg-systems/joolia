import { NextFunction, Request, Response } from 'express';
import { QueryRunner } from 'typeorm';
import { ForbiddenError, NotFoundError, ValidationError } from '../errors';
import { Format, Phase, User } from '../models';
import { PhaseRepo, PhaseTemplateRepo } from '../repositories';
import { respond, withErrorHandler, withTransaction } from './utils';
import { ActivityService } from '../services';
import { isMember, isOrganizer } from '../utils/helpers';
import { PhaseResponseBuilder } from '../responses';

export class PhaseController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const format = res.locals.format as Format;

                const repo = runner.manager.getCustomRepository(PhaseRepo);

                const [phases, count] = isOrganizer(res)
                    ? await repo.getEntitiesAsOrganizer(req.query, format)
                    : await repo.getEntities(req.query, format);

                const builder = new PhaseResponseBuilder(req.query);
                respond(res, builder.buildMany(phases, count), 200);
            },
            res,
            next
        );
    }

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const createdBy = req.user as User;
                const format = res.locals.format as Format;
                const newPhase = new Phase({ ...req.body, format, createdBy });
                const repo = runner.manager.getCustomRepository(PhaseRepo);
                const phase = await repo.saveEntity(newPhase);
                const builder = new PhaseResponseBuilder(req.query);
                respond(res, builder.buildOne(phase), 201);
            },
            res,
            next
        );
    }

    public static async getPhase(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const format = res.locals.format as Format;
                const repo = runner.manager.getCustomRepository(PhaseRepo);
                const phase = await repo.getEntity(req.params.phaseId, format);

                if (!phase) {
                    throw new NotFoundError('Phase not found');
                }

                res.locals.phase = phase;
            },
            res,
            next
        );
    }

    public static async showPhase(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const phase = res.locals.phase as Phase;
                const builder = new PhaseResponseBuilder(req.query);
                respond(res, builder.buildOne(phase), 200);
            },
            res,
            next
        );
    }

    public static async deletePhase(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                await runner.manager.getCustomRepository(PhaseRepo).deleteEntity(res.locals.phase);
                respond(res);
            },
            res,
            next
        );
    }

    public static async patchPhase(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const phase = res.locals.phase as Phase;
                if (req.body.durationUnit && phase.activities.length > 0) {
                    throw new ValidationError('Duration unit cannot be modified if phase contains activities');
                }

                const repo = runner.manager.getCustomRepository(PhaseRepo);
                // Here the returned patched object is not partial because the computed/dynamic may also change hence the ResponseBuilder
                const patched = await repo.patchEntity(phase, req.body, { partial: false });
                const builder = new PhaseResponseBuilder();
                respond(res, builder.buildOne(patched), 200);
            },
            res,
            next
        );
    }

    public static async createPhaseFromTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const user = req.user as User;
                const format = res.locals.format as Format;
                const phaseTemplate = await runner.manager.getCustomRepository(PhaseTemplateRepo).findOne(req.body.phaseTemplateId, {
                    relations: [
                        'library',
                        'library.members',
                        'activityTemplates',
                        'activityTemplates.stepTemplates',
                        'activityTemplates.configuration',
                        'activityTemplates.keyVisual',
                        'activityTemplates.keyVisual.keyVisualFile',
                        'activityTemplates.keyVisual.keyVisualFile.createdBy',
                        'activityTemplates.keyVisual.keyVisualLink',
                        'activityTemplates.keyVisual.keyVisualLink.createdBy',
                        'activityTemplates.files',
                        'activityTemplates.canvases',
                        'activityTemplates.canvases.slots'
                    ]
                });

                const repo = runner.manager.getCustomRepository(PhaseRepo);

                if (!phaseTemplate) {
                    throw new NotFoundError('Phase template not found');
                }

                if (!isMember(user, phaseTemplate.library)) {
                    throw new ForbiddenError('User is not a member of the library');
                }

                const phase = new Phase({
                    name: phaseTemplate.name,
                    durationUnit: phaseTemplate.durationUnit,
                    createdBy: user,
                    format
                });

                await repo.saveEntity(phase);
                const results = [];
                for (const activityTemplate of phaseTemplate.activityTemplates) {
                    results.push(ActivityService.createActivityFromTemplate(runner, phase, activityTemplate, req.user));
                }
                await Promise.all(results);

                const createdPhase = await repo.getEntity(phase.id, format);
                const builder = new PhaseResponseBuilder(req.query);
                respond(res, builder.buildOne(createdPhase), 201);
            },
            res,
            next
        );
    }
}
