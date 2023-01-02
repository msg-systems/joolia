import 'reflect-metadata';
import * as socketIO from 'socket.io';
import * as express from 'express';
import * as http from 'http';
import { Connection } from 'typeorm';
import { configure } from './api/routes';
import { ChatSocket } from './sockets';
import { getConf, IConfiguration } from './config';
import { logger } from './logger';
import { BBBService, FileService, MailService, MSTeamsService, S3FileService } from './api/services';
import { MysqlDriver } from 'typeorm/driver/mysql/MysqlDriver';
import { INotificationService, LogNotificationService, NotificationService } from './api/services/notification';
import { createMainConn } from './database';

export interface IConnectionPool {
    name: string;
    free: number;
    acquiring: number;
    all: number;
    options: unknown;
}

export interface IServerState {
    dbConnectionPool: IConnectionPool[];
}

export interface IServerBuildInfo {
    name: string;
    version: string;
    buildTime: string;
}

export class Server {
    private io: socketIO.Server;
    private httpServer: http.Server;
    private connection: Connection;
    private notificationService: INotificationService;

    public buildInfo: IServerBuildInfo;

    public constructor(
        private config: IConfiguration,
        private fileService: FileService,
        private bbbService: BBBService,
        private msTeamsService: MSTeamsService,
        public application: express.Application = express()
    ) {
        logger.debug('Environment is %s', config.environment);
        logger.silly('%o', config);

        const hasSync = config.dbConf.main.synchronize;
        logger.debug('DB Sync: %s', hasSync);

        if (hasSync && config.environment !== 'development') {
            throw new Error('DB synchronization is forbidden in non-development environment');
        }

        logger.info('HTTP Server: %o', this.config.httpConf);
        logger.info('WS Server: %o', this.config.websocket.enabled);
        logger.info('Redis: %o', this.config.redis.enabled);

        // BUILD_SIGNATURE=joolia-server,1.0.0-dev.0-239-gb8987f4,b8987f4,2019-02-20T14:01:30Z
        const buildSignature = process.env.BUILD_SIGNATURE || null;

        if (buildSignature) {
            const splittedSignature = buildSignature.split(',');
            this.buildInfo = {
                name: splittedSignature[0],
                version: splittedSignature[1],
                buildTime: splittedSignature.pop()
            };
        }

        logger.info('Build: %o', this.buildInfo);
    }

    public async start(): Promise<void> {
        await MailService.configure();
        this.connection = await createMainConn();

        this.httpServer = this.application.listen(this.config.httpConf.port, this.config.httpConf.hostname, (err) => {
            if (err) {
                return err;
            }

            logger.info('Joolia is listening on port %s', this.config.httpConf.port);
        });

        this.httpServer.on(
            'close',
            async (): Promise<void> => {
                logger.info('Joolia is being terminated..');
                await this.connection.close();
            }
        );

        if (this.config.websocket.enabled) {
            this.io = socketIO(this.httpServer);
            new ChatSocket(this.io);
        }

        this.createNotificationService();

        configure(this.application, this);
    }

    public stop(): void {
        this.httpServer.close((): void => {
            logger.info('Bye.');
        });
    }

    public getNotificationService(): INotificationService {
        return this.notificationService;
    }

    public getFileService(): FileService {
        return this.fileService;
    }

    public getServerState(): IServerState {
        const serverState: IServerState = { dbConnectionPool: [] };
        const driver = this.connection.driver as MysqlDriver;
        const poolState: IConnectionPool = {
            name: this.connection.name,
            all: driver.pool._allConnections.length,
            acquiring: driver.pool._acquiringConnections.length,
            free: driver.pool._freeConnections.length,
            options: this.connection.options.extra
        };
        serverState.dbConnectionPool.push(poolState);

        return serverState;
    }

    private createNotificationService(): void {
        if (this.config.websocket.enabled) {
            this.notificationService = new NotificationService(this.io);
        } else {
            this.notificationService = new LogNotificationService();
            logger.warn('WS disabled - Notifications will be sent to logger');
        }
    }
}

export function createServer(
    config: IConfiguration = getConf(),
    fileService: FileService = new S3FileService(),
    bbbService = new BBBService(),
    msTeamsService = new MSTeamsService()
): Server {
    return new Server(config, fileService, bbbService, msTeamsService);
}

/**
 * If you are reading this perhaps you have a promise to handle ;)
 */
process.on('unhandledRejection', (rejection) => {
    logger.error('%o', rejection);
    process.exit(5000);
});
