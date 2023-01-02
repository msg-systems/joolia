import { FileEntry, Team, TeamAvatarFileEntry } from '../../models';
import { Request, Response } from 'express';
import { EntityManager, QueryRunner } from 'typeorm';
import { FileEntryRepository, TeamAvatarFileEntryRepository } from '../../repositories/FileEntryRepository';
import { AbstractFileEntryController } from './AbstractFileController';
import { NotFoundError } from '../../errors';

export class TeamAvatarFileEntryController extends AbstractFileEntryController<TeamAvatarFileEntry> {
    protected async createFileEntry(request: Request, response: Response, runner: QueryRunner): Promise<TeamAvatarFileEntry> {
        const team = this.getEntity(response.locals);
        const fileEntry = new TeamAvatarFileEntry({
            ...request.body,
            createdBy: request.user
        });
        team.avatar = fileEntry;
        await runner.manager.save([fileEntry, team]);
        return fileEntry;
    }

    protected async getFileEntry(request: Request, response: Response, runner: QueryRunner): Promise<FileEntry> {
        const repo = this.getFileEntryRepository(runner.manager);
        const team = response.locals.team as Team;
        if (team.avatar === null || team.avatar.id === null) {
            throw new NotFoundError('Team Avatar not found');
        }
        return await repo.getFileEntry(team.avatar.id);
    }

    protected getFileEntryRepository(manager: EntityManager): FileEntryRepository<TeamAvatarFileEntry> {
        return manager.getCustomRepository(TeamAvatarFileEntryRepository);
    }

    protected getEntity(resLocals: any): Team {
        return resLocals.team;
    }
}
