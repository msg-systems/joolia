import { NextFunction, Request, Response } from 'express';
import { User } from '../models';
import { QueryRunner } from 'typeorm';
import { respond, respondCached, SEVEN_DAYS, withTransaction } from './utils';
import { SkillRepository } from '../repositories';
import { SkillResponseBuilder } from '../responses/skill.response';
import { BadRequestError } from '../errors';
import { getConf } from '../../config';

const conf = getConf();

export class SkillController {
    public static async getAllSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const repo = runner.manager.getCustomRepository(SkillRepository);
                const allSkills = await repo.getAll();
                const builder = new SkillResponseBuilder(); // Pagination, filter, select, order not needed nor implemented for this Repo
                respondCached(res, builder.buildMany(allSkills), SEVEN_DAYS);
            },
            res,
            next
        );
    }

    public static async getUserSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const user = res.locals.user as User; // Is the user in path rather the calling user.
                const repo = runner.manager.getCustomRepository(SkillRepository);
                const userSkills = await repo.getSkills(user);
                const builder = new SkillResponseBuilder();
                respondCached(res, builder.buildMany(userSkills));
            },
            res,
            next
        );
    }

    public static async addUserSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const user = req.user as User;
                const skillIds = req.body.skillIds;
                const repo = runner.manager.getCustomRepository(SkillRepository);
                const userSkills = await repo.addSkills(user, skillIds);

                if (userSkills && userSkills.length > conf.maxSkillsPerUser) {
                    throw new BadRequestError('User is too skilled ;)'); // triggers rollback of transaction
                }

                const builder = new SkillResponseBuilder();
                respond(res, builder.buildMany(userSkills));
            },
            res,
            next
        );
    }

    public static async deleteUserSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const user = req.user as User;
                const skillId = req.params.skillId;
                const repo = runner.manager.getCustomRepository(SkillRepository);
                await repo.removeSkill(user, skillId);
                respond(res);
            },
            res,
            next
        );
    }
}
