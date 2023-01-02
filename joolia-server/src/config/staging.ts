import { IConfiguration, typeORMConnLimit } from './configuration';
import { join } from 'path';

/**
 * Used in the staging environment for testing the Release Candidates, from feature branches.
 * The configuration is close to production but still loose enough to be integrated with different deployed clients.
 * Extra security steps are taken at deployment time.
 */
export const stagingConf: Partial<IConfiguration> = {
    httpConf: {
        hostname: '0.0.0.0',
        port: 3000,
        cors: {
            origin: [/joolia\.ninja$/],
            credentials: true
        }
    },

    reCaptchaConf: [
        {
            domain: 'app.joolia.ninja',
            enabled: false
        }
    ],

    awsConf: {
        sqs: {
            params: {
                QueueUrl:
                    process.env.JOOLIA_AWS_SQS_URL || 'https://sqs.eu-central-1.amazonaws.com/254899832227/joolia-fileservice-queue-staging'
            }
        }
    },

    authConf: {
        jwtSecret: 'ODdjOWZjYmNlOGNjYjk2MzgwOWQzYTQ3',
        cookieOptions: {
            secure: true,
            maxAge: 8.64e7 // 1 day
        }
    },

    csrfConf: {
        domain: 'joolia.ninja',
        secureCookie: true
    },

    fileServiceConf: {
        bucketName: process.env.JOOLIA_AWS_S3_BUCKET || 'jooliafiles-staging'
    },

    clientConf: {
        baseUrl: 'https://app.joolia.ninja',
        baseHref: '/' + process.env.JOOLIA_DEPLOYMENT_ID
    },

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
            logging: process.env.JOOLIA_DB_LOGGING === 'true' ? ['query'] : false,
            entities: [join(__dirname, '../api/models/*'), join(__dirname, '../api/models/views/*')],
            subscribers: [join(__dirname, '../api/subscribers/*')],
            extra: {
                // https://github.com/mysqljs/mysql#pool-options
                // Note: These values can be overridden at deployment time.
                connectionLimit: typeORMConnLimit,
                acquireTimeout: (process.env.JOOLIA_DB_ACQUIRE_TIMEOUT || 10000) as number,
                queueLimit: (process.env.JOOLIA_DB_QUEUE_LIMIT || 25) as number
            }
        }
    }
};
