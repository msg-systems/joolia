import { Brackets, DeepPartial, Repository, SaveOptions, SelectQueryBuilder } from 'typeorm';
import { ConflictError } from '../errors';
import { logger } from '../../logger';
import { AbstractModel } from '../models/AbstractModel';
import { merge, pick } from 'lodash';

/**
 * These are collected from the Query URL Parser.
 *
 * The projection (select) is used to build the response objects and does not change the SQL query generated
 * hence is not handled by any Repository.
 *
 * See ResponseBuilder.
 */
export interface IQueryOptions {
    take?: number;
    skip?: number;

    filter?: {
        [k: string]: string | string[];
    };

    order?: {
        [k: string]: 'asc' | 'ASC' | 'desc' | 'DESC';
    };
}

export abstract class AbstractRepo<T> extends Repository<T> {
    protected readonly entityName: string;
    protected readonly fieldToFilterAndSortMap: { [k: string]: string | string[] };
    protected readonly defaultSortingField: string = 'name';

    protected addQueryOptions(qb: SelectQueryBuilder<T>, queryOpts?: IQueryOptions): void {
        logger.silly('queryOpts: %o', queryOpts);
        this.addFilter(qb, queryOpts.filter);
        this.addPagination(qb, queryOpts.take, queryOpts.skip);
        this.addSort(qb, queryOpts.order);
    }

    protected addSort(qb: SelectQueryBuilder<T>, order?: { [k: string]: 'asc' | 'ASC' | 'desc' | 'DESC' }): void {
        const orderDict = {};
        if (order) {
            for (const field in order) {
                orderDict[this.buildSortFromField(qb, field)] = order[field];
                // if mapping of the sorting field contains only one field, the ordering is done on that field and also on
                // the corresponding NoNulls field; mappings which containg multiple fields will be processed as usual,
                // without this part
                const mapping = this.mapSortToOrderClause(field);
                if (!Array.isArray(mapping)) {
                    orderDict[`${mapping.toString()}`] = order[field];
                }
            }
        } else {
            orderDict[this.buildSortFromField(qb, this.defaultSortingField)] = 'asc';
            const mappingDefaultSortingField = this.mapSortToOrderClause(this.defaultSortingField);
            orderDict[`${mappingDefaultSortingField.toString()}`] = 'asc';
        }
        qb.orderBy(orderDict);
    }

    private buildSortFromField(qb: SelectQueryBuilder<T>, field: string): string {
        const mapping = this.mapSortToOrderClause(field);
        if (Array.isArray(mapping)) {
            // Multiple fields make reference to child entity fields, COALESCE takes the first value that is not null
            // creating a combination column that can be used for sorting https://dev.mysql.com/doc/refman/5.7/en/comparison-operators.html#function_coalesce
            qb.addSelect(`COALESCE(${mapping.toString()})`, 'combination');
            return 'combination';
        } else {
            // Using IS NULL, either 0 or 1 is put in a new field added to the result table; this signals whether or not
            // the mapping field is null
            qb.addSelect(`${mapping.toString()} IS NULL`, `NoNulls${mapping.replace('.', '')}`);
            return `NoNulls${mapping.replace('.', '')}`;
        }
    }

    protected addPagination(qb: SelectQueryBuilder<T>, take = 100, skip = 0): void {
        if (take) {
            qb.take(take);
        }

        if (skip) {
            qb.skip(skip);
        }
    }

    // Currently supported two cases boolean(operator equal) and string(operator like)
    private static createParamMapping(value: unknown, index: number): [string, unknown, string] {
        const mapping = {};
        const param = `value${index}`;
        let operator;
        if (typeof value === 'boolean') {
            operator = '=';
            mapping[param] = value;
        } else {
            operator = 'like';
            mapping[param] = `%${value}%`;
        }

        return [param, mapping, operator];
    }

    private addFilter(qb: SelectQueryBuilder<T>, filter?: unknown): void {
        if (filter) {
            let param,
                mapping,
                operator,
                fieldIdx = 0;

            qb.andWhere(
                new Brackets((builder) => {
                    for (const [field, value] of Object.entries(filter)) {
                        const whereClause = this.mapFilterToWhereClause(field);
                        if (Array.isArray(value)) {
                            value.forEach((v, idx) => {
                                [param, mapping, operator] = AbstractRepo.createParamMapping(v, idx);
                                builder.orWhere(`${whereClause} ${operator} :${param}`, mapping);
                            });
                        } else {
                            [param, mapping, operator] = AbstractRepo.createParamMapping(value, fieldIdx++);
                            builder.andWhere(`${whereClause} ${operator} :${param}`, mapping);
                        }
                    }
                })
            );
        }
    }

    private mapFilterToWhereClause(urlField: string): string | string[] {
        if (!this.fieldToFilterAndSortMap || !(urlField in this.fieldToFilterAndSortMap)) {
            return `${this.entityName}.${urlField}`;
        }

        const v = this.fieldToFilterAndSortMap[urlField];

        if (Array.isArray(v)) {
            return `CONCAT_WS('', ${v.toString()})`;
        }

        return v;
    }

    private mapSortToOrderClause(urlField: string): string | string[] {
        if (!this.fieldToFilterAndSortMap || !(urlField in this.fieldToFilterAndSortMap)) {
            return `${this.entityName}.${urlField}`;
        }
        return this.fieldToFilterAndSortMap[urlField];
    }

    public async patchEntity<K extends DeepPartial<T>>(
        target: K,
        source: K,
        options: { partial?: boolean } = { partial: true }
    ): Promise<K> {
        if ('id' in source) {
            throw new Error('Cannot patch id field'); // Guarded by validators, but just in case..
        }

        const patched = merge(target, source);
        const updatedObj = await this.save(patched);

        if (options.partial) {
            const fieldsToPick = Object.keys(updatedObj)
                .filter((k) => Object.keys(source).includes(k))
                .concat('id');
            return pick(updatedObj, fieldsToPick);
        }

        return updatedObj;
    }

    public async saveEntity<K extends DeepPartial<T>>(entity: K, options?: SaveOptions): Promise<K> {
        try {
            return await this.save(entity, options);
        } catch (e) {
            logger.error('DB Error', e);
            if (e.code === 'ER_DUP_ENTRY') {
                throw new ConflictError('Duplicated Entry.');
            }
            throw e;
        }
    }

    public async deleteEntity(idOrEntity: string | T): Promise<void> {
        try {
            const deleteRes = idOrEntity instanceof AbstractModel ? await this.delete(idOrEntity.id) : await this.delete(idOrEntity);
            if (deleteRes.affected === 0) {
                logger.warn('Nothing was deleted');
            }
        } catch (e) {
            logger.error('DB Error', e);
            if (e.code && e.code.startsWith('ER_ROW_IS_REFERENCED')) {
                throw new ConflictError('Constraint violated.');
            }
            throw e;
        }
    }
}
