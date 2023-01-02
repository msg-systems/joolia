import { NextFunction, Request, Response } from 'express';
import { respond, withErrorHandler } from './utils';
import { Server } from '../../server';

export class RootController {
    public constructor(private server: Server) {}

    public getServerInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            () => {
                let data = {
                    info: this.server.buildInfo
                };

                if (req.query.level === 'debug') {
                    data = {
                        ...data,
                        ...this.server.getServerState()
                    };
                }

                respond(res, data, 200);
            },
            res,
            next
        );
    }
}
