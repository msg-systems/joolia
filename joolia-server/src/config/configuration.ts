import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { CookieOptions } from 'express';

export declare type IDBConfiguration = MysqlConnectionOptions;

export type Environment = 'development' | 'production' | 'staging';

export const Environment = {
    get production(): Environment {
        return 'production';
    },
    get development(): Environment {
        return 'development';
    },
    get staging(): Environment {
        return 'staging';
    }
};

/**
 * Gets reasonable connection limits for TypeORM and Knex pools.
 *
 * See JOOLIA-2283 for context.
 */
function getDBConnLimits(): number[] {
    const limit = parseInt(process.env.JOOLIA_DB_CONN_LIMIT || '5');
    return [Math.ceil(limit * 0.6), Math.ceil(limit * 0.4)];
}

const [typeORMConnLimit, knexConnLimit] = getDBConnLimits();

interface IAWSSQSParams {
    MaxNumberOfMessages: number; // Number of messages coming in a single response
    MessageAttributeNames: string[];
    QueueUrl: string;
    VisibilityTimeout: number; // How long the message is not available for another consumer
    WaitTimeSeconds: number; // How long this worker waits until returning empty response
}

interface ICORSConfiguration {
    origin: Array<string | RegExp>;
    methods: string[];
    preflightContinue: boolean;
    optionsSuccessStatus: number;
    credentials: boolean;
}

interface IHttpServerConfiguration {
    port: number;
    hostname: string;
    cors: Partial<ICORSConfiguration>;
}

interface IReCaptchaConfiguration {
    domain: string;
    enabled: boolean;
    secret: string;
    threshold: number;
}

interface IAuthConfiguration {
    jwtSecret: string;
    jwtExpirationSecs: number;
    jwtExpirationHeaderName: string;
    cookieOptions: CookieOptions;
    cookieTokenName: string;
    allowedDomains: string[];
    passwordResetExpiration: number;
}

interface ICSRFConfiguration {
    enabled: boolean;
    domain: string;
    cookiePath: string;
    secretKey: string;
    tokenKey: string;
    secureCookie: boolean;
    ignoreMethods: string[];
}

interface IFileServiceConfiguration {
    bucketName: string;
    urlSignatureExpirationTime: number; // seconds
    fileNameMaxLength: number;
}

interface IAWSBaseConfiguration {
    apiVersion: string;
    enabled: boolean;
    region?: string;
}

interface IAWSS3Configuration extends IAWSBaseConfiguration {
    signatureVersion: string;
}

interface IAWSSQSConfiguration extends IAWSBaseConfiguration {
    params: Partial<IAWSSQSParams>;
    pollingIntervalTime: number;
}

interface ISESConfiguration extends IAWSBaseConfiguration {
    accessKeyId: string;
    secretAccessKey: string;
}

interface IAWSConfiguration {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3: IAWSS3Configuration;
    sqs: Partial<IAWSSQSConfiguration>;
    ses: Partial<ISESConfiguration>;
}

interface IEmailServiceConfiguration {
    templateDirectory: string;
}

interface IBBBConfiguration {
    endpoint: string;
    secret: string;
    autoStartRecording: boolean;
    defaultPresentationUrl?: string;
    logoutUrl?: string;
}

interface IMSTeamsConfiguration {
    clientId: string;
    clientSecret: string;
    tenant: string;
    graphAPI: string;
    accessTokenAPI: string;
    meetingLinkExpirationDays: number;
}

interface IMeetingServiceConfiguration {
    provider: {
        bbb: IBBBConfiguration;
        msTeams: IMSTeamsConfiguration;
    };
}

interface IMeetingRegExp {
    zoomRegExp: RegExp;
    teamsRegExp: RegExp;
    skypeRegExp: RegExp;
}

interface IClientConf {
    baseUrl: string;
    baseHref: string;
}

interface Ii18n {
    directory: string;
    indent: string;
    locales: string[];
    defaultLocale: string;
    api: {
        __: string;
        __n: string;
        __mf: string;
    };
}

interface ISanitizeHtmlOptions {
    allowedTags: string[];
    allowedAttributes: {
        [key: string]: string[];
    };
    // eslint-disable-next-line @typescript-eslint/ban-types
    exclusiveFilter?: Function;
}

interface IWebsocket {
    enabled: boolean;
    authTimeout: number;
    rooms: {
        [key: string]: any;
    };
}

interface IRedis {
    enabled: boolean;
    connection: {
        retryAttempt: number;
        retryMaxTime: number;
        retryTimeout: number;
    };
    host: string;
    port: number;
    password: string;
    storage: {
        messageRangeMin: number;
        messageRangeMax: number;
    };
}

interface IDBConf {
    archive: Partial<IDBConfiguration>;
    main: Partial<IDBConfiguration>;
}

interface IConfiguration {
    environment: Environment;
    httpConf: Partial<IHttpServerConfiguration>;
    dbConf: Partial<IDBConf>;
    reCaptchaConf: Array<Partial<IReCaptchaConfiguration>>;
    authConf: Partial<IAuthConfiguration>;
    awsConf: Partial<IAWSConfiguration>;
    csrfConf: Partial<ICSRFConfiguration>;
    fileServiceConf: Partial<IFileServiceConfiguration>;
    meetingServiceConf: Partial<IMeetingServiceConfiguration>;
    meetingRegExp: IMeetingRegExp;
    eMailServiceConf: Partial<IEmailServiceConfiguration>;
    clientConf: IClientConf;
    allowedMarkups: ISanitizeHtmlOptions;
    noMarkups: ISanitizeHtmlOptions;
    adminMails: RegExp[];
    technicalUserMail: string;
    emailI18N: Ii18n;
    websocket: IWebsocket;
    redis: IRedis;
    minimumActivityDuration: number;
    ratingStep: number;
    maxSkillsPerUser: number;
}

export { IConfiguration, IBBBConfiguration, IMSTeamsConfiguration, knexConnLimit, typeORMConnLimit };
