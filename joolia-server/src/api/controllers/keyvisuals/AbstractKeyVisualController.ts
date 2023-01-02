import { EntityManager, QueryRunner } from 'typeorm';
import { FileEntryRepository, KeyVisualFileEntryRepository } from '../../repositories/FileEntryRepository';
import {
    FileEntry,
    KeyVisualEntry,
    KeyVisualFile,
    KeyVisualFileEntry,
    KeyVisualLink,
    KeyVisualRelationType,
    LinkEntry
} from '../../models';
import { NextFunction, Request, Response } from 'express';
import { AbstractFileEntryController } from '../files/AbstractFileController';
import { respond, withTransaction } from '../utils';
import { FileEntryResponseBuilder, LinkEntryResponseBuilder } from '../../responses';
import { NotFoundError } from '../../errors';
import { LinkType } from '../../models/LinkModel';

export abstract class AbstractKeyVisualEntryController extends AbstractFileEntryController<KeyVisualFileEntry> {
    /**
     * Checks the body includes linkUrl to decide if we create a key visual link or file
     * @param request
     * @param response
     * @param next
     */
    public async create(request: Request, response: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                if (request.body.hasOwnProperty('linkUrl')) {
                    const linkEntry = await this.createLinkEntry(request, response, runner);
                    const builder = new LinkEntryResponseBuilder();
                    respond(response, builder.buildOne(linkEntry), 201);
                } else {
                    const fileEntry = await this.createFileEntry(request, response, runner);
                    /**
                     * FileEntry.id is required hence created here then the secure url computed.
                     * Failure to create the secure url should trigger a rollback anyway.
                     */
                    fileEntry.fileUrl = await this.fileService.createUploadUrl(fileEntry);

                    const builder = new FileEntryResponseBuilder();
                    respond(response, builder.buildOne(fileEntry), 201);
                }
            },
            response,
            next
        );
    }

    protected getFileEntryRepository(manager: EntityManager): FileEntryRepository<KeyVisualFileEntry> {
        return manager.getCustomRepository(KeyVisualFileEntryRepository);
    }

    protected async getFileEntry(request: Request, response: Response, runner: QueryRunner): Promise<FileEntry> {
        const entity = this.getEntity(response.locals) as { keyVisual?: KeyVisualEntry };
        const repo = this.getFileEntryRepository(runner.manager);
        if (!entity.keyVisual[KeyVisualRelationType.FILE]) {
            throw new NotFoundError('KeyVisual not found');
        }
        return entity.keyVisual[KeyVisualRelationType.FILE]
            ? await repo.getFileEntry(entity.keyVisual[KeyVisualRelationType.FILE].id)
            : null;
    }

    protected async createFileEntry(request: Request, response: Response, runner: QueryRunner): Promise<FileEntry> {
        const entity = this.getEntity(response.locals) as { keyVisual?: KeyVisualEntry };
        const fileEntry = new KeyVisualFileEntry({ ...request.body, createdBy: request.user });
        const keyVisualRelation = new KeyVisualFile();
        keyVisualRelation.keyVisualFile = fileEntry;
        entity.keyVisual = keyVisualRelation;
        await runner.manager.save([fileEntry, keyVisualRelation, entity]);
        return fileEntry;
    }

    protected async createLinkEntry(request: Request, response: Response, runner: QueryRunner): Promise<LinkEntry> {
        const linkEntry = new LinkEntry({ linkUrl: request.body.linkUrl, createdBy: request.user, type: LinkType.KEY_VISUAL });
        const keyVisualLink = new KeyVisualLink({ keyVisualLink: linkEntry });
        const entity = this.getEntity(response.locals) as { keyVisual?: KeyVisualEntry };
        entity.keyVisual = keyVisualLink;
        await runner.manager.save([linkEntry, keyVisualLink, entity]);
        return linkEntry;
    }
}
