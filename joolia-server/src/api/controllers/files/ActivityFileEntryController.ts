import { Activity, ActivityFileEntry } from '../../models';
import { EntityManager, QueryRunner } from 'typeorm';
import { ActivityFileEntryRepository, FileEntryRepository } from '../../repositories/FileEntryRepository';
import { Request, Response } from 'express';
import { AbstractFileEntryController } from './AbstractFileController';

export class ActivityFileEntryController extends AbstractFileEntryController<ActivityFileEntry> {
    protected getFileEntryRepository(manager: EntityManager): FileEntryRepository<ActivityFileEntry> {
        return manager.getCustomRepository(ActivityFileEntryRepository);
    }

    protected getEntity(resLocals: any): Activity {
        return resLocals.activity;
    }

    protected async createFileEntry(request: Request, response: Response, runner: QueryRunner): Promise<ActivityFileEntry> {
        const fileEntry = new ActivityFileEntry({
            ...request.body,
            createdBy: request.user,
            activity: response.locals.activity
        });

        await runner.manager.save(fileEntry);
        return fileEntry;
    }
}
