import { DeepPartial, EntityRepository, SaveOptions, UpdateQueryBuilder } from 'typeorm';
import { Activity, Phase } from '../models';
import AbstractRepository from './AbstractRepository';
import { AbstractRepo, IQueryOptions } from './abstractRepo';

@EntityRepository(Activity)
export class ActivityRepo extends AbstractRepo<Activity> {
    protected readonly entityName = 'activity';

    public async getEntities(queryOpts: IQueryOptions, phase: DeepPartial<Phase>): Promise<[Activity[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.phase`, 'phase')
            .leftJoinAndSelect(`${this.entityName}.keyVisual`, 'keyVisual')
            .leftJoinAndSelect(`${this.entityName}.collaborationLinks`, 'collaborationLinks')
            .leftJoinAndSelect('keyVisual.keyVisualFile', 'keyVisualFile')
            .leftJoinAndSelect('keyVisual.keyVisualLink', 'keyVisualLink')
            .leftJoinAndSelect(`${this.entityName}.configuration`, 'configuration')
            .leftJoinAndSelect(`${this.entityName}.steps`, 'step')
            .leftJoinAndSelect(`${this.entityName}.submissions`, 'submission')
            .where('phase.id = :phaseId', { phaseId: phase.id });

        this.addQueryOptions(qb, queryOpts);
        return qb.getManyAndCount();
    }

    public async getEntity(activityId: string): Promise<Activity> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.phase`, 'phase')
            .leftJoinAndSelect(`${this.entityName}.keyVisual`, 'keyVisual')
            .leftJoinAndSelect(`${this.entityName}.collaborationLinks`, 'collaborationLinks')
            .leftJoinAndSelect('keyVisual.keyVisualFile', 'keyVisualFile')
            .leftJoinAndSelect('keyVisualFile.createdBy', 'keyVisualFileCreatedBy')
            .leftJoinAndSelect('keyVisual.keyVisualLink', 'keyVisualLink')
            .leftJoinAndSelect('keyVisualLink.createdBy', 'keyVisualLinkCreatedBy')
            .leftJoinAndSelect(`${this.entityName}.configuration`, 'configuration')
            .where(`${this.entityName}.id = :activityId`, { activityId });

        return qb.getOne();
    }

    public async getEntityWithSubmissions(activityId: string): Promise<Activity> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.submissions`, 'submission')
            .leftJoinAndSelect('submission.team', 'team')
            .leftJoinAndSelect('team.members', 'members')
            .leftJoinAndSelect('members.user', 'teamMember')
            .leftJoinAndSelect('submission.user', 'user')
            .leftJoinAndSelect(`${this.entityName}.configuration`, 'configuration')
            .where(`${this.entityName}.id = :activityId`, { activityId });

        return qb.getOne();
    }

    public async getEntityWithSteps(activityId: string): Promise<Activity> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.submissions`, 'submission')
            .leftJoinAndSelect(`${this.entityName}.steps`, 'step')
            .leftJoinAndSelect('step.checks', 'stepCheck')
            .where(`${this.entityName}.id = :activityId`, { activityId });

        return qb.getOne();
    }

    public async patchEntity<K extends DeepPartial<Activity>>(
        activity: K,
        fields: K,
        options: { partial?: boolean } = { partial: true }
    ): Promise<K> {
        if (fields.position) {
            const count = await this.countActivities(activity.phase.id);

            if (fields.position >= count) {
                fields.position = count;

                const qb = this.createQueryBuilder(this.entityName)
                    .update()
                    .set({ position: () => 'position + 1' })
                    .where('phaseId = :phaseId', { phaseId: activity.phase.id })
                    .andWhere('position >= :newPosition', { newPosition: fields.position });

                /**
                 * Why not qb.execute()?
                 * Because fires up the Listeners, not desired here. Instead runs the raw query.
                 */
                const [sql, parameters] = qb.getQueryAndParameters();
                await this.query(sql, parameters);
            }
        }

        return super.patchEntity(activity, fields, options);
    }

    public async deleteEntity(activity: Activity): Promise<void> {
        const query = this.createQueryBuilder(this.entityName)
            .update()
            .set({ position: () => 'position - 1' })
            .where('phaseId = :phaseId', { phaseId: activity.phase.id })
            .andWhere('position > :oldPosition', { oldPosition: activity.position });

        const [sql, parameters] = query.getQueryAndParameters();
        await this.query(sql, parameters);

        await this.delete(activity.id);
    }

    public async saveEntity<K extends DeepPartial<Activity>>(activity: K, options?: SaveOptions): Promise<K> {
        const count = await this.countActivities(activity.phase.id);

        if (!activity.position || activity.position >= count) {
            // when new position larger then activity count
            activity.position = count;
        }

        const query = this.createQueryBuilder(this.entityName)
            .update()
            .set({ position: () => 'position + 1' })
            .where('phaseId = :phaseId', { phaseId: activity.phase.id })
            .andWhere('position >= :newPosition', { newPosition: activity.position });

        const [sql, parameters] = query.getQueryAndParameters();
        await this.query(sql, parameters);

        return await super.saveEntity(activity, options);
    }

    public async reorder(activity: Activity, newPosition: number): Promise<Activity> {
        const count = await this.countActivities(activity.phase.id);

        let query: UpdateQueryBuilder<Activity>;

        if (newPosition >= count) {
            newPosition = count - 1;
        }

        if (newPosition >= activity.position) {
            // move activity to the back
            query = this.createQueryBuilder(this.entityName)
                .update()
                .set({ position: () => 'position - 1' })
                .where('phaseId = :phaseId', { phaseId: activity.phase.id })
                .andWhere('position > :oldPosition', { oldPosition: activity.position })
                .andWhere('position <= :newPosition', { newPosition: newPosition });
        }

        if (newPosition < activity.position) {
            // move activity to the front
            query = this.createQueryBuilder(this.entityName)
                .update()
                .set({ position: () => 'position + 1' })
                .where('phaseId = :phaseId', { phaseId: activity.phase.id })
                .andWhere('position >= :newPosition', { newPosition: newPosition })
                .andWhere('position < :oldPosition', { oldPosition: activity.position });
        }

        const [sql, parameters] = query.getQueryAndParameters();
        await this.query(sql, parameters);

        activity.position = newPosition;
        return await super.saveEntity(activity);
    }

    private async countActivities(phaseId: string): Promise<number> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.phase`, 'phase')
            .where('phase.id = :phaseId', { phaseId });

        return qb.getCount();
    }
}

/**
 * @deprecated
 */
@EntityRepository(Activity)
export class ActivityRepository extends AbstractRepository<Activity> {
    protected prefix = 'activity';
    protected relations = ['steps', 'submissions'];
    protected dynamicFields = ['configuration', 'keyVisual'];

    public async createActivity(activity: Activity): Promise<Activity> {
        const count = await this.createQueryBuilder('activity')
            .where('phaseId = :phase', { phase: activity.phase.id })
            .getCount();

        if (!activity.position || activity.position >= count) {
            // when new position larger then activity count
            activity.position = count;
        }

        const query = this.createQueryBuilder('activity')
            .update()
            .set({ position: () => 'position + 1' })
            .where('phaseId = :phase', { phase: activity.phase.id })
            .andWhere('position >= :newPosition', { newPosition: activity.position });

        const [sql, parameters] = query.getQueryAndParameters();
        await this.query(sql, parameters);

        return await this.manager.save(activity);
    }
}
