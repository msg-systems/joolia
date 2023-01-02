import { Activity, ActivityCanvas, Canvas } from '../models';
import { DeepPartial, EntityRepository } from 'typeorm';
import { AbstractRepo, IQueryOptions } from './abstractRepo';
import { CanvasStatus } from '../models/CanvasModel';

@EntityRepository(ActivityCanvas)
export class ActivityCanvasRepo extends AbstractRepo<ActivityCanvas> {
    protected readonly entityName = 'activityCanvas';

    public async getEntity(canvasId: string, isOrganizer: boolean): Promise<Canvas> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.slots`, 'slots')
            .where(`${this.entityName}.id = :canvasId`, { canvasId: canvasId });

        /**
         * Only Organizers can see Canvas in all statuses.
         */
        if (!isOrganizer) {
            qb.andWhere(`${this.entityName}.status = :status`, { status: CanvasStatus.PUBLISHED });
        }

        return qb.getOne();
    }

    public async getEntities(
        queryOpts: IQueryOptions,
        activity: DeepPartial<Activity>,
        isOrganizer: boolean
    ): Promise<[ActivityCanvas[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.slots`, 'slots')
            .innerJoin(`${this.entityName}.activity`, 'activity')
            .where('activity.id = :activityId', { activityId: activity.id });

        /**
         * Only Organizers can see Canvas in all statuses.
         */
        if (!isOrganizer) {
            qb.andWhere(`${this.entityName}.status = :status`, { status: CanvasStatus.PUBLISHED });
        }

        this.addQueryOptions(qb, queryOpts);
        return qb.getManyAndCount();
    }

    public async hasCanvasSubmissions(activity: DeepPartial<Activity>): Promise<boolean> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.activity`, 'activity')
            .innerJoin(`${this.entityName}.slots`, 'slots')
            .innerJoin('slots.submissions', 'slotSubmissions')
            .where('activity.id = :activityId', { activityId: activity.id });

        return (await qb.getCount()) > 0;
    }

    public async hasSubmissions(canvasId: string): Promise<boolean> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.slots`, 'slots')
            .innerJoin('slots.submissions', 'slotSubmissions')
            .where(`${this.entityName}.id = :canvasId`, { canvasId });

        return (await qb.getCount()) > 0;
    }
}

// TODO ADD ACTIVITY TEMPLATE CANVAS REPO IN JOOLIA-2002
