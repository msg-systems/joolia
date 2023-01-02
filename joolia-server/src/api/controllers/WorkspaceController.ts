import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, NotFoundError } from '../errors';
import { User, Workspace, WorkspaceMember } from '../models';
import { WorkspaceMemberRepo, WorkspaceRepo } from '../repositories';
import { respond, withErrorHandler, withTransaction } from './utils';
import { GetFormatResponseBuilder, WorkspaceResponseBuilder } from '../responses';
import { FormatViewRepo, WorkspaceViewRepo } from '../repositories/views';
import { AdminConsentService } from '../services/adminConsent';

export class WorkspaceController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const user = req.user as User;
                const [workspaces, count] = await WorkspaceViewRepo.getEntities(req.query, user);
                const builder = new WorkspaceResponseBuilder(req.query);
                return respond(res, builder.buildMany(workspaces, count));
            },
            res,
            next
        );
    }

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const user = req.user as User;
                const repo: WorkspaceRepo = runner.manager.getCustomRepository(WorkspaceRepo);
                const workspace = new Workspace(req.body);
                workspace.createdBy = user;
                await repo.saveEntity(workspace);

                // add creator as member
                const member = new WorkspaceMember();
                member.user = user;
                member.admin = true;
                member.workspace = workspace;
                await runner.manager.save(member, { reload: false });

                const builder = new WorkspaceResponseBuilder();
                /**
                 * Note: Normally the view should be queried to get the proper data structure
                 * instead of this spread + missing data (here admin field) but the view
                 * repositories are handled in a separated connection pool through Knex hence
                 * the result is not available before committing this transaction.
                 */
                respond(res, builder.buildOne({ ...workspace, admin: true }), 201);
            },
            res,
            next
        );
    }

    public static async getWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const user = req.user as User;
                const workspaceId = req.params.workspaceId ? req.params.workspaceId : req.body.workspaceId;
                const repo = runner.manager.getCustomRepository(WorkspaceRepo);

                const workspace = await repo.getEntity(workspaceId);

                if (!workspace) {
                    throw new NotFoundError('Workspace not found');
                }

                if (!user.admin) {
                    const memberRepo = runner.manager.getCustomRepository(WorkspaceMemberRepo);
                    const isMember = await memberRepo.isMember(workspace, user.email);

                    if (!isMember) {
                        throw new ForbiddenError('Not member of this Workspace');
                    }
                }

                res.locals.workspace = workspace;
            },
            res,
            next
        );
    }

    public static async showWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const workspace = res.locals.workspace as Workspace;
                const user = req.user as User;
                const workspaceView = await WorkspaceViewRepo.getEntity(workspace.id, user);
                const builder = new WorkspaceResponseBuilder(req.query);
                respond(res, builder.buildOne(workspaceView));
            },
            res,
            next
        );
    }

    public static async patchWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const workspace = res.locals.workspace as Workspace;
                const patched = await runner.manager.getCustomRepository(WorkspaceRepo).patchEntity(workspace, req.body);
                respond(res, patched);
            },
            res,
            next
        );
    }

    public static async deleteWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const workspace = res.locals.workspace as Workspace;
                await runner.manager.getCustomRepository(WorkspaceRepo).deleteEntity(workspace);
                respond(res);
            },
            res,
            next
        );
    }

    public static async getWorkspaceFormats(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const user = req.user as User;
                const workspace = res.locals.workspace as Workspace;
                const [formats, count] = await FormatViewRepo.getEntities(req.query, user, workspace);
                const builder = new GetFormatResponseBuilder(req.query);
                respond(res, builder.buildMany(formats, count), 200);
            },
            res,
            next
        );
    }

    public static async requestAdminConsent(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                await AdminConsentService.sendAdminConsentRequest(req);
                respond(res, {}, 204);
            },
            res,
            next
        );
    }
}
