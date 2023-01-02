import { NextFunction, Request, Response } from 'express';
import { Submission, UserRating } from '../models';
import { QueryRunner } from 'typeorm';
import { UserRatingResponseBuilder } from '../responses';
import { UserRatingRepository } from '../repositories/UserRatingRepository';
import { respond, withErrorHandler, withTransaction } from './utils';
import { SubmissionRepo } from '../repositories';

export class UserRatingController {
    public static async getRating(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const submission = res.locals.submission as Submission;

                const repo = runner.manager.getCustomRepository(UserRatingRepository);
                res.locals.rating = await repo.getEntity(submission, req.user);
            },
            res,
            next
        );
    }

    public static async showRating(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async (): Promise<void> => {
                const rating = res.locals.rating;
                if (rating) {
                    const builder = new UserRatingResponseBuilder(req.query);
                    respond(res, builder.buildOne(rating), 200);
                } else {
                    respond(res, {}, 200);
                }
            },
            res,
            next
        );
    }

    public static async patchRating(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const repo = runner.manager.getCustomRepository(UserRatingRepository);
                const submission = res.locals.submission as Submission;
                let rating = res.locals.rating as UserRating;

                const [ratings, count] = await repo.getSubmissionRatings(submission);
                let sum = 0;
                ratings.forEach((rating: UserRating) => {
                    sum += rating.rating;
                });

                // create rating if it does not exist
                if (!rating) {
                    const patchedAverageRating = {
                        averageRating: (sum + req.body.rating) / (count + 1)
                    };
                    await runner.manager.getCustomRepository(SubmissionRepo).patchEntity(submission, patchedAverageRating);

                    rating = new UserRating({
                        ...req.body,
                        createdBy: req.user,
                        submission
                    });
                    await repo.saveEntity(rating);
                    await repo.getEntity(submission, req.user);
                } else {
                    const patchedAverageRating = {
                        averageRating: (sum + req.body.rating - rating.rating) / count
                    };
                    await runner.manager.getCustomRepository(SubmissionRepo).patchEntity(submission, patchedAverageRating);

                    await repo.patchEntity(rating, req.body);
                }
                rating = await repo.getEntity(submission, req.user);
                const builder = new UserRatingResponseBuilder();
                respond(res, builder.buildOne(rating), 200);
            },
            res,
            next
        );
    }
}
