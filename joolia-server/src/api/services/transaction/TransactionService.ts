import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../logger';
import { getConnection, QueryRunner } from 'typeorm';

const successHTTPRegexp = new RegExp(/20[0-8]|226|304|302/);

function hasSucceeded(response: Response): boolean {
    /**
     * Overrides decision based on HTTP Status and commit the transaction.
     */
    if (response.locals.commitTransaction === true) {
        return true;
    }

    return successHTTPRegexp.test(response.statusCode.toString());
}

enum IsolationLevel {
    READ_UNCOMMITTED = 'READ UNCOMMITTED',
    READ_COMMITTED = 'READ COMMITTED',
    REPEATABLE_READ = 'REPEATABLE READ',
    SERIALIZABLE = 'SERIALIZABLE'
}

export async function startTransaction(): Promise<QueryRunner> {
    const conn = await getConnection();
    const queryRunner: QueryRunner = await conn.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(IsolationLevel.READ_COMMITTED);
    logger.silly('Transaction started');
    return queryRunner;
}

export async function finishTransaction(queryRunner: QueryRunner, succeeded: boolean, name?: string): Promise<void> {
    const transactionName = name || queryRunner.connection.name;

    if (queryRunner.isReleased) {
        logger.warn('Trying to release a transaction again!');
    } else {
        try {
            logger.silly('Finishing transaction (%s) (%s)', queryRunner.connection.name, transactionName);

            if (!succeeded) {
                if (queryRunner.isTransactionActive) {
                    logger.silly('Rolling back transaction (%s) (%s)', queryRunner.connection.name, transactionName);
                    await queryRunner.rollbackTransaction();
                }
            } else if (queryRunner.isTransactionActive) {
                await queryRunner.commitTransaction();
                logger.silly('Transaction committed (%s) (%s)', queryRunner.connection.name, transactionName);
            }
        } finally {
            await queryRunner.release();
            logger.silly('Connection released (%s) (%s)', queryRunner.connection.name, transactionName);
        }
    }
}

export function transaction() {
    return async (request: Request, response: Response, next: NextFunction) => {
        response.on('finish', async () => {
            await TransactionHandler.finishTransaction(request, response, next);
        });
        await TransactionHandler.startTransaction(request, response, next);
    };
}

class TransactionHandler {
    public static async startTransaction(request: Request, response: Response, next: NextFunction): Promise<void> {
        logger.silly('Starting a new transaction (%s %s)', request.method, request.path);

        if (response.locals.queryRunner) {
            throw new Error(`Cannot override query runner instance (${request.path}). Possible Connection Leak!`);
        }

        try {
            response.locals.queryRunner = await startTransaction();
            next();
        } catch (err) {
            next(err);
        }
    }

    public static async finishTransaction(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const queryRunner: QueryRunner = response.locals.queryRunner;

            if (!queryRunner) {
                logger.silly('No transaction started (%s)', request.path);
                return next();
            }

            await finishTransaction(queryRunner, hasSucceeded(response), request.path);

            if (!response.headersSent) {
                return next();
            }
        } catch (err) {
            logger.error('Fail to finish transaction.', err);
            return next(err);
        }
    }
}
