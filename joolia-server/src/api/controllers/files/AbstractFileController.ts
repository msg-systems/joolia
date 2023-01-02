import { NextFunction, Request, Response } from 'express';
import { FileEntry } from '../../models';
import { respond, respondCached, withErrorHandler, withTransaction } from '../utils';
import { EntityManager, QueryRunner } from 'typeorm';
import { NotFoundError } from '../../errors';
import { FileEntryRepository } from '../../repositories/FileEntryRepository';
import { FileService } from '../../services';
import { AbstractModel } from '../../models/AbstractModel';
import { FileEntryResponseBuilder, PatchFileEntryResponseBuilder } from '../../responses';
import { IQuerySelect, ResponseBuilder } from '../../responses/builder';

export interface FileEntryControllerOptions {
    addContentDispositionHeaders: boolean;
}

/**
 * Controllers that need to deal with the stored files should inherit from this class and override the necessary methods.
 * It is possible to override the public methods but not recommended, such cases should raise attention for possible adjustments and
 * refactorings.
 */
export abstract class AbstractFileEntryController<T extends FileEntry> {
    public constructor(
        public fileService: FileService,
        public options: FileEntryControllerOptions = { addContentDispositionHeaders: true }
    ) {}

    /**
     * Renders the response for a single file entry with the fileUrl for secure access.
     *
     * @see FileEntry
     */
    public async showFile(request: Request, response: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const downloadParam = request.query.download as boolean;
                const fileEntry: FileEntry = response.locals.fileEntry;
                fileEntry.fileUrl = await this.fileService.createAccessUrl(fileEntry, downloadParam);
                const builder = this.getResponseBuilder();
                if (response.locals.noCachefileEntry) {
                    respond(response, builder.buildOne(fileEntry));
                } else {
                    respondCached(response, builder.buildOne(fileEntry));
                }
            },
            response,
            next
        );
    }

    /**
     * Sets the requested FileEntry in response.locals for further reuse in subsequent calls.
     *
     * @see FileEntry
     */
    public async getFile(request: Request, response: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const fileEntry = await this.getFileEntry(request, response, runner);

                if (!fileEntry) {
                    throw new NotFoundError('File not found');
                }

                response.locals.fileEntry = fileEntry;
            },
            response,
            next
        );
    }

    /**
     * Lists all files attached to the related entity. By design none of the entries have the fileUrl field.
     *
     * @see FileEntry
     */
    public async index(request: Request, response: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const repo = this.getFileEntryRepository(runner.manager);
                const fileEntries: FileEntry[] = await repo.getFileEntries(this.getEntity(response.locals).id);
                const builder = this.getResponseBuilder(request.query);
                respond(response, builder.buildMany(fileEntries));
            },
            response,
            next
        );
    }

    /**
     * Creates a new instance of FileEntry with the fileUrl for secure upload.
     *
     * @see FileEntry
     */
    public async create(request: Request, response: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const fileEntry = await this.createFileEntry(request, response, runner);

                /**
                 * FileEntry.id is required hence created here then the secure url computed.
                 * Failure to create the secure url should trigger a rollback anyway.
                 */
                fileEntry.fileUrl = await this.fileService.createUploadUrl(fileEntry);

                const builder = this.getResponseBuilder();
                respond(response, builder.buildOne(fileEntry), 201);
            },
            response,
            next
        );
    }

    /**
     * Updates the name of a single file already existing in the database.
     *
     * @see FileEntry
     */
    public async patchFile(request: Request, response: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const fileEntry = response.locals.fileEntry as FileEntry;
                fileEntry.name = request.body.name;
                await runner.manager.save(fileEntry);
                const builder = new PatchFileEntryResponseBuilder();
                respond(response, builder.buildOne(fileEntry), 200);
            },
            response,
            next
        );
    }

    /**
     * Deletes one FileEntry (also from persistence).
     *
     * @see FileEntry
     */
    public async delete(request: Request, response: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const fileEntry: FileEntry = response.locals.fileEntry;
                /**
                 *  Deletes only the desired entry matching the File Type via custom repository annotation.
                 */
                const repo = this.getFileEntryRepository(runner.manager);
                await repo.delete(fileEntry.id);

                /**
                 * If there are no other Files (of different types, see FileEntry inheritance) then the file is finally
                 * removed from the underlying storage.
                 */
                const fileEntryRepository = runner.manager.getRepository(FileEntry);
                if ((await fileEntryRepository.count({ where: { fileId: fileEntry.fileId } })) === 0) {
                    await this.fileService.deleteFile(fileEntry);
                }
                respond(response);
            },
            response,
            next
        );
    }

    /**
     * Default ResponseBuilder. Override if a different response is needed.
     */
    protected getResponseBuilder(querySelect?: IQuerySelect): ResponseBuilder<unknown> {
        return new FileEntryResponseBuilder(querySelect);
    }

    /**
     * Default implementation to fetch a FileEntry using the fileId in the request params.
     *
     * Note: If needed override to fit purpose of specific controller.
     *
     * @see FileEntry
     */
    protected async getFileEntry(request: Request, response: Response, runner: QueryRunner): Promise<FileEntry> {
        const repo = this.getFileEntryRepository(runner.manager);
        return await repo.getFileEntry(request.params.fileId);
    }

    /**
     * Returns the persisted FileEntry object.
     *
     * @see FileEntry
     */
    protected abstract createFileEntry(request: Request, response: Response, runner: QueryRunner): Promise<T>;

    /**
     * Returns the specific FileEntryRepository of this controller.
     *
     * @see FileEntryRepository
     */
    protected abstract getFileEntryRepository(manager: EntityManager): FileEntryRepository<T>;

    /**
     * Returns the entity related to the files.
     *
     * @param resLocals the locals object from the response.
     */
    protected abstract getEntity(resLocals: any): AbstractModel;
}
