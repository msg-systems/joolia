import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, NotFoundError } from '../errors';
import { LibraryRepo, LibraryViewRepo } from '../repositories';
import { respond, withErrorHandler, withTransaction } from './utils';
import { LibraryRequestBuilder, LibraryViewResponseBuilder } from '../responses';
import { isMember } from '../utils/helpers';

//TODO: Controllers can be merged / consider merging the repositories also
export class LibraryViewController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const repo = runner.manager.getCustomRepository(LibraryViewRepo);
                const [librariesView, count] = await repo.getEntities(req.user.id, req.query);
                const builder = new LibraryViewResponseBuilder(req.query);
                respond(res, builder.buildMany(librariesView, count));
            },
            res,
            next
        );
    }

    public static async getLibraryView(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const repo = runner.manager.getCustomRepository(LibraryViewRepo);
                res.locals.libraryView = await repo.getEntity(res.locals.library.id);
            },
            res,
            next
        );
    }

    public static async showLibraryView(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async (): Promise<void> => {
                const resBuilder = new LibraryViewResponseBuilder(req.query);
                respond(res, resBuilder.buildOne(res.locals.libraryView));
            },
            res,
            next
        );
    }
}

export class LibraryController {
    public static async getLibrary(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const repo = runner.manager.getCustomRepository(LibraryRepo);
                const library = await repo.getEntity(req.params.libraryId);

                if (!library) {
                    throw new NotFoundError('Library not found');
                }

                if (!isMember(req.user, library)) {
                    throw new ForbiddenError('Not a member of the library');
                }

                res.locals.library = library;
            },
            res,
            next
        );
    }

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const reqBuilder = new LibraryRequestBuilder();
                const library = reqBuilder.buildOne(req.body);
                library.createdBy = req.user;
                library.members = [req.user];

                const libraryRepo = runner.manager.getCustomRepository(LibraryRepo);
                await libraryRepo.saveEntity(library);

                const libraryViewRepo = runner.manager.getCustomRepository(LibraryViewRepo);
                const libraryView = await libraryViewRepo.getEntity(library.id);

                const resBuilder = new LibraryViewResponseBuilder();
                respond(res, resBuilder.buildOne(libraryView), 201);
            },
            res,
            next
        );
    }

    public static async patchLibrary(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const patchResult = await runner.manager.getCustomRepository(LibraryRepo).patchEntity(res.locals.library.id, req.body);
                respond(res, patchResult);
            },
            res,
            next
        );
    }

    public static async deleteLibrary(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                await runner.manager.getCustomRepository(LibraryRepo).deleteEntity(res.locals.library.id);
                respond(res);
            },
            res,
            next
        );
    }
}
