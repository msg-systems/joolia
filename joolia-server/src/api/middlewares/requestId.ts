import { NextFunction, Request, Response } from 'express';

/**
 * Go read first https://de.wikipedia.org/wiki/Base58 ;)
 *               https://en.wikipedia.org/wiki/Binary-to-text_encoding
 */
export function rndBase58(digits = 24): string {
    const base58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('');

    let result = '';
    let char;

    while (result.length < digits) {
        char = base58[(Math.random() * 57) >> 0];
        if (result.indexOf(char) === -1) result += char;
    }

    return result;
}

/**
 * Generates an unique identifier for the user Request.
 */
export function requestId() {
    return (request: Request, response: Response, next: NextFunction) => {
        const id = rndBase58();
        request.jooliaRequestId = id;
        response.setHeader('X-Joolia-RequestId', id);
        next();
    };
}
