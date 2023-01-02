import { TeamFileEntry } from '../../models';
import { Request, Response } from 'express';
import { EntityManager, QueryRunner } from 'typeorm';
import { FileEntryRepository, TeamFileEntryRepository } from '../../repositories/FileEntryRepository';
import { AbstractModel } from '../../models/AbstractModel';
import { AbstractFileEntryController } from './AbstractFileController';

export class TeamFileEntryController extends AbstractFileEntryController<TeamFileEntry> {
    protected async createFileEntry(request: Request, response: Response, runner: QueryRunner): Promise<TeamFileEntry> {
        const fileEntry = new TeamFileEntry({
            ...request.body,
            createdBy: request.user,
            team: response.locals.team
        });

        await runner.manager.save(fileEntry);
        return fileEntry;
    }

    protected getFileEntryRepository(manager: EntityManager): FileEntryRepository<TeamFileEntry> {
        return manager.getCustomRepository(TeamFileEntryRepository);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    protected getEntity(resLocals: any): AbstractModel<{}> {
        return resLocals.team;
    }
}
