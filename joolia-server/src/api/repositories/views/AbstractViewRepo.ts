import { logger } from '../../../logger';
import { IQueryOptions } from '../abstractRepo';
import * as knex from 'knex';
import { createKnexConn } from '../../../database';

export const Knex = createKnexConn();

/**
 * Base class for View Repositories.
 *
 * TODO: Implement default filtering map. See AbstractRepo.
 *
 */
export class AbstractViewRepo {
    protected static readonly defaultSortingField = { column: 'name', order: 'asc' };

    protected static addQueryOptions(qb: knex.QueryBuilder, queryOpts?: IQueryOptions): void {
        logger.silly('queryOpts: %o', queryOpts);
        this.addPagination(qb, queryOpts.take, queryOpts.skip);
        this.addSort(qb, queryOpts.order);
        logger.silly('SQL: %o', qb.toSQL());
    }

    protected static addFilter(qb: knex.QueryBuilder, filter?: unknown): void {
        /**
         * This is a port of the abstractRepo#addFilter for Knex Query Builder.
         */
        if (filter) {
            qb.andWhere((builder) => {
                for (const [field, value] of Object.entries(filter)) {
                    if (Array.isArray(value)) {
                        value.forEach((arrVal) => {
                            const operator = this.mapOperator(arrVal);
                            builder.orWhere(field, operator, arrVal);
                        });
                    } else {
                        const operator = this.mapOperator(value);
                        builder.andWhere(field, operator, value);
                    }
                }
            });
        }
    }

    protected static addPagination(qb: knex.QueryBuilder, take = 100, skip = 0): void {
        qb.offset(skip).limit(take);
    }

    protected static addSort(qb: knex.QueryBuilder, order?: { [k: string]: 'asc' | 'ASC' | 'desc' | 'DESC' }): void {
        const orderByList = [];
        if (order) {
            for (const f in order) {
                orderByList.push({ column: this.buildSortFromField(qb, f), order: order[f] });
            }
        } else {
            orderByList.push({
                column: this.buildSortFromField(qb, this.defaultSortingField.column),
                order: this.defaultSortingField.order
            });
        }
        qb.orderBy(orderByList);
    }

    private static buildSortFromField(qb: knex.QueryBuilder, field: string): string {
        // Using COALESCE with default value 'zzz' we send the nulls to the last position
        qb.select(Knex.raw(`COALESCE(v.${field},'zzz') AS NoNulls${field}`));
        return `NoNulls${field}`;
    }

    // Currently supported two cases boolean(operator equal) and string(operator like)
    private static mapOperator(value: unknown): string {
        if (typeof value === 'boolean') {
            return '=';
        }

        return 'like';
    }
}
