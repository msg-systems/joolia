import { AvatarFileEntry, FileEntry, User } from '../../models';
import { Request, Response } from 'express';
import { EntityManager, QueryRunner } from 'typeorm';
import { AvatarFileEntryRepository, FileEntryRepository } from '../../repositories/FileEntryRepository';
import { AbstractFileEntryController } from './AbstractFileController';
import { NotFoundError } from '../../errors';
import { IQuerySelect, ResponseBuilder } from '../../responses/builder';
import { UserAvatarResponseBuilder } from '../../responses';

export class UserAvatarFileEntryController extends AbstractFileEntryController<AvatarFileEntry> {
    protected async createFileEntry(request: Request, response: Response, runner: QueryRunner): Promise<AvatarFileEntry> {
        const user = this.getEntity(response.locals);
        const fileEntry = new AvatarFileEntry({
            ...request.body,
            createdBy: request.user
        });
        user.avatar = fileEntry;
        await runner.manager.save([fileEntry, user]);
        return fileEntry;
    }

    protected async getFileEntry(request: Request, response: Response, runner: QueryRunner): Promise<FileEntry> {
        const repo = this.getFileEntryRepository(runner.manager);
        const user = response.locals.user as User;
        if (user.avatar === null || user.avatar.id === null) {
            throw new NotFoundError('User avatar not found');
        }
        return await repo.getFileEntry(user.avatar.id);
    }

    protected getFileEntryRepository(manager: EntityManager): FileEntryRepository<AvatarFileEntry> {
        return manager.getCustomRepository(AvatarFileEntryRepository);
    }

    protected getEntity(resLocals: any): User {
        return resLocals.user;
    }

    protected getResponseBuilder(querySelect?: IQuerySelect): ResponseBuilder<unknown> {
        return new UserAvatarResponseBuilder(querySelect);
    }
}
