import { IConfiguration, typeORMConnLimit } from './configuration';
import { join } from 'path';

export const productionConf: Partial<IConfiguration> = {
    httpConf: {
        hostname: '0.0.0.0',
        port: 3000,
        cors: {
            origin: [/joolia\.net$/],
            credentials: true
        }
    },

    reCaptchaConf: [
        {
            domain: 'joolia.net',
            enabled: true,
            threshold: 0.3,
            secret: '6LcvI68UAAAAAE2cGRtDpRIaHm7dN0nH4XSrdVn2' // joolia.net domain on Minnosphere google account
        }
    ],

    authConf: {
        jwtSecret: '9b138f44ffd0036fdf510e4d657f9a9a',
        jwtExpirationSecs: 180,
        cookieOptions: {
            secure: true,
            maxAge: 604800000 // 7 days
        }
    },

    csrfConf: {
        domain: 'joolia.net',
        secureCookie: true
    },

    awsConf: {
        sqs: {
            params: {
                QueueUrl: process.env.JOOLIA_AWS_SQS_URL || 'https://sqs.eu-central-1.amazonaws.com/980765129740/joolia-fileservice-queue'
            }
        }
    },

    fileServiceConf: {
        bucketName: 'jooliafiles-production'
    },

    clientConf: {
        baseUrl: 'https://app.joolia.net',
        baseHref: '/6FEB3BD5-566E-4931-ACE2-5AEA4399B110'
    },

    technicalUserMail: 'jooliaassistant@outlook.com',

    dbConf: {
        archive: {
            name: 'archive',
            type: 'mysql',
            host: process.env.JOOLIA_DB_HOST || 'joolia-db',
            port: (process.env.JOOLIA_DB_PORT || 3306) as number,
            username: process.env.JOOLIA_DB_USER || 'root',
            password: process.env.JOOLIA_DB_PASSWORD || 'admin',
            database: 'archive_jooliadb',
            synchronize: false,
            logging: process.env.JOOLIA_DB_LOGGING === 'true' ? ['query'] : false,
            entities: [join(__dirname, '../api/models/*')]
        },

        main: {
            name: 'default',
            type: 'mysql',
            host: process.env.JOOLIA_DB_HOST || 'joolia-db',
            port: (process.env.JOOLIA_DB_PORT || 3306) as number,
            username: process.env.JOOLIA_DB_USER || 'root',
            password: process.env.JOOLIA_DB_PASSWORD || 'admin',
            database: process.env.JOOLIA_DB_NAME || 'jooliadb',
            synchronize: false,
            logging: ['error'],
            entities: [join(__dirname, '../api/models/*'), join(__dirname, '../api/models/views/*')],
            subscribers: [join(__dirname, '../api/subscribers/*')],
            extra: {
                // https://github.com/mysqljs/mysql#pool-options
                // Note: These values can be overridden at deployment time.
                connectionLimit: typeORMConnLimit,
                acquireTimeout: (process.env.JOOLIA_DB_ACQUIRE_TIMEOUT || 10000) as number,
                queueLimit: (process.env.JOOLIA_DB_QUEUE_LIMIT || 50) as number
            }
        }
    }
};
