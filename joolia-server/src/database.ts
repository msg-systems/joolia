import { getConf } from './config';
import * as knex from 'knex';
import { IDBConfiguration, knexConnLimit } from './config/configuration';
import { Connection, ConnectionOptions, createConnection } from 'typeorm';

/**
 * Knex is an alternative to Typeorm.
 *
 * Note: The connection pool is handled separated from the TypeORM.
 * See JOOLIA-2283.
 */
function createKnexConnectionPool(conf: Partial<IDBConfiguration>): knex<never, unknown[]> {
    return knex({
        client: conf.type,
        connection: {
            host: conf.host,
            user: conf.username,
            password: conf.password,
            database: conf.database,
            /**
             * Knex just returns what the db driver says. This is a helper function
             * to deal with casting. See JOOLIA-2283.
             *
             * https://github.com/knex/knex/issues/1240
             */
            typeCast: (field, next) => {
                /**
                 * TINY(1) -> boolean
                 */
                if (field.type == 'TINY' && field.length == 1) {
                    const v = field.string();
                    return v ? v == '1' : null;
                }
                return next();
            }
        },
        pool: { min: 1, max: knexConnLimit }
    });
}

/**
 * Views & Archive are queried through Knex due to TypeORM limitations.
 */
const createKnexConn = (): knex<never, unknown[]> => createKnexConnectionPool(getConf().dbConf.main);

/**
 * Main Connection is done through TypeORM.
 */
const createMainConn = async (): Promise<Connection> => createConnection(getConf().dbConf.main as ConnectionOptions);

export { createKnexConn, createMainConn };
