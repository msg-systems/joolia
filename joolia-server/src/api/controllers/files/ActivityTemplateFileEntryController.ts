import { ActivityTemplateFileEntry, Format } from '../../models';
import { EntityManager } from 'typeorm';
import { ActivityTemplateFileEntryRepository, FileEntryRepository } from '../../repositories/FileEntryRepository';
import { AbstractFileEntryController } from './AbstractFileController';

export class ActivityTemplateFileEntryController extends AbstractFileEntryController<ActivityTemplateFileEntry> {
    protected getFileEntryRepository(manager: EntityManager): FileEntryRepository<ActivityTemplateFileEntry> {
        return manager.getCustomRepository(ActivityTemplateFileEntryRepository);
    }

    protected getEntity(resLocals: any): Format {
        return resLocals.activityTemplate;
    }

    protected async createFileEntry(): Promise<ActivityTemplateFileEntry> {
        throw new Error('Not implemented');
    }
}
