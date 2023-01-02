import { NextFunction, Request, Response } from 'express';
import { AvatarFileEntry, User } from '../models';
import { respond, withTransaction } from './utils';
import { ProfileResponseBuilder } from '../responses';
import { QueryRunner } from 'typeorm';
import { AvatarFileEntryRepository } from '../repositories/FileEntryRepository';
import { WorkspaceMemberRepo } from '../repositories';

export class ProfileController {
    public static async showProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const user = req.user as Partial<User>;
                const builder = new ProfileResponseBuilder(req.query);
                const workspaceCount = await runner.manager.getCustomRepository(WorkspaceMemberRepo).countWorkspacesForUser(user.id);
                user['workspaceCount'] = workspaceCount;
                respond(res, builder.buildOne(user));
            },
            res,
            next
        );
    }

    public static async getAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const user = req.user as Partial<User>;
                const repo = runner.manager.getCustomRepository(AvatarFileEntryRepository);
                const avatar: AvatarFileEntry = await repo.getAvatarByUserId(user.id);
                if (avatar) {
                    res.locals.fileEntry = avatar;
                    res.locals.noCachefileEntry = true;
                } else {
                    respond(res, {}, 204);
                }
            },
            res,
            next
        );
    }
}
