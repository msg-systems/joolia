/* eslint-disable @typescript-eslint/naming-convention */

import { logger } from '../../logger';
import * as knex from 'knex';
import { getConf } from '../../config';
import * as faker from 'faker';
import { NextFunction, Request, Response } from 'express';
import { withTransaction } from '../controllers/utils';
import { MysqlQueryRunner } from 'typeorm/driver/mysql/MysqlQueryRunner';
import { ColumnType, EntityMetadata } from 'typeorm';

/**
 * Initialization does not create any connection pool because it
 * needs to reuse the connection from the current Transaction started
 * through the Transaction Service.
 */
const Knex = knex({ client: 'mysql' });

const mainSchema = getConf().dbConf.main.database;
const metaSchema = 'information_schema';

/**
 * TODO: Better configuration strategy? See JOOLIA-2328
 *
 * Note: If the relation does not appear here it SHOULD be handled
 * though the triggers unless the intention is to raise a constraint violation error.
 *
 */
const actions = {
    replace: [
        'activity.createdById',
        'activity_template.createdById',
        'canvas.createdById',
        'canvas_submission.createdById',
        'canvas_submission.userId',
        'file_entry.createdById',
        'format.createdById',
        'format_template.createdById',
        'library.createdById',
        'link_entry.createdById',
        'phase.createdById',
        'phase_template.createdById',
        'step.createdById',
        'step_template.createdById',
        'submission.userId',
        'submission.createdById',
        'team.createdById',
        'user_comment.createdById',
        'user_rating.createdById',
        'workspace.createdById'
    ],
    nullify: []
};

interface ColumnTypeInfo {
    name: string;
    type: ColumnType;
    nullable: boolean;
    defaultValue: unknown;
}

function fakeField(info: ColumnTypeInfo): unknown {
    if (info.name === 'email') {
        return faker.internet.email();
    }

    /**
     * This implies we are married with MySQL engine ;)
     */
    switch (info.type) {
        case 'text':
        case 'varchar':
            return faker.random.word();
        case 'datetime':
            return Date.now();
        case 'float':
            return faker.random.float();
        case 'int':
            return faker.random.number();
        case 'tinyint':
        case 'boolean':
            return faker.random.boolean();
    }

    return null;
}

/**
 * Returns metadata about the required fields of this entity.
 */
async function getRequiredFields(metadata: EntityMetadata): Promise<ColumnTypeInfo[]> {
    const requiredFields: ColumnTypeInfo[] = [];

    metadata.columns.forEach((column) => {
        /**
         * ID-primary field is always required hence no need to include here.
         */
        if (column.propertyName !== 'id') {
            if (!column.isNullable && column.default == null) {
                requiredFields.push({
                    name: column.propertyName,
                    type: column.type,
                    nullable: column.isNullable,
                    defaultValue: column.default
                });
            }
        }
    });

    return requiredFields;
}

async function fakeEntry(metadata: EntityMetadata, id: string, request: Request, connection: any): Promise<any> {
    const entity = metadata.tableName;
    logger.silly('Cloning [%s] (%s)', entity, id);

    const requiredFields = await getRequiredFields(metadata);
    const insertValues = { id: request.jooliaRequestId };

    for (const field of requiredFields) {
        insertValues[field.name] = fakeField(field);
    }

    logger.silly('[%s] required/replaced fields: %o', entity, insertValues);

    const qb = Knex.withSchema(mainSchema)
        .connection(connection)
        .table(entity);

    await qb.clone().insert(insertValues);

    /**
     * Fetch cloned entry
     */
    return qb.where({ id: request.jooliaRequestId }).first();
}

/**
 * Takes care of any references before deleting the entry from the db.
 */
async function rip(metadata: EntityMetadata, id: string, request: Request, connection: any): Promise<void> {
    const entity = metadata.tableName;

    logger.silly('Ripping [%s] (%s)', entity, id);

    //TODO: Use metadata info and avoid this extra query?
    const mqb = Knex.withSchema(metaSchema)
        .connection(connection)
        .from('referential_constraints as rc')
        .innerJoin('key_column_usage as kc', 'rc.constraint_name', 'kc.constraint_name')
        .where('rc.constraint_schema', mainSchema)
        .andWhere('rc.referenced_table_name', entity)
        .orderBy('kc.table_name');

    const references = await mqb.select('rc.referenced_table_name', 'kc.table_name', 'kc.column_name');

    if (references) {
        logger.silly('Found %d references on [user]', references.length, entity);

        let createReplacement = false;

        for (const e of references) {
            /**
             * Do we need a faked replacement for the deleted entry?
             */
            const qualifiedEntity = `${e.table_name}.${e.column_name}`;
            createReplacement = actions.replace.some((e) => qualifiedEntity === e);
            if (createReplacement) break;
        }

        if (createReplacement) {
            const faked = await fakeEntry(metadata, id, request, connection);
            logger.silly('Faked replacement: %o', faked);

            const promises = [];

            for (const e of references) {
                const qualifiedEntity = `${e.table_name}.${e.column_name}`;

                if (actions.replace.includes(qualifiedEntity)) {
                    const condition = {};
                    condition[e.column_name] = id;

                    const fakedData = {};
                    fakedData[e.column_name] = faked.id;

                    promises.push(
                        Knex.withSchema(mainSchema)
                            .connection(connection)
                            .table(e.table_name)
                            .where(condition)
                            .update(fakedData)
                            .then((c) => {
                                logger.silly('%d entries replaced [%s]', c, qualifiedEntity);
                            })
                    );
                } else if (actions.nullify.includes(qualifiedEntity)) {
                    logger.silly('Nullifying on %s', qualifiedEntity);
                } else {
                    logger.silly('Cascade delete on %s', qualifiedEntity);
                }
            }

            if (promises.length === 0) {
                logger.warn('No references actions matched');
            } else {
                await Promise.all(promises);
            }
        }
    }
}

/**
 * Handles the delete logic before the database delete call that will archive the entry
 * through its trigger.
 *
 * Rationale and decisions, read in docs/Archiving.md.
 */
export async function gravedigger(request: Request, response: Response, next: NextFunction): Promise<void> {
    if (request.method === 'DELETE') {
        if (!request.baseUrl.startsWith('/user')) {
            throw new Error('This middleware is hard-coded for the /user endpoint only. See JOOLIA-2400/876.');
        }

        /**
         * TODO: JOOLIA-2400 entityName and entityId should be extract from the request instead
         */
        const entityName = 'user';
        const entityId = request.params.userId;

        await withTransaction(
            async (runner: MysqlQueryRunner) => {
                // Metadata information about the entity and its columns
                const metadata: EntityMetadata = runner.manager.connection.getMetadata(entityName);
                // Reuse the underlying connection. It's not supposed to create a new one at this point.
                const conn = await runner.connect();
                await rip(metadata, entityId, request, conn);
            },
            response,
            next
        );
    } else {
        throw new Error('This is not a DELETE method :/');
    }
}
