/* eslint-disable @typescript-eslint/ban-types */

import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

interface IModel {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Base model for all entities.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export abstract class AbstractModel<T = {}> extends BaseEntity implements IModel {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    public constructor(obj?: Partial<T>) {
        super();
        if (obj) {
            Object.assign(this, obj);
        }
    }
}

type DateInfo = 'createdAt' | 'updatedAt';

/**
 * Models without DateInfo.
 */
export abstract class AbstractModelWithoutDateInfo<T = {}> extends BaseEntity implements Omit<IModel, DateInfo> {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    public constructor(obj?: Partial<T>) {
        super();
        if (obj) {
            Object.assign(this, obj);
        }
    }
}

/**
 * Models without ID field as primary Key.
 */
export abstract class AbstractModelWithoutId<T = {}> extends BaseEntity implements Pick<IModel, DateInfo> {
    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    public constructor(obj?: Partial<T>) {
        super();
        if (obj) {
            Object.assign(this, obj);
        }
    }
}
