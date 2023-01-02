import { User } from '../../models';
import { IQueryOptions } from '../abstractRepo';
import { AbstractViewRepo, Knex } from './AbstractViewRepo';
import { logger } from '../../../logger';

export class WorkspaceViewRepo extends AbstractViewRepo {
    public static async getEntity(id: string, user: Partial<User>): Promise<unknown> {
        const qb = Knex.from('workspace_view as v')
            .innerJoin('workspace_member as m', 'm.workspaceId', 'v.id')
            .innerJoin('workspace', 'workspace.id', 'v.id')
            .leftJoin('file_entry', 'workspace.logoId', 'file_entry.id')
            .where({ 'v.id': id })
            .andWhere({ 'm.userId': user.id });

        const selectQuery = qb.clone().select('v.*', 'm.admin', 'file_entry.id as logoId');
        logger.silly('SQL: %o', selectQuery.toSQL());

        return selectQuery.first();
    }

    public static async getEntities(queryOptions: IQueryOptions, user: Partial<User>): Promise<[unknown[], number]> {
        const qb = Knex.from('workspace_view as v')
            .innerJoin('workspace_member as m', 'm.workspaceId', 'v.id')
            .innerJoin('workspace', 'workspace.id', 'v.id')
            .leftJoin('file_entry', 'workspace.logoId', 'file_entry.id')
            .where({ 'm.userId': user.id });

        const countQuery = await qb.clone().count<Record<string, number>>();
        const selectQuery = qb.clone().select('v.*', 'm.admin', 'file_entry.id as logoId');

        this.addQueryOptions(selectQuery, queryOptions);

        const [data, count] = await Promise.all([selectQuery.select(), countQuery]);
        return [data, count[0]['count(*)']];
    }
}
