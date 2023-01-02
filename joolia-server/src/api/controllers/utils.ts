import { NextFunction, Response } from 'express';
import { QueryRunner } from 'typeorm';
import { TargetNotification } from '../services/notification/utils';
import * as moment from 'moment';
import * as httpStatus from 'http-status';

// eslint-disable-next-line @typescript-eslint/ban-types
export async function withErrorHandler(fn: Function, response: Response, next?: NextFunction): Promise<void> {
    try {
        await fn();

        const hasNotification = response.locals.notification !== undefined;

        if (next && (!response.headersSent || hasNotification)) {
            next();
        }
    } catch (err) {
        if (next) {
            return next(err);
        }
    }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export async function withTransaction(fn: Function, response: Response, next?: NextFunction): Promise<void> {
    const runner: QueryRunner = response.locals.queryRunner;

    if (!runner) {
        throw new Error(`No query runner found (${response.req.originalUrl})`);
    }

    if (response.req.user) {
        const userId = response.req.user.id;
        const requestId = response.req.jooliaRequestId;
        /**
         * These session parameters are used in the Triggers & Stored procedures.
         */
        await runner.query('SET @joolia_user_id = ?;', [userId]);
        await runner.query('SET @joolia_request_id = ?;', [requestId]);
    }

    try {
        await fn(runner);

        const hasNotification = response.locals.notification !== undefined;

        if (next && (!response.headersSent || hasNotification)) {
            next();
        }
    } catch (err) {
        if (next) {
            return next(err);
        }
    }
}

export function respond(response: Response, data?, status?): void {
    if (data) {
        response.status(status || 200).json(data);
    } else {
        response.status(204).send();
    }
}

export function respondAndNotify(response: Response, data?, status?): void {
    respond(response, data, status);

    const method = response.req.method;

    /**
     * If there is a NotificationController attached the notification will be sent.
     */
    switch (method) {
        case 'PUT':
        case 'POST':
            response.locals.notification = TargetNotification.CREATED;
            break;
        case 'DELETE':
            response.locals.notification = TargetNotification.DELETED;
            break;
        case 'PATCH':
            response.locals.notification = TargetNotification.UPDATED;
            break;
    }
}

export function respondCached(response: Response, data, maxAge = 300): void {
    response.set({ 'Cache-Control': `max-age=${maxAge}` });
    response.status(httpStatus.OK).json(data);
}

export function respondNoCache(response: Response, data?, status?): void {
    response.set({ 'Cache-Control': 'no-cache' });
    respond(response, data, status);
}

/**
 * Converts days to seconds.
 */
export function days(d: number): number {
    return moment.duration(d, 'days').asSeconds();
}

export const SEVEN_DAYS = days(7);
