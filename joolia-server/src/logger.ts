import * as expressWinston from 'express-winston';
import { createLogger, format, Logger, LoggerOptions, transports } from 'winston';
import { getConf } from './config';
import { Environment } from './config/configuration';

const environment = getConf().environment;

const logLevel = process.env.LOG_LEVEL || 'info';
const wsLogLevel = process.env.WS_LOG_LEVEL || 'info';
const httpLoggerEnabled = process.env.JOOLIA_HTTP_LOGGING ? process.env.JOOLIA_HTTP_LOGGING === 'true' : true;
const wsLoggerEnabled = process.env.JOOLIA_WS_LOGGING ? process.env.JOOLIA_WS_LOGGING === 'true' : true;

const { combine, timestamp, label, printf, colorize, errors } = format;
const myFormat = printf((info) => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const options: LoggerOptions = {
    format: combine(
        errors({ stack: true }),
        colorize(),
        label({
            label: 'Joolia'
        }),
        format.splat(),
        timestamp(),
        myFormat
    ),
    level: logLevel,
    transports: [new transports.Console()]
};

const expressLoggerOptions = {
    transports: [new transports.Console({ silent: !httpLoggerEnabled })],
    format: combine(
        colorize(),
        label({
            label: 'HTTP'
        }),
        format.splat(),
        timestamp(),
        myFormat
    ),
    level: (req, res) => {
        let level;
        if (res.statusCode >= 100) {
            level = 'info';
        }
        if (res.statusCode >= 400) {
            level = 'warn';
        }
        if (res.statusCode >= 500 || res.statusCode === 401 || res.statusCode === 403) {
            level = 'error';
        }
        return level;
    },
    meta: false,
    msg: (req, res) => {
        const user = req.user || null;
        const msg = `${req.jooliaRequestId} ${req.method} ${req.url} ${res.statusCode} ${res.responseTime || '- '}ms`;
        // Avoiding PII in production
        if (user && environment !== Environment.production) {
            return `${user.id} ${msg}`;
        } else {
            return msg;
        }
    },
    colorize: environment === Environment.development,
    // eslint-disable-next-line no-unused-vars
    ignoreRoute: (req, res) => {
        return req.method === 'OPTIONS';
    }
};

const socketLoggerOptions: LoggerOptions = {
    format: combine(
        colorize(),
        label({
            label: 'SOCKET'
        }),
        format.splat(),
        timestamp(),
        myFormat
    ),
    level: wsLogLevel,
    transports: [new transports.Console({ silent: !wsLoggerEnabled })]
};

export const logger: Logger = createLogger(options);
export const wsLogger: Logger = createLogger(socketLoggerOptions);
export const expressLogger = expressWinston.logger(expressLoggerOptions);
