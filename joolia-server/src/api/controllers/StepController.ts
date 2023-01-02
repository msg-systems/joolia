import { respond, withTransaction } from './utils';
import { NextFunction, Request, Response } from 'express';
import { FormatMemberRepo, StepRepo, TeamRepository } from '../repositories';
import { Activity, ActivityConfiguration, Format, Step, SubmissionModifySetting, User } from '../models';
import { PostStepResponseBuilder, StepResponseBuilder } from '../responses';
import { BadRequestError, NotFoundError } from '../errors';
import { MemberStepCheckRepo, TeamStepCheckRepo } from '../repositories/StepCheckRepo';

export class StepController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const activity = res.locals.activity as Activity;
                const [steps, count] = await runner.manager.getCustomRepository(StepRepo).getEntities(req.query, activity);
                const builder = new StepResponseBuilder(req.query);
                respond(res, builder.buildMany(steps, count), 200);
            },
            res,
            next
        );
    }

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const createdBy = req.user as User;
                const activity = res.locals.activity as Activity;
                const repo = runner.manager.getCustomRepository(StepRepo);

                const step = new Step({ ...req.body, activity, createdBy });
                step.position = await repo.getNextPosition(activity);

                await repo.saveEntity(step);

                const builder = new PostStepResponseBuilder();
                respond(res, builder.buildOne(step), 201);
            },
            res,
            next
        );
    }

    public static async getStep(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const activity = res.locals.activity as Activity;
                const repo = runner.manager.getCustomRepository(StepRepo);

                const step = await repo.getEntity(req.query, activity, req.params.stepId);

                if (!step) {
                    throw new NotFoundError('Step not found');
                }

                res.locals.step = step;
            },
            res,
            next
        );
    }

    public static async patchStep(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const step = res.locals.step as Step;
                const repo = runner.manager.getCustomRepository(StepRepo);
                const patched = await repo.patchEntity(step, req.body);
                const builder = new StepResponseBuilder();
                respond(res, builder.buildOne(patched), 200);
            },
            res,
            next
        );
    }

    /**
     *  Checks or "unchecks" the step for the given User or Team.
     */
    public static async checkStep(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const checkedById = req.body.checkedById; // Can be a user id or a team id
                const step = res.locals.step as Step;
                const format = res.locals.format as Format;
                const activity = res.locals.activity as Activity;
                const activityCfg = activity.configuration as ActivityConfiguration;
                const isTeamStepCheck = activityCfg.submissionModifySetting === SubmissionModifySetting.TEAM;

                const stepCheckRepo = isTeamStepCheck
                    ? runner.manager.getCustomRepository(TeamStepCheckRepo)
                    : runner.manager.getCustomRepository(MemberStepCheckRepo);

                let checkingTeam, checkingMember;

                if (isTeamStepCheck) {
                    checkingTeam = await runner.manager.getCustomRepository(TeamRepository).getEntity(checkedById);
                    if (!checkingTeam) {
                        throw new BadRequestError('Team not found');
                    }
                } else {
                    checkingMember = await runner.manager.getCustomRepository(FormatMemberRepo).getEntity(format, checkedById);
                    if (!checkingMember) {
                        throw new BadRequestError('Member not found');
                    }
                }

                const stepCheck = await stepCheckRepo.getEntity(step, checkedById); // If this relation exists means checked

                if (req.body.done) {
                    if (!stepCheck) {
                        await stepCheckRepo.check(step, checkingTeam || checkingMember);
                        respond(res, req.body, 201);
                    } else {
                        respond(res, req.body, 200);
                    }
                } else {
                    if (stepCheck) {
                        await stepCheckRepo.uncheck(stepCheck);
                        respond(res, req.body, 201);
                    } else {
                        respond(res, req.body, 200);
                    }
                }
            },
            res,
            next
        );
    }

    public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const repo = runner.manager.getCustomRepository(StepRepo);
                await repo.updatePositionAnDelete(res.locals.step);
                respond(res);
            },
            res,
            next
        );
    }
}
