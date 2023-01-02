import { respond, withTransaction } from './utils';
import { NextFunction, Request, Response } from 'express';
import { ActivityCanvas, CanvasSlot } from '../models';
import { QueryRunner } from 'typeorm';
import { CanvasSlotResponseBuilder } from '../responses';
import { BadRequestError, NotFoundError } from '../errors';
import * as httpStatus from 'http-status';
import { CanvasSlotRepository } from '../repositories/CanvasSlotRepository';

export class CanvasSlotController {
    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner): Promise<void> => {
                const repo = runner.manager.getCustomRepository(CanvasSlotRepository);
                const canvasSlot = new CanvasSlot({
                    ...req.body,
                    canvas: res.locals.canvas
                });

                await repo.saveEntity(canvasSlot);
                const builder = new CanvasSlotResponseBuilder(req.query);
                respond(res, builder.buildOne(canvasSlot), httpStatus.CREATED);
            },
            res,
            next
        );
    }

    public static async getCanvasSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const canvasSlot = await runner.manager.getCustomRepository(CanvasSlotRepository).getEntity(req.params.slotId);
                if (!canvasSlot) {
                    throw new NotFoundError(`Canvas slot ${req.params.slotId} not found`);
                }
                res.locals.slot = canvasSlot;
            },
            res,
            next
        );
    }

    public static async patchCanvasSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner: QueryRunner) => {
                const canvasSlot = res.locals.slot as CanvasSlot;
                const repo = runner.manager.getCustomRepository(CanvasSlotRepository);
                const patchedSlot = await repo.patchEntity(canvasSlot, req.body);
                respond(res, patchedSlot, httpStatus.OK);
            },
            res,
            next
        );
    }

    public static async deleteCanvasSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const canvas = res.locals.canvas as ActivityCanvas;

                if (canvas.slots.length === 1) {
                    throw new BadRequestError('Last slot cannot be deleted');
                }

                const repo: CanvasSlotRepository = runner.manager.getCustomRepository(CanvasSlotRepository);
                await repo.deleteEntity(res.locals.slot);
                respond(res);
            },
            res,
            next
        );
    }
}
