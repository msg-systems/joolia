import { merge } from 'lodash';
import { join } from 'path';
import { Environment, IConfiguration } from './configuration';
import { developmentConf } from './development';
import { productionConf } from './production';
import { stagingConf } from './staging';

const environment = Environment[process.env.NODE_ENV] || Environment.development;

const availableEnvironments: Map<Environment, Partial<IConfiguration>> = new Map([
    [Environment.staging, stagingConf],
    [Environment.production, productionConf],
    [Environment.development, developmentConf]
]);

const DOMAINS = {
    production: 'joolia.net',
    staging: 'joolia.ninja',
    development: 'localhost'
};

/**
 * This gets overridden for each environment.
 */
const defaultConf: IConfiguration = {
    environment,

    httpConf: {
        hostname: '127.0.0.1',
        port: 3000,
        cors: {
            origin: ['*'],
            methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
            preflightContinue: false,
            optionsSuccessStatus: 204,
            credentials: true
        }
    },

    dbConf: undefined, // must be set in the specific environment configuration

    reCaptchaConf: [
        {
            domain: 'localhost',
            enabled: false,
            secret: '6LdESpQUAAAAALBm72qOMLSwE92JNEm6y7xKJloJ', // localhost domain
            threshold: 0.0
        }
    ],

    authConf: {
        jwtSecret: undefined,
        jwtExpirationSecs: 60, // in seconds
        cookieTokenName: 'joolia_refresh_token',
        jwtExpirationHeaderName: 'X-Joolia-Auth-Expires',
        cookieOptions: {
            httpOnly: true,
            secure: false,
            maxAge: 604800000 // 7 days in milliseconds
        },

        allowedDomains: Object.values(DOMAINS),

        passwordResetExpiration: 30 // in minutes
    },

    awsConf: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || null,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || null,
        region: process.env.AWS_DEFAULT_REGION || 'eu-central-1',
        s3: {
            enabled: true,
            apiVersion: '2006-03-01',
            signatureVersion: 'v4'
        },
        sqs: {
            enabled: process.env.JOOLIA_AWS_SQS_ENABLED ? process.env.JOOLIA_AWS_SQS_ENABLED === 'true' : false,
            pollingIntervalTime: Number(process.env.JOOLIA_AWS_SQS_POLLTIME || 10000),
            apiVersion: '2012-11-05',
            params: {
                MaxNumberOfMessages: 10,
                MessageAttributeNames: ['All'],
                VisibilityTimeout: 30,
                WaitTimeSeconds: 0
            }
        },
        ses: {
            accessKeyId: process.env.SES_AWS_ACCESS_KEY_ID || null,
            secretAccessKey: process.env.SES_AWS_SECRET_ACCESS_KEY || null,
            enabled: process.env.JOOLIA_AWS_SES_ENABLED ? process.env.JOOLIA_AWS_SES_ENABLED === 'true' : false,
            region: process.env.JOOLIA_AWS_SES_REGION || 'eu-west-1',
            apiVersion: '2010-12-01'
        }
    },

    csrfConf: {
        enabled: process.env.JOOLIA_CSURF_ENABLED ? process.env.JOOLIA_CSURF_ENABLED === 'true' : false,
        secretKey: '_csrf',
        cookiePath: '/',
        tokenKey: 'XSRF-TOKEN',
        ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
    },

    meetingServiceConf: {
        provider: {
            bbb: {
                endpoint: process.env.JOOLIA_MEETING_ENDPOINT,
                secret: process.env.JOOLIA_MEETING_SECRET,
                defaultPresentationUrl: 'https://joolia-assets.s3.eu-central-1.amazonaws.com/JooliaBlank.pdf',
                logoutUrl: 'https://www.joolia.net',
                autoStartRecording: false
            },
            msTeams: {
                clientId: process.env.JOOLIA_TEAMS_CLIENT_ID,
                clientSecret: process.env.JOOLIA_TEAMS_CLIENT_SECRET,
                tenant: process.env.JOOLIA_TEAMS_TENANT,
                graphAPI: 'https://graph.microsoft.com/v1.0/me/onlineMeetings',
                accessTokenAPI: `https://login.microsoftonline.com/${process.env.JOOLIA_TEAMS_TENANT}/oauth2/v2.0/token`,
                meetingLinkExpirationDays: 7
            }
        }
    },

    meetingRegExp: {
        zoomRegExp: /^.*(https:\/\/|http:\/\/)?(zoom.us\/|v\/|u\/\w\/|j\/|\?v=|\&v=|\?v=)([^#\&\?]*).*/,
        teamsRegExp: /^.*(https:\/\/|http:\/\/)?(teams.microsoft.com){1}(\/|v\/|u\/\w\/|l\/meetup-join\/)([^#\&\?]*).*/,
        skypeRegExp: /^.*(https:\/\/|http:\/\/)?(join.skype.com\/|v\/|u\/\w\/|j\/|\?v=|\&v=|\?v=)([^#\&\?]*).*/
    },

    fileServiceConf: {
        urlSignatureExpirationTime: 900,
        fileNameMaxLength: 255
    },

    eMailServiceConf: {
        templateDirectory: join(__dirname, '../emailTemplates')
    },

    clientConf: {
        baseUrl: 'http://localhost:9000',
        baseHref: ''
    },

    allowedMarkups: {
        allowedTags: ['b', 'i', 'em', 'strong', 'ul', 'ol', 'li', 'a'],
        allowedAttributes: {
            a: ['href']
        },

        exclusiveFilter: function(frame) {
            return frame.tag === 'a' && /.*[sS]cript.*/.test(frame.attribs.href);
        }
    },

    noMarkups: {
        allowedTags: [],
        allowedAttributes: {}
    },

    adminMails: [/^John\.Wick@joolia\.com$/i],

    technicalUserMail: 'Jim.Johnson@joolia.group',

    emailI18N: {
        directory: join(__dirname, '../emailTemplates/locales'),
        indent: '    ',
        locales: ['en', 'de'],
        defaultLocale: 'en',
        api: {
            __: 't',
            __n: 'tn',
            __mf: 'tmf'
        }
    },

    websocket: {
        enabled: process.env.JOOLIA_WS_ENABLED ? process.env.JOOLIA_WS_ENABLED === 'true' : false,
        authTimeout: 15000, // 15 seconds to send the authentication message
        rooms: {
            /**
             * Can be used for adhoc communications.
             */
            maintenance: /^\/maintenance/,
            /**
             * In Chats the Room is sent back & forth between
             * Client & Server. No need for further details.
             */
            chat: {
                formatRooms: /^\/chat\/format/
            },
            /**
             * Notifications are one-way - Client joins on Room and
             * Server uses the Target to find out which Room to notify.
             */
            notification: {
                canvas: {
                    room: /^\/notification\/canvas/,
                    target: /\/canvas\/(?<id>.+)\/?/
                },
                format: {
                    room: /^\/notification\/format/,
                    target: /\/format\/(?<id>.+)\/?/
                },
                activity: {
                    room: /^\/notification\/activity/,
                    target: /\/activity\/(?<id>.+)\/?/
                },
                submission: {
                    room: /^\/notification\/submission/,
                    target: /\/submission\/(?<id>.+)\/?/
                }
            }
        }
    },

    redis: {
        enabled: process.env.JOOLIA_REDIS_ENABLED ? process.env.JOOLIA_REDIS_ENABLED === 'true' : false,
        connection: {
            retryAttempt: 5,
            retryMaxTime: 1000 * 60 * 5, // 5 min max retry time
            retryTimeout: 2000 // 2sec timeout between retry
        },
        host: process.env.JOOLIA_REDIS_HOST || 'localhost',
        port: (process.env.JOOLIA_REDIS_PORT || 6379) as number,
        password: process.env.JOOLIA_REDIS_PASSWORD || null,
        storage: {
            messageRangeMin: 0,
            messageRangeMax: 99
        }
    },

    ratingStep: 0.5,
    minimumActivityDuration: 15,
    maxSkillsPerUser: 3
};

const environmentConf = availableEnvironments.get(environment);

if (!environmentConf) {
    throw new Error(`Environment ${environment} not supported!`);
}

const resolvedConf = merge<IConfiguration>(defaultConf, environmentConf);

function getConf(): IConfiguration {
    return resolvedConf;
}

function getClientUrl(): string {
    return `${getConf().clientConf.baseUrl}${getConf().clientConf.baseHref}`;
}

function adminConsentEndpoint(tenant: string, redirectUri: string, state: string) {
    return `https://login.microsoftonline.com/${tenant}/v2.0/adminconsent?client_id=${
        getConf().meetingServiceConf.provider.msTeams.clientId
    }&scope=https://graph.microsoft.com/OnlineMeetings.ReadWrite&redirect_uri=${redirectUri}&state=${state}`;
}

function userinfoEndpoint(domain: string) {
    return `https://login.microsoftonline.com/${domain}/v2.0/.well-known/openid-configuration`;
}

export { IConfiguration, getConf, getClientUrl, adminConsentEndpoint, userinfoEndpoint };
