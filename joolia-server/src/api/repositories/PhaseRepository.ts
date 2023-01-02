import { DeepPartial, EntityRepository } from 'typeorm';
import { Format, Phase } from '../models';
import { AbstractRepo, IQueryOptions } from './abstractRepo';

@EntityRepository(Phase)
export class PhaseRepo extends AbstractRepo<Phase> {
    protected readonly entityName = 'phase';

    public async getEntities(queryOpts: IQueryOptions, format: DeepPartial<Format>): Promise<[Phase[], number]> {
        return this.doGetEntities(queryOpts, format, true);
    }

    public async getEntitiesAsOrganizer(queryOpts: IQueryOptions, format: DeepPartial<Format>): Promise<[Phase[], number]> {
        return this.doGetEntities(queryOpts, format);
    }

    public async getEntity(phaseId: string, format: DeepPartial<Format>): Promise<Phase> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.activities`, 'activity')
            .innerJoin(`${this.entityName}.format`, 'format')
            .where('format.id = :formatId', { formatId: format.id })
            .andWhere(`${this.entityName}.id = :phaseId`, { phaseId });

        return qb.getOne();
    }

    private async doGetEntities(queryOpts: IQueryOptions, format: DeepPartial<Format>, visibleOnly?: boolean): Promise<[Phase[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.format`, 'format')
            .leftJoinAndSelect(`${this.entityName}.activities`, 'activity')
            .where('format.id = :formatId', { formatId: format.id });

        if (visibleOnly && visibleOnly === true) {
            qb.andWhere(`${this.entityName}.visible = :visibleOnly`, { visibleOnly });
        }

        this.addQueryOptions(qb, queryOpts);
        return qb.getManyAndCount();
    }
}
