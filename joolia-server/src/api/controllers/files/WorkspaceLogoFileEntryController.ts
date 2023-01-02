import { FileEntry, Workspace } from '../../models';
import { Request, Response } from 'express';
import { EntityManager, QueryRunner } from 'typeorm';
import { FileEntryRepository, WorkspaceLogoFileEntryRepository } from '../../repositories/FileEntryRepository';
import { AbstractFileEntryController } from './AbstractFileController';
import { WorkspaceLogoFileEntry } from '../../models';
import { NotFoundError } from '../../errors';

export class WorkspaceLogoFileEntryController extends AbstractFileEntryController<WorkspaceLogoFileEntry> {
    protected async createFileEntry(request: Request, response: Response, runner: QueryRunner): Promise<WorkspaceLogoFileEntry> {
        const workspace = this.getEntity(response.locals);
        const fileEntry = new WorkspaceLogoFileEntry({
            ...request.body,
            createdBy: request.user
        });
        workspace.logo = fileEntry;
        await runner.manager.save([fileEntry, workspace]);
        return fileEntry;
    }

    protected async getFileEntry(request: Request, response: Response, runner: QueryRunner): Promise<FileEntry> {
        const repo = this.getFileEntryRepository(runner.manager);
        const workspace = this.getEntity(response.locals);
        if (workspace.logo === null || workspace.logo.id === null) {
            throw new NotFoundError('Workspace Logo not found');
        }
        return await repo.getFileEntry(workspace.logo.id);
    }

    protected getFileEntryRepository(manager: EntityManager): FileEntryRepository<WorkspaceLogoFileEntry> {
        return manager.getCustomRepository(WorkspaceLogoFileEntryRepository);
    }

    protected getEntity(resLocals: any): Workspace {
        return resLocals.workspace;
    }
}
