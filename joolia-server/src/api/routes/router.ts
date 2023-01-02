import * as cookieParser from 'cookie-parser';
import * as httpStatus from 'http-status';
import * as qs from 'qs';
import * as bodyParser from 'body-parser';
import * as boolParser from 'express-query-boolean';
import * as cors from 'cors';
import { Application, NextFunction, Request, Response, Router } from 'express';
import * as path from 'path';
import * as swaggerjsdoc from 'swagger-jsdoc';
import * as swaggeUI from 'swagger-ui-express';
import { getConf } from '../../config';
import { expressLogger, logger } from '../../logger';
import { AuthenticationController, EchoController } from '../controllers';
import { AbstractError } from '../errors/abstract.error';
import {
    createActivityTemplateRouter,
    createFormatRouter,
    createFormatTemplateRouter,
    createLibraryRouter,
    createPhaseTemplateRouter,
    createProfileRouter,
    createRootRouter,
    createUserRouter,
    createWorkspaceRouter
} from './internal';
import { IServerBuildInfo, Server } from '../../server';
import { Environment } from '../../config/configuration';
import * as csurf from 'csurf';
import { requestId } from '../middlewares';

function configureApiDocs(app: Application, info: IServerBuildInfo): void {
    const apiPath = '/api-docs';

    const swaggerDefinition = {
        openapi: '3.0.1',
        info: {
            title: 'JOOLIA',
            version: info ? info.version : '0.0.0',
            description: 'This is the REST API for JOOLIA'
        },
        host: 'localhost:3000',
        basePath: '/'
    };

    const options = {
        swaggerDefinition,
        apis: [path.join(__dirname, '../docs/**/*.yaml')]
    };

    const swaggerSpec = swaggerjsdoc(options);
    app.use(apiPath, swaggeUI.serve, swaggeUI.setup(swaggerSpec));
    logger.info('API Documentation available @ %s', apiPath);
}

function configureEchoPath(app: Application): void {
    const endpoint = '/echo';
    const echoRouter = Router();

    echoRouter
        .route('/')
        .post(EchoController.create)
        .get(EchoController.index);

    echoRouter.route('/:echoId').get(EchoController.show);

    app.use(endpoint, echoRouter);
}

function configureNonProdEndpoints(app: Application, server: Server): void {
    if (getConf().environment === Environment.production) {
        logger.warn('Optional/Dev endpoints not configured.');
        return;
    }

    configureApiDocs(app, server.buildInfo);
    configureEchoPath(app);
}

export function configure(app: Application, server: Server): void {
    /**
     * Using qs for query parsing. Needs to be the first here or it will not work.
     * May not be necessary in Express 5: https://github.com/expressjs/express/issues/3454
     */
    app.set('query parser', (querystring) => {
        logger.silly('querystring: %s', querystring);
        return qs.parse(querystring, { allowDots: true });
    });

    app.use(requestId());

    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(boolParser());
    app.use(expressLogger);
    app.use(AuthenticationController.initialize());
    app.use(cors(getConf().httpConf.cors));

    const csrfConf = getConf().csrfConf;

    if (csrfConf.enabled) {
        app.use((req, res, next) => {
            const xsrfHeader = `X-${csrfConf.tokenKey}`;

            if (!csrfConf.ignoreMethods.includes(req.method) && !req.header(xsrfHeader)) {
                logger.warn('[%s %s] %s not found. CSRF check may fail!', req.method, req.path, xsrfHeader);
            }

            next();
        });

        // httpOnly is true! this cookie cannot be read by client app and maxAge is session
        const csrfProtection = csurf({
            ignoreMethods: csrfConf.ignoreMethods,
            cookie: {
                key: csrfConf.secretKey,
                httpOnly: true,
                path: csrfConf.cookiePath,
                secure: csrfConf.secureCookie,
                domain: csrfConf.domain
            } as csurf.CookieOptions
        });

        /**
         * This endpoint is called once by client app during initialization
         */
        app.use('/init', csrfProtection, (req, res) => {
            // httpOnly is false! the cookie is read by client app and maxAge is session
            res.cookie(csrfConf.tokenKey, req.csrfToken(), {
                httpOnly: false,
                path: csrfConf.cookiePath,
                secure: csrfConf.secureCookie,
                domain: csrfConf.domain
            });
            res.status(204).send();
        });

        app.use(csrfProtection);
    } else {
        logger.warn('CSRF protection disabled.');
    }

    app.use('/', createRootRouter(server));
    app.use('/user', createUserRouter(server));
    app.use('/profile', createProfileRouter(server));
    app.use('/format', createFormatRouter(server));
    app.use('/library', createLibraryRouter(server));
    app.use('/workspace', createWorkspaceRouter(server));
    app.use('/activity-template', createActivityTemplateRouter());
    app.use('/format-template', createFormatTemplateRouter());
    app.use('/phase-template', createPhaseTemplateRouter());

    configureNonProdEndpoints(app, server);

    // default error handling, should be the last registered.
    app.use((err: AbstractError, req: Request, res: Response, next: NextFunction) => {
        logger.error('%o', err);

        if (res.headersSent) {
            return next(err);
        }

        if (err.status) {
            /**
             * Complements the logic from validators. The Express Validator terminates and returns the response before reaching
             * this handler. But any Error threw from inside the controller logic lands here and the Client Errors cases
             * are treated accordingly, like the ForbiddenError, HTTP 403.
             */
            switch (httpStatus[`${err.status}_CLASS`]) {
                case httpStatus.classes.CLIENT_ERROR:
                    res.status(err.status).send({
                        error: err.message
                    });
                    break;
                case httpStatus.classes.SERVER_ERROR:
                    res.status(500).send({
                        error: 'Something went wrong.'
                    });
                    break;
                default:
                    break;
            }
        } else {
            res.status(500).send({
                error: 'Unexpected error.'
            });

            if (err.code && err.code === 'POOL_ENQUEUELIMIT') {
                logger.error('DB Connection queue limit reached. Exiting..');
                process.exit(1);
            }
        }
    });
}
