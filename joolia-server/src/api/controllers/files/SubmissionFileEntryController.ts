import { Submission, SubmissionFileEntry } from '../../models';
import { EntityManager, QueryRunner } from 'typeorm';
import { FileEntryRepository, SubmissionFileEntryRepository } from '../../repositories/FileEntryRepository';
import { NextFunction, Request, Response } from 'express';
import { AbstractFileEntryController } from './AbstractFileController';
import { SubmissionRepo } from '../../repositories';
import { withTransaction } from '../utils';

export class SubmissionFileEntryController extends AbstractFileEntryController<SubmissionFileEntry> {
    protected getFileEntryRepository(manager: EntityManager): FileEntryRepository<SubmissionFileEntry> {
        return manager.getCustomRepository(SubmissionFileEntryRepository);
    }

    protected getEntity(resLocals: any): Submission {
        return resLocals.submission;
    }

    protected async createFileEntry(request: Request, response: Response, runner: QueryRunner): Promise<SubmissionFileEntry> {
        const submission = response.locals.submission as Submission;

        const patchedFileCount = {
            fileCount: ++submission.fileCount
        };
        await runner.manager.getCustomRepository(SubmissionRepo).patchEntity(submission, patchedFileCount);

        const fileEntry = new SubmissionFileEntry({
            ...request.body,
            submission: submission,
            createdBy: request.user
        });

        await runner.manager.save(fileEntry);

        return fileEntry;
    }

    public async decreaseSubmissionFileCount(_request: Request, response: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const submission = response.locals.submission as Submission;
                const patchedFileCount = {
                    fileCount: --submission.fileCount
                };
                await runner.manager.getCustomRepository(SubmissionRepo).patchEntity(submission, patchedFileCount);
            },
            response,
            next
        );
    }
}
