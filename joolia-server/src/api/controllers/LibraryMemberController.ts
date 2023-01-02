import { NextFunction, Request, Response } from 'express';
import { respond, withErrorHandler, withTransaction } from './utils';
import { BadRequestError } from '../errors';
import { Library } from '../models';
import { UserRepo } from '../repositories';
import { InvitationService } from '../services/invitation';
import { UserResponseBuilder } from '../responses';
import { UserMemberRepository } from '../repositories/UserMemberRepository';
import { QueryRunner } from 'typeorm';
import { logger } from '../../logger';

export class LibraryMemberController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const library = res.locals.library as Library;
                const repo = runner.manager.getCustomRepository(UserRepo);
                const [members, count] = await repo.getEntities(req.query, library);
                const builder = new UserResponseBuilder(req.query);
                respond(res, builder.buildMany(members, count));
            },
            res,
            next
        );
    }

    public static async addMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const library = res.locals.library as Library;
                await InvitationService.add(library, req);
                respond(res);
            },
            res,
            next
        );
    }

    public static async deleteMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const library = res.locals.library as Library;
                const emails = req.body.emails;

                if (library.members.length == 1) {
                    throw new BadRequestError('The library must have at least one member');
                } else {
                    const repo = runner.manager.getCustomRepository(UserRepo);
                    const membersToRemove = await repo.countUsers(emails, library);

                    if (membersToRemove > 0) {
                        if (library.members.length - membersToRemove === 0) {
                            throw new BadRequestError('The library must have at least one member');
                        }

                        const userMemberRepo = runner.manager.getCustomRepository(UserMemberRepository);
                        await userMemberRepo.deleteLibraryMembers(library, emails);
                    } else {
                        logger.warn('User(s) %o not found.', emails);
                    }
                }

                respond(res);
            },
            res,
            next
        );
    }
}
