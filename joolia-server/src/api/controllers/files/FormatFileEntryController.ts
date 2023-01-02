import { Format, FormatFileEntry } from '../../models';
import { EntityManager, QueryRunner } from 'typeorm';
import { FileEntryRepository, FormatFileEntryRepository } from '../../repositories/FileEntryRepository';
import { Request, Response } from 'express';
import { AbstractFileEntryController } from './AbstractFileController';

export class FormatFileEntryController extends AbstractFileEntryController<FormatFileEntry> {
    protected getFileEntryRepository(manager: EntityManager): FileEntryRepository<FormatFileEntry> {
        return manager.getCustomRepository(FormatFileEntryRepository);
    }

    protected getEntity(resLocals: any): Format {
        return resLocals.format;
    }

    protected async createFileEntry(request: Request, response: Response, runner: QueryRunner): Promise<FormatFileEntry> {
        const fileEntry = new FormatFileEntry({
            ...request.body,
            createdBy: request.user,
            format: response.locals.format
        });

        await runner.manager.save(fileEntry);
        return fileEntry;
    }
}
