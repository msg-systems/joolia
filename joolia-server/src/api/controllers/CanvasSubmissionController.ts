import { respond, respondAndNotify, withTransaction } from './utils';
import { NextFunction, Request, Response } from 'express';
import {
    Activity,
    ActivityConfiguration,
    Canvas,
    CanvasSlot,
    CanvasSubmission,
    CanvasSubmissionVote,
    SubmissionModifySetting,
    SubmissionViewSetting,
    TeamCanvasSubmission,
    User,
    UserCanvasSubmission
} from '../models';
import { QueryRunner } from 'typeorm';
import { isOrganizer } from '../utils/helpers';
import {
    CanvasSubmissionRepository,
    CanvasSubmissionVoteRepository,
    TeamCanvasSubmissionRepo,
    TeamRepository,
    UserCanvasSubmissionRepo
} from '../repositories';
import { CanvasSubmissionResponseBuilder } from '../responses';
import { NotFoundError } from '../errors';
import * as httpStatus from 'http-status';

export class CanvasSubmissionController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const user = req.user as User;
                const activity = res.locals.activity as Activity;
                const canvas = res.locals.canvas as Canvas;
                const activityCfg = activity.configuration as ActivityConfiguration;
                const userIsOrganizer = isOrganizer(res);
                const repo = runner.manager.getCustomRepository(CanvasSubmissionRepository);

                let canvasSubmissions, count;

                if (userIsOrganizer || activityCfg.submissionViewSetting === SubmissionViewSetting.MEMBER) {
                    [canvasSubmissions, count] = await repo.getEntities(canvas, req.query);
                } else {
                    [canvasSubmissions, count] = await repo.getEntities(canvas, req.query, user);
                }

                const builder = new CanvasSubmissionResponseBuilder(req.query, user);
                respond(res, builder.buildMany(canvasSubmissions, count));
            },
            res,
            next
        );
    }

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const activity = res.locals.activity as Activity;
                const activityCfg = activity.configuration as ActivityConfiguration;
                const submittedById = req.body.submittedById;
                const slot = res.locals.slot as CanvasSlot;

                let repo;
                let canvasSubmission;

                if (activityCfg.submissionModifySetting === SubmissionModifySetting.TEAM) {
                    repo = runner.manager.getCustomRepository(TeamCanvasSubmissionRepo);
                    const submittingTeam = await runner.manager.getCustomRepository(TeamRepository).getEntity(submittedById);
                    canvasSubmission = new TeamCanvasSubmission({
                        ...req.body,
                        team: submittingTeam,
                        createdBy: req.user,
                        slot: slot
                    });
                } else {
                    repo = runner.manager.getCustomRepository(UserCanvasSubmissionRepo);
                    const submittingUser = await runner.manager.getRepository(User).findOne(submittedById);
                    canvasSubmission = new UserCanvasSubmission({
                        ...req.body,
                        user: submittingUser,
                        createdBy: req.user,
                        slot: slot
                    });
                }

                await repo.saveEntity(canvasSubmission);

                const builder = new CanvasSubmissionResponseBuilder(req.query);
                respondAndNotify(res, builder.buildOne(canvasSubmission), httpStatus.CREATED);
            },
            res,
            next
        );
    }

    public static async getCanvasSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const canvasSubmission = await runner.manager
                    .getCustomRepository(CanvasSubmissionRepository)
                    .getEntity(req.params.submissionId);
                if (!canvasSubmission) {
                    throw new NotFoundError(`Canvas submission ${req.params.canvasId} not found`);
                }
                res.locals.submission = canvasSubmission;
            },
            res,
            next
        );
    }

    public static async patchCanvasSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const canvasSubmission = res.locals.submission as CanvasSubmission;
                const repo = runner.manager.getCustomRepository(CanvasSubmissionRepository);
                const patchedCanvas = await repo.patchEntity(canvasSubmission, req.body);
                respondAndNotify(res, patchedCanvas, httpStatus.OK);
            },
            res,
            next
        );
    }

    public static async deleteCanvasSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const repo = runner.manager.getCustomRepository(CanvasSubmissionRepository);
                await repo.deleteEntity(res.locals.submission);
                respondAndNotify(res);
            },
            res,
            next
        );
    }

    public static async postCanvasSubmissionVote(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const canvasSubmission = res.locals.submission as CanvasSubmission;
                const user = req.user as User;

                const repo = runner.manager.getCustomRepository(CanvasSubmissionVoteRepository);
                const canvasSubmissionVote = await repo.getEntityByUser(canvasSubmission, user);

                if (!canvasSubmissionVote) {
                    const newCanvasSubmissionVote = new CanvasSubmissionVote({
                        canvasSubmission: canvasSubmission,
                        createdBy: user
                    });
                    repo.saveEntity(newCanvasSubmissionVote);
                }

                respondAndNotify(res);
            },
            res,
            next
        );
    }

    public static async deleteCanvasSubmissionVote(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const canvasSubmission = res.locals.submission as CanvasSubmission;
                const user = req.user as User;

                const repo = runner.manager.getCustomRepository(CanvasSubmissionVoteRepository);
                const canvasSubmissionVote = await repo.getEntityByUser(canvasSubmission, user);

                if (canvasSubmissionVote) {
                    await repo.deleteEntity(canvasSubmissionVote);
                }

                respondAndNotify(res);
            },
            res,
            next
        );
    }
}
