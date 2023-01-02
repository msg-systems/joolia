import { respond, withTransaction } from './utils';
import { NextFunction, Request, Response } from 'express';
import { SubmissionRepo, TeamRepository, TeamSubmissionRepo, UserSubmissionRepo } from '../repositories';
import { NotFoundError } from '../errors';
import {
    Activity,
    ActivityConfiguration,
    Format,
    Submission,
    SubmissionModifySetting,
    SubmissionViewSetting,
    Team,
    TeamSubmission,
    User,
    UserSubmission
} from '../models';
import { QueryRunner } from 'typeorm';
import { PostSubmissionResponseBuilder, SubmissionResponseBuilder } from '../responses';
import { isOrganizer, isTechnicalUser } from '../utils/helpers';

export class SubmissionController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const user = req.user as User;
                const activity = res.locals.activity as Activity;
                const activityCfg = activity.configuration as ActivityConfiguration;
                const repo = runner.manager.getCustomRepository(SubmissionRepo);

                let submissions, count;

                if (isOrganizer(res) || isTechnicalUser(res) || activityCfg.submissionViewSetting === SubmissionViewSetting.MEMBER) {
                    [submissions, count] = await repo.getEntities(activity, req.query);
                } else {
                    [submissions, count] = await repo.getEntities(activity, req.query, user);
                }

                const builder = new SubmissionResponseBuilder(req.query);
                respond(res, builder.buildMany(submissions, count));
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

                let repo;
                let submission;

                if (activityCfg.submissionModifySetting === SubmissionModifySetting.TEAM) {
                    repo = runner.manager.getCustomRepository(TeamSubmissionRepo);
                    const submittingTeam = await runner.manager.getCustomRepository(TeamRepository).getEntity(submittedById);
                    submission = new TeamSubmission({
                        ...req.body,
                        team: submittingTeam,
                        createdBy: req.user,
                        activity: activity
                    });
                } else {
                    repo = runner.manager.getCustomRepository(UserSubmissionRepo);
                    const submittingUser = await runner.manager.getRepository(User).findOne(submittedById);
                    submission = new UserSubmission({
                        ...req.body,
                        user: submittingUser,
                        createdBy: req.user,
                        activity: activity
                    });
                }

                await repo.saveEntity(submission);
                const builder = new PostSubmissionResponseBuilder();
                respond(res, builder.buildOne(submission), 201);
            },
            res,
            next
        );
    }

    public static async getSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const activity = res.locals.activity as Activity;
                const activityCfg = activity.configuration as ActivityConfiguration;

                const repo =
                    activityCfg.submissionModifySetting === SubmissionModifySetting.TEAM
                        ? runner.manager.getCustomRepository(TeamSubmissionRepo)
                        : runner.manager.getCustomRepository(UserSubmissionRepo);

                const submission = await repo.getEntity(req.params.submissionId);

                if (!submission) {
                    throw new NotFoundError('Submission not found');
                }

                res.locals.submission = submission;
            },
            res,
            next
        );
    }

    public static async show(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (): Promise<void> => {
                const submission = res.locals.submission;
                const builder = new SubmissionResponseBuilder(req.query);
                respond(res, builder.buildOne(submission));
            },
            res,
            next
        );
    }

    public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const activityCfg = res.locals.activity.configuration as ActivityConfiguration;

                const repo =
                    activityCfg.submissionModifySetting === SubmissionModifySetting.TEAM
                        ? runner.manager.getCustomRepository(TeamSubmissionRepo)
                        : runner.manager.getCustomRepository(UserSubmissionRepo);

                await repo.deleteEntity(res.locals.submission.id);
                respond(res);
            },
            res,
            next
        );
    }

    public static async patchSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const submission = res.locals.submission as Submission;
                const activityCfg = res.locals.activity.configuration as ActivityConfiguration;

                const repo =
                    activityCfg.submissionModifySetting === SubmissionModifySetting.TEAM
                        ? runner.manager.getCustomRepository(TeamSubmissionRepo)
                        : runner.manager.getCustomRepository(UserSubmissionRepo);

                const patchedSubmission = await repo.patchEntity(submission, req.body);
                respond(res, patchedSubmission);
            },
            res,
            next
        );
    }

    public static async getFormatSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const format = res.locals.format as Format;

                const [submissions, count] = await runner.manager.getCustomRepository(SubmissionRepo).getEntities(format, req.query);

                const builder = new SubmissionResponseBuilder(req.query);
                respond(res, builder.buildMany(submissions, count));
            },
            res,
            next
        );
    }

    public static async getTeamSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const team = res.locals.team as Team;

                const [submissions, count] = await runner.manager.getCustomRepository(SubmissionRepo).getEntities(team, req.query);

                const builder = new SubmissionResponseBuilder(req.query);
                respond(res, builder.buildMany(submissions, count));
            },
            res,
            next
        );
    }

    public static async getFormatSubmissionFilterValues(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const format = res.locals.format as Format;

                const userFilterValues = await runner.manager.getCustomRepository(SubmissionRepo).getUsersWithSubmissions(format.id);
                const teamFilterValues = await runner.manager.getCustomRepository(SubmissionRepo).getTeamsWithSubmissions(format.id);
                const phaseFilterValues = await runner.manager.getCustomRepository(SubmissionRepo).getPhasesWithSubmissions(format.id);

                const filterValues = {
                    users: userFilterValues,
                    teams: teamFilterValues,
                    phases: phaseFilterValues
                };

                respond(res, filterValues);
            },
            res,
            next
        );
    }
}
