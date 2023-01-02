import { IArchivedEntry } from '../../models/archive';
import { createKnexConn } from '../../../database';
import { getConf } from '../../../config';

const knex = createKnexConn();
const schema = getConf().dbConf.archive.database;

export class ArchiveRepo {
    public static async getFormats(requestId?: string): Promise<[IArchivedEntry[], number]> {
        return ArchiveRepo.getArchivedEntries('format', requestId);
    }

    public static async getWorkspaceMembers(requestId?: string): Promise<[IArchivedEntry[], number]> {
        return ArchiveRepo.getArchivedEntries('workspace_member', requestId);
    }

    public static async getFormatMembers(requestId?: string): Promise<[IArchivedEntry[], number]> {
        return ArchiveRepo.getArchivedEntries('format_member', requestId);
    }

    public static async getTeamMembers(requestId?: string): Promise<[IArchivedEntry[], number]> {
        return ArchiveRepo.getArchivedEntries('team_members_format_member', requestId);
    }

    public static async getStepChecks(requestId?: string): Promise<[IArchivedEntry[], number]> {
        return ArchiveRepo.getArchivedEntries('step_check', requestId);
    }

    // These methods may be useful when the restore feature needs to be implemented. See JOOLIA-2357.
    // public static async getArchivedEntries(table: string, deletedAtStartDate: Date): Promise<[IArchivedEntry[], number]>
    // public static async getArchivedEntries(table: string, deletedById: {userId?: string, userEmail: string}): Promise<[IArchivedEntry[], number]>
    private static async getArchivedEntries(table: string, requestId?: string): Promise<[IArchivedEntry[], number]> {
        const qb = knex.withSchema(schema).from(table);

        if (requestId) {
            qb.where({ requestId });
        }

        const countQuery = await qb.clone().count<Record<string, number>>();
        const [data, count] = await Promise.all([qb.select(), countQuery]);

        return [data, count[0]['count(*)']];
    }
}
