import { CookieOptions, Request, Response } from 'express';
import * as moment from 'moment';
import * as jwt from 'jwt-simple';
import { getConf } from '../../config';
import { logger } from '../../logger';
import { BadRequestError } from '../errors';
import { JWTResponse, ProfileResponseBuilder } from '../responses';
import { User } from '../models';

const authConf = getConf().authConf;

/**
 * Generates JWT for Authorization returning its expiration time.
 */
export function genToken(user: Partial<User>, maxAgeSecs: number): [string, string] {
    const expires = moment()
        .utc()
        .add({ second: maxAgeSecs })
        .unix();

    const builder = new ProfileResponseBuilder();

    const jwtToken = jwt.encode(
        {
            exp: expires,
            sub: builder.buildOne(user)
        },
        authConf.jwtSecret
    );

    const expISODate = moment(expires, 'X').toISOString();

    logger.silly('Token expires on %s', expISODate);

    return [`JWT ${jwtToken}`, expISODate];
}

/**
 * Returns Authorization Cookie Options object configured for the Origin domain.
 * @param headers Headers of the original request.
 */
export function createAuthCookieOptions(headers: Record<string, unknown>): CookieOptions {
    const origin = headers.origin ? headers.origin.toString() : 'localhost';
    const cookieOptions = authConf.cookieOptions;

    const cookieOpts: CookieOptions = {
        httpOnly: cookieOptions.httpOnly,
        secure: cookieOptions.secure,
        maxAge: cookieOptions.maxAge
    };

    const foundDomain = authConf.allowedDomains.find((u) => origin.includes(u));

    if (foundDomain) {
        cookieOpts.domain = foundDomain;
    }

    logger.silly('cookieOptions: %o', cookieOpts);

    return cookieOpts;
}

/**
 * Sets the Refresh Token in Cookie to allow clients to get a temporary JWT to use the API Server.
 */
export function setAuthCookie(req: Request, res: Response, user: User): JWTResponse {
    const cookieOptions = createAuthCookieOptions(req.headers);
    const [token, expires] = genToken(user, authConf.jwtExpirationSecs);
    res.cookie(authConf.cookieTokenName, user.id, cookieOptions);
    res.setHeader(authConf.jwtExpirationHeaderName, expires);
    return new JWTResponse(token, expires);
}

export function invalidateAuthCookie(req: Request, res: Response): void {
    const cookieOptions = createAuthCookieOptions(req.headers);
    cookieOptions.maxAge = 0;
    res.cookie(authConf.cookieTokenName, '', cookieOptions);
}

/**
 * Extracts the Format Id from the user request. Look the id in path param or query params.
 *
 * @param req The Request object.
 */
export function getFormatId(req: Request): string {
    return extractId(req, 'formatId');
}

/**
 * Extracts the Team Id from the user request. Look the id in path param or query params.
 *
 * @param req The Request object.
 */
export function getTeamId(req: Request): string {
    return extractId(req, 'teamId');
}

function extractId(req: Request, field: string): string {
    let entityId: null;

    const paramId = req.params[field];

    if (paramId) {
        entityId = paramId;
    } else {
        entityId = req.query.id;
    }

    if (!entityId) {
        throw new BadRequestError('Entity Id not found in query param nor in path param.');
    }

    return entityId;
}
