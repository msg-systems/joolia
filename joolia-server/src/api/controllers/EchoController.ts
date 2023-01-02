import { NextFunction, Request, Response } from 'express';
import { respond, withErrorHandler } from './utils';
import { Echo, EchoRequestBuilder, EchoResponseBuilder } from '../responses';
import { NotFoundError } from '../errors';

/**
 * Example Controller for internal Architecture Reference.
 * Note: Is never mounted in production environment. See Router code.
 */
export class EchoController {
    private static echoes: Echo[] = [];

    public static async index(request: Request, response: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            () => {
                // Index operation should only retrieve many available
                const [count, echoes] = [EchoController.echoes.length, EchoController.echoes];

                // Answer with proper serialization
                const builder = new EchoResponseBuilder(request.query);
                const responseData = builder.buildMany(echoes, count);
                respond(response, responseData);
            },
            response,
            next
        );
    }

    public static async show(request: Request, response: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            () => {
                const echo = EchoController.echoes.find((e) => e.id === request.params.echoId);
                if (!echo) {
                    throw new NotFoundError('Not here');
                }

                // Answer with proper serialization
                const builder = new EchoResponseBuilder(request.query);
                const responseData = builder.buildOne(echo);
                respond(response, responseData);
            },
            response,
            next
        );
    }

    public static async create(request: Request, response: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            () => {
                // Retrieve obj deserializing it from body
                const requestBuilder = new EchoRequestBuilder();
                const echo: Echo = requestBuilder.buildOne(request.body);

                /**
                 * Do anything useful. Here only saves in memory.
                 */
                EchoController.echoes.push(echo);

                // Answer with proper serialization
                const builder = new EchoResponseBuilder(request.query);
                const responseData = builder.buildOne(echo);
                respond(response, responseData);
            },
            response,
            next
        );
    }
}
