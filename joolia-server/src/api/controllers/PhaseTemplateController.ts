import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, NotFoundError } from '../errors';
import { Library, Phase, PhaseTemplate, User } from '../models';
import { FormatMemberRepo, PhaseTemplateRepo } from '../repositories';
import { respond, withErrorHandler, withTransaction } from './utils';
import { ActivityTemplateService } from '../services';
import { PhaseTemplateResponseBuilder } from '../responses';
import { isMember } from '../utils/helpers';

export class PhaseTemplateController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const user = req.user as User;
                const [phaseTemplates, count] = await runner.manager.getCustomRepository(PhaseTemplateRepo).getEntities(req.query, user);
                const builder = new PhaseTemplateResponseBuilder(req.query);
                respond(res, builder.buildMany(phaseTemplates, count));
            },
            res,
            next
        );
    }

    public static async getPhaseTemplatesOfLibrary(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const user = req.user as User;
                const library = res.locals.library as Library;
                const [phaseTemplates, count] = await runner.manager
                    .getCustomRepository(PhaseTemplateRepo)
                    .getEntities(req.query, user, library);

                const builder = new PhaseTemplateResponseBuilder(req.query);
                respond(res, builder.buildMany(phaseTemplates, count));
            },
            res,
            next
        );
    }

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const user = req.user as User;
                const library = res.locals.library as Library;
                const phase = await runner.manager.getRepository(Phase).findOne(req.body.phaseId, {
                    relations: [
                        'format',
                        'format.members',
                        'format.members.user',
                        'activities',
                        'activities.steps',
                        'activities.keyVisual',
                        'activities.keyVisual.keyVisualFile',
                        'activities.keyVisual.keyVisualFile.createdBy',
                        'activities.keyVisual.keyVisualLink',
                        'activities.keyVisual.keyVisualLink.createdBy',
                        'activities.configuration',
                        'activities.files',
                        'activities.canvases',
                        'activities.canvases.slots'
                    ]
                });

                if (!phase) {
                    throw new NotFoundError(`Phase ${req.body.phaseId} not found`);
                }

                const format = phase.format;
                const memberRepo = runner.manager.getCustomRepository(FormatMemberRepo);
                const isOrganizer = await memberRepo.isOrganizer(format, user.id);

                if (!isOrganizer) {
                    return next(new ForbiddenError('User is not an Organizer of format'));
                }

                const phaseTemplate = new PhaseTemplate({
                    name: phase.name,
                    durationUnit: phase.durationUnit,
                    createdBy: req.user,
                    library: res.locals.library,
                    category: req.body.category
                });

                const repo = await runner.manager.getCustomRepository(PhaseTemplateRepo);
                await repo.saveEntity(phaseTemplate);

                const activityTemplates = [];
                for (const activity of phase.activities) {
                    activityTemplates.push(
                        ActivityTemplateService.createActivityTemplate(user, runner, activity, req, library, phaseTemplate)
                    );
                }

                await Promise.all(activityTemplates);

                const createTmpl = await repo.getEntity(phaseTemplate.id);
                const builder = new PhaseTemplateResponseBuilder();
                respond(res, builder.buildOne(createTmpl), 201);
            },
            res,
            next
        );
    }

    public static async getPhaseTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const phaseTemplate = await runner.manager.getCustomRepository(PhaseTemplateRepo).getEntity(req.params.phaseTemplateId);

                if (!phaseTemplate) {
                    throw new NotFoundError('Phase Template not found');
                }

                if (!isMember(req.user, phaseTemplate.library)) {
                    throw new ForbiddenError('Not member of the library');
                }

                res.locals.phaseTemplate = phaseTemplate;
            },
            res,
            next
        );
    }

    public static async showPhaseTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async (): Promise<void> => {
                const phaseTemplate = res.locals.phaseTemplate as PhaseTemplate;
                const builder = new PhaseTemplateResponseBuilder(req.query);
                respond(res, builder.buildOne(phaseTemplate));
            },
            res,
            next
        );
    }

    public static async deletePhaseTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const phaseTemplate = res.locals.phaseTemplate as PhaseTemplate;
                await runner.manager.getCustomRepository(PhaseTemplateRepo).deleteEntity(phaseTemplate);
                respond(res);
            },
            res,
            next
        );
    }

    public static async patchPhaseTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const phaseTemplate = res.locals.phaseTemplate as PhaseTemplate;
                const patched = await runner.manager.getCustomRepository(PhaseTemplateRepo).patchEntity(phaseTemplate, req.body);
                respond(res, patched);
            },
            res,
            next
        );
    }
}
