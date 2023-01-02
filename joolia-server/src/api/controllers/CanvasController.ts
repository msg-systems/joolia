import { respond, withErrorHandler, withTransaction } from './utils';
import { NextFunction, Request, Response } from 'express';
import { ActivityCanvasRepo } from '../repositories';
import { Activity, ActivityCanvas, Canvas, CanvasSlot, User } from '../models';
import { QueryRunner } from 'typeorm';
import { CanvasResponseBuilder } from '../responses';
import * as httpStatus from 'http-status';
import { NotFoundError } from '../errors';
import { CanvasStatus, CanvasType } from '../models/CanvasModel';
import { isOrganizer } from '../utils/helpers';

export class CanvasController {
    public static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const activity = res.locals.activity as Activity;
                const repo = runner.manager.getCustomRepository(ActivityCanvasRepo);
                const [canvases, count] = await repo.getEntities(req.query, activity, isOrganizer(res));
                const builder = new CanvasResponseBuilder(req.query);
                respond(res, builder.buildMany(canvases, count), httpStatus.OK);
            },
            res,
            next
        );
    }

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const createdBy = req.user as User;
                const activity = res.locals.activity as Activity;
                const repo = runner.manager.getCustomRepository(ActivityCanvasRepo);
                const slotsRepo = runner.manager.getRepository(CanvasSlot);
                const canvas = new ActivityCanvas({ ...req.body, activity, createdBy });

                if (canvas.canvasType !== CanvasType.CUSTOM_CANVAS) {
                    canvas.status = CanvasStatus.PUBLISHED;
                }

                await repo.saveEntity(canvas);
                const slots = req.body.slots;
                const promises: Array<Promise<CanvasSlot>> = [];
                for (const slot of slots) {
                    const canvasSlot = new CanvasSlot({ ...slot, canvas });
                    const promise = slotsRepo.save(canvasSlot);
                    promises.push(promise);
                }
                canvas.slots = await Promise.all(promises);
                const builder = new CanvasResponseBuilder(req.query);
                respond(res, builder.buildOne(canvas), httpStatus.CREATED);
            },
            res,
            next
        );
    }

    public static async getCanvas(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const repo: ActivityCanvasRepo = runner.manager.getCustomRepository(ActivityCanvasRepo);
                const canvas = await repo.getEntity(req.params.canvasId, isOrganizer(res));
                if (!canvas) {
                    throw new NotFoundError(`Canvas ${req.params.canvasId} not found`);
                }
                res.locals.canvas = canvas;
            },
            res,
            next
        );
    }

    public static async showCanvas(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            async () => {
                const canvas = res.locals.canvas as Canvas;
                const builder = new CanvasResponseBuilder(req.query);
                respond(res, builder.buildOne(canvas), 200);
            },
            res,
            next
        );
    }

    public static async patchCanvas(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const canvas = res.locals.canvas as Canvas;
                const repo = runner.manager.getCustomRepository(ActivityCanvasRepo);
                const patchedCanvas = await repo.patchEntity(canvas, req.body);
                respond(res, patchedCanvas, 200);
            },
            res,
            next
        );
    }

    public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const canvas = res.locals.canvas as ActivityCanvas;
                await runner.manager.getCustomRepository(ActivityCanvasRepo).deleteEntity(canvas);
                respond(res);
            },
            res,
            next
        );
    }
}
