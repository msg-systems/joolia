import { IConfiguration } from './index';
import { join } from 'path';
import { typeORMConnLimit } from './configuration';

export const developmentConf: Partial<IConfiguration> = {
    httpConf: {
        hostname: '0.0.0.0',
        port: 3000,
        cors: {
            origin: ['http://localhost', 'http://localhost:9000', 'http://joolia.net', 'http://joolia.ninja'],
            credentials: true
        }
    },
    awsConf: {
        sqs: {
            params: {
                QueueUrl: process.env.JOOLIA_AWS_SQS_URL || 'https://sqs.eu-central-1.amazonaws.com/254899832227/joolia-fileservice-queue'
            }
        }
    },

    authConf: {
        jwtSecret: 'joolia',
        cookieOptions: {
            secure: false,
            maxAge: 8.64e7 // 1 day
        }
    },

    fileServiceConf: {
        bucketName: process.env.JOOLIA_AWS_S3_BUCKET || 'jooliafiles-dev'
    },

    clientConf: {
        baseUrl: process.env.JOOLIA_CLIENT_URL || 'http://localhost:9000',
        baseHref: ''
    },

    csrfConf: {
        domain: 'localhost',
        secureCookie: false
    },

    dbConf: {
        archive: {
            name: 'archive',
            type: 'mysql',
            host: process.env.JOOLIA_DB_HOST || 'localhost',
            port: (process.env.JOOLIA_DB_PORT || 3306) as number,
            username: process.env.JOOLIA_DB_USER || 'root',
            password: process.env.JOOLIA_DB_PASSWORD || 'admin',
            database: 'archive_jooliadb'
        },

        main: {
            name: 'default',
            type: 'mysql',
            host: process.env.JOOLIA_DB_HOST || 'localhost',
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
                // Keep small values to catch connection pool related problems earlier.
                connectionLimit: typeORMConnLimit,
                acquireTimeout: (process.env.JOOLIA_DB_ACQUIRE_TIMEOUT || 10000) as number,
                queueLimit: (process.env.JOOLIA_DB_QUEUE_LIMIT || 3) as number
            }
        }
    }
};
