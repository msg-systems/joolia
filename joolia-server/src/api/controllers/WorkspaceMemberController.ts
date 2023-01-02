import { NextFunction, Request, Response } from 'express';
import { User, Workspace, WorkspaceMember, WorkspaceMemberRole } from '../models';
import { InvitationService } from '../services/invitation';
import { respond, withErrorHandler, withTransaction } from './utils';
import { WorkspaceMemberRepo } from '../repositories';
import { WorkspaceMemberAdminResponseBuilder, WorkspaceMemberResponseBuilder } from '../responses';
import { BadRequestError, NotFoundError } from '../errors';
import { logger } from '../../logger';
import { WorkspaceMemberViewRepo } from '../repositories/views';
import { UserMemberRepository } from '../repositories/UserMemberRepository';

export class WorkspaceMemberController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const user = req.user as User;
                const workspace = res.locals.workspace as Workspace;

                const repo = runner.manager.getCustomRepository(WorkspaceMemberRepo);
                const isWorkspaceAdmin = await repo.isWorkspaceAdmin(workspace, user.id);

                let builder;

                if (isWorkspaceAdmin) {
                    builder = new WorkspaceMemberAdminResponseBuilder(req.query);
                } else {
                    builder = new WorkspaceMemberResponseBuilder(req.query);
                }

                const [members, count] = await WorkspaceMemberViewRepo.getEntities(req.query, workspace);
                respond(res, builder.buildMany(members, count));
            },
            res,
            next
        );
    }

    public static getMember(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const workspace = res.locals.workspace as Workspace;
                const repo = runner.manager.getCustomRepository(WorkspaceMemberRepo);
                res.locals.workspaceMember = await repo.getEntity(workspace, req.params.memberId);

                if (!res.locals.workspaceMember) {
                    throw new NotFoundError(`Workspace Member ${req.params.memberId} not found.`);
                }
            },
            res,
            next
        );
    }

    public static async addMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const workspace = res.locals.workspace as Workspace;
                await InvitationService.add(workspace, req);
                respond(res);
            },
            res,
            next
        );
    }

    public static updateMember(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const user = req.user as User;
                const workspace = res.locals.workspace as Workspace;
                const workspaceMember = res.locals.workspaceMember as WorkspaceMember;
                const repo: WorkspaceMemberRepo = runner.manager.getCustomRepository(WorkspaceMemberRepo);

                const adminCount = await repo.countMembersByRole(workspace, true);
                const newRole = req.body.role;

                // checks if user is last workspace administrator and wants to change his role to participant
                if (adminCount === 1 && user.id === req.params.memberId && newRole === WorkspaceMemberRole.PARTICIPANT) {
                    throw new BadRequestError('Last organizer cannot change its role to participant.');
                }

                workspaceMember.admin = newRole === WorkspaceMemberRole.ADMIN;
                await repo.save(workspaceMember);

                respond(
                    res,
                    {
                        id: workspaceMember.user.id,
                        role: workspaceMember.admin ? WorkspaceMemberRole.ADMIN : WorkspaceMemberRole.PARTICIPANT
                    },
                    200
                );
            },
            res,
            next
        );
    }

    public static async deleteMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const workspace = res.locals.workspace as Workspace;
                const emails = req.body.emails;
                const repo: WorkspaceMemberRepo = runner.manager.getCustomRepository(WorkspaceMemberRepo);
                const allMembersOfWorkspace = await repo.countMembers(workspace);

                if (allMembersOfWorkspace == 1) {
                    throw new BadRequestError('The Workspace must have at least one member');
                } else {
                    const membersToRemove = await repo.countMembers(workspace, emails);

                    if (membersToRemove > 0) {
                        if (allMembersOfWorkspace - membersToRemove === 0) {
                            throw new BadRequestError('The Workspace must have at least one member');
                        }

                        const userMemberRepo: UserMemberRepository = runner.manager.getCustomRepository(UserMemberRepository);
                        await userMemberRepo.deleteWorkspaceMembers(workspace, emails);
                    } else {
                        logger.warn('User(s) %o not found.', emails);
                    }
                }

                respond(res);
            },
            res,
            next
        );
    }
}
