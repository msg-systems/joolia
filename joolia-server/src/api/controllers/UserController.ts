import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors';
import { User } from '../models';
import { UserRepo } from '../repositories';
import { respond, withErrorHandler, withTransaction } from './utils';
import { UserResponseBuilder } from '../responses';

export class UserController {
    public static async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                res.locals.user = await runner.manager.getCustomRepository(UserRepo).getEntity(req.params.userId);
                if (!res.locals.user) {
                    throw new NotFoundError('User not found.');
                }
            },
            res,
            next
        );
    }

    public static async showUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            () => {
                const builder = new UserResponseBuilder(req.query);
                respond(res, builder.buildOne(res.locals.user), 200);
            },
            res,
            next
        );
    }

    public static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const user = res.locals.user as User;
                const repo: UserRepo = runner.manager.getCustomRepository(UserRepo);
                await repo.deleteEntity(user);
                respond(res);
            },
            res,
            next
        );
    }

    public static async checkEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const repo = runner.manager.getCustomRepository(UserRepo);
                const userExists = await repo.userExists(req.query.email);
                respond(res, { emailAvailable: !userExists });
            },
            res,
            next
        );
    }

    public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const user = req.user as User;
                const repo: UserRepo = runner.manager.getCustomRepository(UserRepo);
                const patched = await repo.patchEntity(user, req.body);
                respond(res, patched, 200);
            },
            res,
            next
        );
    }
}
