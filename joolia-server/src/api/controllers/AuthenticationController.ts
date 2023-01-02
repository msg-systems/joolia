import { NextFunction, Request, RequestHandler, Response } from 'express';
import * as passport from 'passport';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import { Strategy as CookieStrategy } from 'passport-cookie';
import { getConf } from '../../config';
import { BadRequestError, ConflictError, NotFoundError, PreconditionFailedError, UnauthorizedError } from '../errors';
import { setAuthCookie, invalidateAuthCookie } from '../utils/web';
import { logger } from '../../logger';
import { respond, respondNoCache, withErrorHandler, withTransaction } from './utils';
import { UserRepo } from '../repositories';
import * as moment from 'moment';
import * as jwt from 'jwt-simple';
import { MailService } from '../services/mail';
import { checkReCaptcha } from '../utils/recaptcha';
import { User } from '../models';
import { LibraryService, WorkspaceService } from '../services';
import { LoginProfileResponseBuilder } from '../responses/loginProfile.response';

const authConf = getConf().authConf;

export class AuthenticationController {
    public static initialize(): RequestHandler {
        passport.use('jwt', AuthenticationController.getJWTStrategy());
        passport.use('cookie', AuthenticationController.getCookieStrategy());
        return passport.initialize();
    }

    public static authenticateWithCookie(req: Request, res: Response, next: NextFunction): RequestHandler {
        return passport.authenticate('cookie', { session: false, failWithError: true })(req, res, next);
    }

    public static authenticate(req: Request, res: Response, next: NextFunction): RequestHandler {
        return passport.authenticate('jwt', { session: false, failWithError: true }, (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                if (info.name === 'TokenExpiredError') {
                    return next(new UnauthorizedError());
                } else {
                    return next(new UnauthorizedError(info.message));
                }
            }

            next();
        })(req, res, next);
    }

    public static async getAuthToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const loggedUser = req.user as Partial<User>;
                const repo: UserRepo = runner.manager.getCustomRepository(UserRepo);
                const user = await repo.getUserByEmail(loggedUser.email);

                if (!user && !user.pending) {
                    throw new UnauthorizedError();
                }

                const jwtResponse = setAuthCookie(req, res, user);
                respondNoCache(res, jwtResponse);
            },
            res,
            next
        );
    }

    public static async signOut(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withErrorHandler(
            () => {
                invalidateAuthCookie(req, res);
                respondNoCache(res);
            },
            res,
            next
        );
    }

    public static async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner) => {
                const userCredential = req.body;

                if (!userCredential.email || !userCredential.password) {
                    throw new BadRequestError('Credentials are required');
                }

                const repo = runner.manager.getCustomRepository(UserRepo);

                /**
                 * Always persist result of auth in database.
                 */
                res.locals.commitTransaction = true;

                const user = await repo.getUserWithCredentials(userCredential);

                if (!user) {
                    throw new UnauthorizedError('Email or password is invalid'); // I don't known you at all
                }

                if (user.failedLoginTimeout && moment(user.failedLoginTimeout).isAfter()) {
                    throw new PreconditionFailedError('Too many failed logins'); // I known you, but you are out of tries
                }

                const validated = await user.validatePassword(userCredential.password);

                if (!validated) {
                    await repo.updateFailedLoginInfo(user);
                    throw new UnauthorizedError('Email or password is invalid'); // I known you, but your pass is wrong
                }

                await repo.resetFailedLoginInfo(user);

                setAuthCookie(req, res, user);

                const builder = new LoginProfileResponseBuilder();
                respondNoCache(res, builder.buildOne(user));
            },
            res,
            next
        );
    }

    //TODO: JOOLIA-2402 Refactor-me.
    public static async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const origin = req.headers.origin ? req.headers.origin.toString() : 'localhost';
                const reCaptchaConf = getConf().reCaptchaConf.find((re) => origin.includes(re.domain));

                if (reCaptchaConf.enabled) {
                    const reCaptchaToken = req.body['reCaptchaToken'];
                    delete req.body['reCaptchaToken'];

                    if (!(await checkReCaptcha(reCaptchaToken, 'signup', origin))) {
                        logger.warn('reCaptcha failed!');
                        throw new BadRequestError('You probably are not human, sorry :(');
                    }
                }
                let user = await runner.manager.getCustomRepository(UserRepo).findOne({
                    where: { email: req.body.email, pending: true }
                });
                if (user) {
                    user = Object.assign(user, req.body);
                    user.pending = false;
                } else {
                    user = new User(req.body);
                }

                const privateWorkspaceName = req.body.privateWorkspaceName;
                const privateLibraryName = req.body.privateLibraryName;

                await user.setPassword(req.body.password);

                user.admin = getConf().adminMails.some((regexp) => regexp.test(user.email));

                try {
                    user = await runner.manager.save(user);
                } catch (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        throw new ConflictError('User already existing');
                    }
                    throw err;
                }

                if (privateWorkspaceName) {
                    await WorkspaceService.createWorkspace(
                        runner,
                        {
                            name: req.body.privateWorkspaceName,
                            licensesCount: 5
                        },
                        user
                    );
                }

                if (privateLibraryName) {
                    await LibraryService.createLibrary(runner, { name: req.body.privateLibraryName }, user);
                }

                respond(res, { user }, 201);
            },
            res,
            next
        );
    }

    public static async requestPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const origin = req.headers.origin ? req.headers.origin.toString() : 'localhost';
                const foundDomain = authConf.allowedDomains.find((u) => origin.includes(u));
                if (!foundDomain) {
                    throw new BadRequestError('Origin not allowed');
                }

                const user = await runner.manager.getCustomRepository(UserRepo).getUserByEmail(req.body.email);

                if (user) {
                    const expirationDate = moment()
                        .utc()
                        .add(getConf().authConf.passwordResetExpiration, 'minutes')
                        .unix();

                    const token = jwt.encode(
                        {
                            expirationDate: expirationDate,
                            userId: user.id
                        },
                        authConf.jwtSecret
                    );

                    const languages = req.acceptsLanguages();
                    const locale = languages[0];

                    await MailService.sendPasswordReset(req.body.email, token, user.name, origin, locale);
                }

                // respond the same way, whether user exists or not -> no probing for emails in platform
                respond(res);
            },
            res,
            next
        );
    }

    public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        return withTransaction(
            async (runner): Promise<void> => {
                const token = req.body.token;

                let payload;

                try {
                    payload = jwt.decode(token, authConf.jwtSecret);
                } catch (error) {
                    throw new BadRequestError('Invalid token.');
                }

                const now = moment()
                    .utc()
                    .unix();

                if (now >= payload.expirationDate) {
                    throw new UnauthorizedError('Token expired.');
                }

                const user = (await runner.manager.getCustomRepository(UserRepo).find({ where: { id: payload.userId } }))[0];

                if (!user) {
                    throw new NotFoundError('User not found.');
                }

                await user.setPassword(req.body.password);

                await runner.manager.save(user);

                respond(res);
            },
            res,
            next
        );
    }

    private static getJWTStrategy(): passport.Strategy {
        const params = {
            secretOrKey: authConf.jwtSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
            passReqToCallback: true
        };

        return new JWTStrategy(params, async (req: Request, payload: { sub: Record<string, string> }, done) => {
            logger.silly('JWT payload: %o', payload);
            if (!payload.sub) {
                done(null, false, new UnauthorizedError());
            } else {
                req.user = payload.sub;
                done(null, payload.sub);
            }
        });
    }

    private static getCookieStrategy(): passport.Strategy {
        const params = {
            cookieName: authConf.cookieTokenName,
            signed: false,
            passReqToCallback: true
        };

        return new CookieStrategy(params, async (req, token, done) => {
            logger.silly('Cookie token: %s', token);

            await withTransaction(async (runner) => {
                try {
                    const repo = runner.manager.getCustomRepository(UserRepo);
                    const user = await repo.getUserById(token);

                    if (!user) {
                        done(null, false, new UnauthorizedError());
                    } else {
                        // Add user to request to be able to determine requester everywhere
                        req.user = user.stripSensitiveFields();
                        done(null, user);
                    }
                } catch (err) {
                    done(err);
                }
            }, req.res);
        });
    }
}
