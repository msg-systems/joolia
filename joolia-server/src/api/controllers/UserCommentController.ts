import { respond, withErrorHandler, withTransaction } from './utils';
import { NextFunction, Request, Response } from 'express';
import { SubmissionRepo, UserCommentRepository } from '../repositories';
import { NotFoundError } from '../errors';
import { ActivityConfiguration, Submission, SubmissionViewSetting, User, UserComment } from '../models';
import { QueryRunner } from 'typeorm';
import { isOrganizer, isTechnicalUser } from '../utils/helpers';
import { UserCommentResponseBuilder } from '../responses';

export class UserCommentController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const user = req.user as User;
                const submission = res.locals.submission as Submission;
                const activityCfg = res.locals.activity.configuration as ActivityConfiguration;

                let comments, count;
                const repo = runner.manager.getCustomRepository(UserCommentRepository);

                if (activityCfg.submissionViewSetting === SubmissionViewSetting.MEMBER || isOrganizer(res) || isTechnicalUser(res)) {
                    [comments, count] = await repo.getEntities(req.query, submission);
                } else if (activityCfg.submissionViewSetting === SubmissionViewSetting.SUBMITTER) {
                    [comments, count] = await repo.getEntities(req.query, submission, user);
                } else {
                    throw new Error('Unexpected activity configuration');
                }

                const builder = new UserCommentResponseBuilder(req.query);
                respond(res, builder.buildMany(comments, count));
            },
            res,
            next
        );
    }

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const submission = res.locals.submission as Submission;

                const patchedCommentCount = {
                    commentCount: ++submission.commentCount
                };
                await runner.manager.getCustomRepository(SubmissionRepo).patchEntity(submission, patchedCommentCount);

                const comment = new UserComment({
                    ...req.body,
                    createdBy: req.user,
                    submission
                });

                const repo = runner.manager.getCustomRepository(UserCommentRepository);
                await repo.saveEntity(comment);
                const createdComment = await repo.getEntity(comment.id, submission);
                const builder = new UserCommentResponseBuilder();
                respond(res, builder.buildOne(createdComment), 201);
            },
            res,
            next
        );
    }

    public static async getComment(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const submission = res.locals.submission as Submission;

                const repo = runner.manager.getCustomRepository(UserCommentRepository);
                const comment = await repo.getEntity(req.params.commentId, submission);

                if (!comment) {
                    throw new NotFoundError('Comment not found');
                }

                res.locals.comment = comment;
            },
            res,
            next
        );
    }

    public static async showComment(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async (): Promise<void> => {
                const comment = res.locals.comment;
                const builder = new UserCommentResponseBuilder(req.query);
                respond(res, builder.buildOne(comment), 200);
            },
            res,
            next
        );
    }

    public static async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const submission = res.locals.submission as Submission;
                const patchedCommentCount = {
                    commentCount: --submission.commentCount
                };
                await runner.manager.getCustomRepository(SubmissionRepo).patchEntity(submission, patchedCommentCount);

                await runner.manager.getCustomRepository(UserCommentRepository).deleteEntity(res.locals.comment.id);
                respond(res);
            },
            res,
            next
        );
    }

    public static async patchComment(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const comment = res.locals.comment as UserComment;
                const repo = runner.manager.getCustomRepository(UserCommentRepository);
                const patched = await repo.patchEntity(comment, req.body);
                respond(res, patched, 200);
            },
            res,
            next
        );
    }
}
