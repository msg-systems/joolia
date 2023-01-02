import { EntityRepository } from 'typeorm';
import { Workspace } from '../models';
import { AbstractRepo } from './abstractRepo';

@EntityRepository(Workspace)
export class WorkspaceRepo extends AbstractRepo<Workspace> {
    protected readonly entityName = 'workspace';

    public async getEntity(id: string): Promise<Workspace> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.logo`, 'logo')
            .where(`${this.entityName}.id = :id`, { id });

        return qb.getOne();
    }
}
