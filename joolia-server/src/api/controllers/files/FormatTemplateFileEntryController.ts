import { Format, FormatTemplateFileEntry } from '../../models';
import { EntityManager } from 'typeorm';
import { FileEntryRepository, FormatTemplateFileEntryRepository } from '../../repositories/FileEntryRepository';
import { AbstractFileEntryController } from './AbstractFileController';

export class FormatTemplateFileEntryController extends AbstractFileEntryController<FormatTemplateFileEntry> {
    protected getFileEntryRepository(manager: EntityManager): FileEntryRepository<FormatTemplateFileEntry> {
        return manager.getCustomRepository(FormatTemplateFileEntryRepository);
    }

    protected getEntity(resLocals: any): Format {
        return resLocals.formatTemplate;
    }

    protected async createFileEntry(): Promise<FormatTemplateFileEntry> {
        /**
         * Currently there is no API method to create files in templates.
         */
        throw new Error('Not supported.');
    }
}
