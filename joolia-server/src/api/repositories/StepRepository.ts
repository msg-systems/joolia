import { EntityRepository } from 'typeorm';
import { Activity, Step } from '../models';
import { AbstractRepo, IQueryOptions } from './abstractRepo';

@EntityRepository(Step)
export class StepRepo extends AbstractRepo<Step> {
    protected readonly entityName = 'step';
    protected readonly defaultSortingField = 'position';

    public async getEntities(queryOpts: IQueryOptions, activity: Activity): Promise<[Step[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.activity`, 'activity')
            .leftJoinAndSelect(`${this.entityName}.checks`, 'checks')
            .leftJoinAndSelect('checks.team', 'team')
            .leftJoinAndSelect('checks.member', 'formatMember')
            .leftJoinAndSelect('formatMember.user', 'user')
            .where('activity.id = :activityId', { activityId: activity.id });

        this.addQueryOptions(qb, queryOpts);
        return qb.getManyAndCount();
    }

    public async getEntity(queryOpts: IQueryOptions, activity: Activity, stepId: string): Promise<Step> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.activity`, 'activity')
            .leftJoinAndSelect(`${this.entityName}.checks`, 'checks')
            .leftJoinAndSelect('checks.team', 'team')
            .leftJoinAndSelect('checks.member', 'formatMember')
            .leftJoinAndSelect('formatMember.user', 'user')
            .where('activity.id = :activityId', { activityId: activity.id })
            .andWhere(`${this.entityName}.id = :stepId`, { stepId });

        this.addQueryOptions(qb, queryOpts);
        return qb.getOne();
    }

    public async getNextPosition(activity: Activity): Promise<number> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.activity`, 'activity')
            .where('activity.id = :activityId', { activityId: activity.id });

        return qb.getCount();
    }

    public async updatePositionAnDelete(step: Step): Promise<void> {
        const qb = this.createQueryBuilder('step')
            .update()
            .set({ position: () => 'position - 1' })
            .where('activityId = :activity', { activity: step.activity.id })
            .andWhere('position > :oldPosition', { oldPosition: step.position });

        await Promise.all([qb.execute(), this.deleteEntity(step.id)]);
    }
}
