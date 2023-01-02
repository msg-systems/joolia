import { NextFunction, Request, Response } from 'express';
import { QueryRunner } from 'typeorm';
import { ForbiddenError, NotFoundError } from '../errors';
import { Format, FormatMember, FormatMemberRoles, Phase, User, Workspace } from '../models';
import { FormatMemberRepo, FormatRepo, FormatTemplateRepo, PhaseRepo } from '../repositories';
import { ActivityService, FormatService } from '../services';
import { respond, withErrorHandler, withTransaction } from './utils';
import { GetFormatResponseBuilder, PostFormatResponseBuilder } from '../responses';
import { isMember } from '../utils/helpers';
import { getFormatId } from '../utils/web';
import { FormatViewRepo } from '../repositories/views';

export class FormatController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const user = req.user as User;
                const [data, count] = await FormatViewRepo.getEntities(req.query, user);
                const builder = new GetFormatResponseBuilder(req.query);
                respond(res, builder.buildMany(data, count));
            },
            res,
            next
        );
    }

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const user = req.user as User;
                const repo = runner.manager.getCustomRepository(FormatRepo);

                const workspace = await runner.manager.getRepository(Workspace).findOne({
                    relations: ['members', 'members.user'],
                    where: { id: req.body.workspace }
                });

                if (!workspace) {
                    throw new NotFoundError('Workspace not found');
                }

                if (!isMember(user, workspace)) {
                    throw new ForbiddenError('User not in workspace.');
                }

                const format = new Format(req.body);
                format.createdBy = req.user;
                await repo.saveEntity(format);

                // add creator as member
                const member = new FormatMember();
                member.user = req.user;
                member.role = FormatMemberRoles.ORGANIZER;
                member.format = format;
                await runner.manager.save(member, { reload: false });

                // Read again with updated relations
                const createdFormat = await repo.findOne(format.id);
                const builder = new PostFormatResponseBuilder();
                respond(res, builder.buildOne(createdFormat), 201);
            },
            res,
            next
        );
    }

    public static async getFormat(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const user = req.user as User;
                const formatId = getFormatId(req);
                const repo = runner.manager.getCustomRepository(FormatRepo);
                const format = await repo.getEntity(formatId);

                if (!format) {
                    throw new NotFoundError('Format not found');
                }

                res.locals.format = format;

                const memberRepo = runner.manager.getCustomRepository(FormatMemberRepo);
                const userRole = await memberRepo.getRole(format, user.id);

                if (userRole) {
                    res.locals.userRole = userRole;
                } else {
                    throw new ForbiddenError();
                }
            },
            res,
            next
        );
    }

    public static async showFormat(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const user = req.user as User;
                const format = res.locals.format as Format;
                const formatView = await FormatViewRepo.getEntity(format.id, user);
                const builder = new GetFormatResponseBuilder(req.query);
                respond(res, builder.buildOne(formatView), 200);
            },
            res,
            next
        );
    }

    public static async deleteFormat(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const repo = runner.manager.getCustomRepository(FormatRepo);
                await repo.deleteEntity(res.locals.format);
                respond(res);
            },
            res,
            next
        );
    }

    public static async patchFormat(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const format = res.locals.format as Format;
                const repo = runner.manager.getCustomRepository(FormatRepo);
                const patchedFormat = await repo.patchEntity(format, req.body);
                respond(res, patchedFormat, 200);
            },
            res,
            next
        );
    }

    /**
     * Create a format from a format template.
     * @see WorkspaceController.getWorkspace
     */
    public static async createFormatFromTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const user = req.user as User;
                const formatTemplate = await runner.manager.getCustomRepository(FormatTemplateRepo).findOne(req.body.formatTemplateId, {
                    relations: [
                        'library',
                        'library.members',
                        'keyVisual',
                        'keyVisual.keyVisualFile',
                        'keyVisual.keyVisualFile.createdBy',
                        'keyVisual.keyVisualLink',
                        'keyVisual.keyVisualLink.createdBy',
                        'files',
                        'phaseTemplates',
                        'phaseTemplates.activityTemplates',
                        'phaseTemplates.activityTemplates.stepTemplates',
                        'phaseTemplates.activityTemplates.configuration',
                        'phaseTemplates.activityTemplates.keyVisual',
                        'phaseTemplates.activityTemplates.keyVisual.keyVisualFile',
                        'phaseTemplates.activityTemplates.keyVisual.keyVisualFile.createdBy',
                        'phaseTemplates.activityTemplates.keyVisual.keyVisualLink',
                        'phaseTemplates.activityTemplates.keyVisual.keyVisualLink.createdBy',
                        'phaseTemplates.activityTemplates.files',
                        'phaseTemplates.activityTemplates.canvases',
                        'phaseTemplates.activityTemplates.canvases.slots'
                    ]
                });

                const phaseRepository = runner.manager.getCustomRepository(PhaseRepo);

                if (!formatTemplate) {
                    throw new NotFoundError('Format template not found');
                }

                if (!isMember(req.user, formatTemplate.library)) {
                    throw new ForbiddenError('User is not a member of the library');
                }

                const format = await FormatService.createNewFormat({ ...formatTemplate }, user, res.locals.workspace, runner);

                for (const phaseTemplate of formatTemplate.phaseTemplates) {
                    let phase = new Phase({
                        name: phaseTemplate.name,
                        durationUnit: phaseTemplate.durationUnit,
                        format: format,
                        createdBy: user
                    });

                    phase = await phaseRepository.saveEntity(phase);
                    for (const activityTemplate of phaseTemplate.activityTemplates) {
                        await ActivityService.createActivityFromTemplate(runner, phase, activityTemplate, user);
                    }
                }

                //TODO: Use builder format - seems client only need id
                respond(res, { id: format.id }, 201);
            },
            res,
            next
        );
    }
}
