import { Workspace } from '../../models';
import { IQueryOptions } from '../abstractRepo';
import { AbstractViewRepo, Knex } from './AbstractViewRepo';

export class WorkspaceMemberViewRepo extends AbstractViewRepo {
    public static async getEntities(queryOptions: IQueryOptions, workspace: Partial<Workspace>): Promise<[unknown[], number]> {
        const qb = Knex.from('workspace_member_view as v').where({ 'v.workspaceId': workspace.id });

        this.addFilter(qb, queryOptions.filter);

        const countQuery = await qb.clone().count<Record<string, number>>();
        const selectQuery = qb.clone().select('v.*');

        this.addQueryOptions(selectQuery, queryOptions);

        const [data, count] = await Promise.all([selectQuery.select(), countQuery]);
        return [data, count[0]['count(*)']];
    }
}
