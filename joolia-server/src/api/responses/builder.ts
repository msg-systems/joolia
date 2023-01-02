import { pick } from 'lodash';
import { logger } from '../../logger';
import { DeepPartial } from 'typeorm';
import { User } from '../models';

/**
 * These are collected from the Query URL Parser.
 * Controls what gets serialized as Response.
 *
 * See IQueryOptions also.
 */
export interface IQuerySelect {
    select?: string[];
}

export interface IManyResponseType<T> {
    count: number;
    entities: Array<Partial<T>>;
}

export abstract class RequestBuilder<T> {
    public buildOne(o: unknown): T {
        return this.map(o);
    }

    protected abstract map(o: unknown): T;
}

export abstract class ResponseBuilder<T> {
    public readonly select: Set<string>;
    public readonly responseAttrs: string[] = [];

    public constructor(
        protected readonly querySelect?: IQuerySelect,
        protected readonly user?: DeepPartial<User>,
        protected readonly isOrganizer?: boolean
    ) {
        if (querySelect && querySelect.select) {
            const selectedFields = Array.isArray(querySelect.select) ? querySelect.select : [querySelect.select];
            this.select = new Set(selectedFields);
            this.select.add('id'); // Id is normally required
        }
    }

    public buildOne(obj: unknown): Partial<T> {
        const mappedObj = this.doMap(obj);
        if (this.select) {
            const fields = [...this.select];
            logger.silly('picking fields %s from %o', fields, mappedObj);
            return pick(mappedObj, fields);
        }

        return mappedObj;
    }

    public buildMany(objs: unknown[]): Array<Partial<T>>;
    public buildMany(objs: unknown[], count): IManyResponseType<T>;
    public buildMany(objs: unknown[], count?: number): IManyResponseType<T> | Array<Partial<T>> {
        const createdObjs: Array<Partial<T>> = [];
        for (const o of objs) {
            createdObjs.push(this.buildOne(o));
        }

        if (count !== undefined) {
            return { count, entities: createdObjs };
        }

        return createdObjs;
    }

    /**
     * Maps the internal business objects to the Response object.
     *
     * @param o The internal business object/entity.
     * @return The computed Response object
     */
    protected abstract map(o: unknown): Partial<T>;

    private doMap(o: unknown): Partial<T> {
        const response = this.map(o);
        return pick(response, this.responseAttrs);
    }
}
