import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, NotFoundError } from '../errors';
import { Format, FormatTemplate, FormatTemplateFileEntry, Library, PhaseTemplate, User } from '../models';
import { FormatMemberRepo, FormatTemplateRepo, PhaseTemplateRepo } from '../repositories';
import { respond, withErrorHandler, withTransaction } from './utils';
import { ActivityTemplateService, KeyVisualService } from '../services';
import { FormatTemplateResponseBuilder } from '../responses';
import { isMember } from '../utils/helpers';

export class FormatTemplateController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const user = req.user as User;
                const repo = runner.manager.getCustomRepository(FormatTemplateRepo);
                const [formatTemplates, count] = await repo.getEntities(req.query, user);
                const builder = new FormatTemplateResponseBuilder(req.query);
                respond(res, builder.buildMany(formatTemplates, count));
            },
            res,
            next
        );
    }

    public static async getFormatTemplatesOfLibrary(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const user = req.user as User;
                const library = res.locals.library as Library;
                const repo = runner.manager.getCustomRepository(FormatTemplateRepo);
                const [formatTemplates, count] = await repo.getEntities(req.query, user, library);
                const builder = new FormatTemplateResponseBuilder(req.query);
                respond(res, builder.buildMany(formatTemplates, count));
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
                const format = await runner.manager.getRepository(Format).findOne(req.body.formatId, {
                    relations: [
                        'keyVisual',
                        'keyVisual.keyVisualFile',
                        'keyVisual.keyVisualLink',
                        'phases',
                        'phases.activities',
                        'phases.activities.steps',
                        'files',
                        'phases.activities.keyVisual',
                        'phases.activities.keyVisual.keyVisualFile',
                        'phases.activities.keyVisual.keyVisualFile.createdBy',
                        'phases.activities.keyVisual.keyVisualLink',
                        'phases.activities.keyVisual.keyVisualLink.createdBy',
                        'phases.activities.configuration',
                        'phases.activities.files',
                        'phases.activities.canvases',
                        'phases.activities.canvases.slots'
                    ]
                });

                if (!format) {
                    throw new NotFoundError(`Format ${req.body.formatId} not found`);
                }

                const memberRepo = runner.manager.getCustomRepository(FormatMemberRepo);
                const isOrganizer = await memberRepo.isOrganizer(format, user.id);

                if (!isOrganizer) {
                    throw new ForbiddenError('User is not an Organizer of format');
                }

                const formatTemplate = new FormatTemplate({
                    name: format.name,
                    shortDescription: format.shortDescription,
                    description: format.description,
                    createdBy: req.user,
                    library: res.locals.library,
                    category: req.body.category
                });

                formatTemplate.files = [];
                for (const file of format.files) {
                    const formatTemplateFile = new FormatTemplateFileEntry({
                        name: file.name,
                        contentType: file.contentType,
                        size: file.size,
                        fileId: file.fileId,
                        versionId: file.versionId,
                        createdBy: file.createdBy,
                        createdAt: file.createdAt,
                        updatedAt: file.updatedAt
                    });
                    formatTemplate.files.push(formatTemplateFile);
                }

                await runner.manager.getCustomRepository(FormatTemplateRepo).saveEntity(formatTemplate);
                await KeyVisualService.copyKeyVisual(formatTemplate, format.keyVisual, runner);

                for (const phase of format.phases) {
                    const phaseTemplate = new PhaseTemplate({
                        name: phase.name,
                        durationUnit: phase.durationUnit,
                        createdBy: req.user,
                        library: res.locals.library,
                        formatTemplate: formatTemplate
                    });

                    await runner.manager.getCustomRepository(PhaseTemplateRepo).saveEntity(phaseTemplate);

                    for (const activity of phase.activities) {
                        await ActivityTemplateService.createActivityTemplate(user, runner, activity, req, library, phaseTemplate);
                    }
                }

                const createdFormatTmpl = await runner.manager.getCustomRepository(FormatTemplateRepo).getEntity(formatTemplate.id);
                const builder = new FormatTemplateResponseBuilder();
                respond(res, builder.buildOne(createdFormatTmpl), 201);
            },
            res,
            next
        );
    }

    public static async getFormatTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const formatTemplate = await runner.manager.getCustomRepository(FormatTemplateRepo).getEntity(req.params.formatTemplateId);

                if (!formatTemplate) {
                    throw new NotFoundError('Format template not found');
                }

                if (!isMember(req.user, formatTemplate.library)) {
                    throw new ForbiddenError('Not member of the library');
                }

                res.locals.formatTemplate = formatTemplate;
            },
            res,
            next
        );
    }

    public static async showFormatTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async (): Promise<void> => {
                const formatTemplate = res.locals.formatTemplate as FormatTemplate;
                const builder = new FormatTemplateResponseBuilder(req.query);
                respond(res, builder.buildOne(formatTemplate));
            },
            res,
            next
        );
    }

    public static async deleteFormatTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const formatTemplate = res.locals.formatTemplate;
                await runner.manager.getCustomRepository(FormatTemplateRepo).deleteEntity(formatTemplate);
                respond(res);
            },
            res,
            next
        );
    }

    public static async patchFormatTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const formatTemplate = res.locals.formatTemplate as FormatTemplate;
                const patched = await runner.manager.getCustomRepository(FormatTemplateRepo).patchEntity(formatTemplate, req.body);
                respond(res, patched);
            },
            res,
            next
        );
    }
}
