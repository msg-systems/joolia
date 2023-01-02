import { AbstractViewRepo, Knex } from './AbstractViewRepo';
import { IQueryOptions } from '../abstractRepo';
import { User, Workspace } from '../../models';
import { logger } from '../../../logger';

export class FormatViewRepo extends AbstractViewRepo {
    protected static readonly defaultSortingField = { column: 'startDate', order: 'desc' };

    public static async getEntity(id: string, user: Partial<User>): Promise<unknown> {
        const qb = Knex.from('format_view as v')
            .innerJoin('format', 'format.id', 'v.id')
            .innerJoin('format_member', 'format.id', 'format_member.formatId')
            .innerJoin('workspace', 'format.workspaceId', 'workspace.id')
            .leftJoin('key_visual_entry', 'format.keyVisualId', 'key_visual_entry.id')
            .leftJoin('file_entry', 'file_entry.id', 'key_visual_entry.keyVisualFileId')
            .leftJoin('link_entry', 'link_entry.id', 'key_visual_entry.keyVisualLinkId')
            .andWhere({ 'format_member.userId': user.id })
            .where({ 'v.id': id });

        const selectQuery = qb
            .clone()
            .select(
                'v.*',
                'format_member.role as userRole',
                'file_entry.id as keyVisualFileId',
                'link_entry.linkUrl as keyVisualUrl',
                'format.workspaceId as workspaceId',
                'format.createdById as createdById',
                'workspace.name as workspaceName'
            );

        logger.silly('SQL: %o', selectQuery.toSQL());
        return selectQuery.first();
    }

    public static async getEntities(
        queryOptions: IQueryOptions,
        user: Partial<User>,
        workspace?: Partial<Workspace>
    ): Promise<[unknown[], number]> {
        const qb = Knex.from('format_view as v')
            .innerJoin('format', 'format.id', 'v.id')
            .innerJoin('format_member', 'format.id', 'format_member.formatId')
            .innerJoin('workspace', 'format.workspaceId', 'workspace.id')
            .leftJoin('key_visual_entry', 'format.keyVisualId', 'key_visual_entry.id')
            .leftJoin('file_entry', 'file_entry.id', 'key_visual_entry.keyVisualFileId')
            .leftJoin('link_entry', 'link_entry.id', 'key_visual_entry.keyVisualLinkId')
            .where({ 'format_member.userId': user.id });

        if (workspace) {
            qb.andWhere({ 'workspace.id': workspace.id });
        }

        const countQuery = await qb.clone().count<Record<string, number>>();

        const selectQuery = qb
            .clone()
            .select(
                'v.*',
                'format_member.role as userRole',
                'file_entry.id as keyVisualFileId',
                'link_entry.id as keyVisualLinkId',
                'format.workspaceId as workspaceId',
                'format.createdById as createdById',
                'workspace.name as workspaceName'
            );

        this.addQueryOptions(selectQuery, queryOptions);

        const [data, count] = await Promise.all([selectQuery.select(), countQuery]);
        return [data, count[0]['count(*)']];
    }
}
