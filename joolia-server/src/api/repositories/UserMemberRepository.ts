import { EntityManager, EntityRepository } from 'typeorm';
import { Format, FormatMember, Library, User, Workspace, WorkspaceMember } from '../models';
import { UserRepo } from './UserRepository';
import { logger } from '../../logger';
import { ConflictError } from '../errors';

/**
 * This is a Custom Repository that can handle the relation of
 * Users-Members of Formats, Libraries, Workspaces.
 *
 * Future User-Membership like relations can be handled here.
 */
@EntityRepository()
export class UserMemberRepository {
    constructor(private manager: EntityManager) {}

    public async deleteWorkspaceMembers(workspace: Workspace, emails: string[]): Promise<void> {
        if (!workspace || !emails || emails.length === 0) {
            throw new Error('Cannot build query. Unexpected :/');
        }

        /**
         * Why?
         * https://github.com/typeorm/typeorm/issues/427
         */
        const sqlQuery = `
            DELETE wm
            FROM workspace_member wm
                INNER JOIN user u
            ON wm.userId = u.id
            WHERE
                wm.workspaceId = ?
              AND u.email IN (?);
        `;

        try {
            const res = await this.manager.query(sqlQuery, [workspace.id, emails.toString()]);
            logger.debug('%d members(s) deleted from Workspace %s', res.affectedRows, workspace.id);

            if (res.affectedRows > 0) {
                await this.deleteInactiveUsers(emails);
            }
        } catch (e) {
            if (e.code && e.code.startsWith('ER_ROW_IS_REFERENCED')) {
                throw new ConflictError('Constraint violated.');
            }
            throw e;
        }
    }

    public async deleteLibraryMembers(library: Library, emails: string[]): Promise<void> {
        library.members = library.members.filter((m) => !emails.some((e) => e === m.email));
        await this.manager.save(library);
        await this.deleteInactiveUsers(emails);
    }

    public async deleteFormatMembers(format: Format, emails: string[]): Promise<void> {
        if (!format || !emails || emails.length === 0) {
            throw new Error('Cannot build query. Unexpected :/');
        }

        /**
         * Why?
         * https://github.com/typeorm/typeorm/issues/427
         */
        const sqlQuery = `
            DELETE fm
            FROM format_member fm
                INNER JOIN user u
            ON fm.userId = u.id
            WHERE
                fm.formatId = ?
              AND u.email IN (?);
        `;

        try {
            const res = await this.manager.query(sqlQuery, [format.id, emails.toString()]);
            logger.debug('%d members(s) deleted from Format %s', res.affectedRows, format.id);

            if (res.affectedRows > 0) {
                await this.deleteInactiveUsers(emails);
            }
        } catch (e) {
            if (e.code && e.code.startsWith('ER_ROW_IS_REFERENCED')) {
                throw new ConflictError('Constraint violated.');
            }
            throw e;
        }
    }

    private async deleteInactiveUsers(emails: string[]): Promise<void> {
        const repo = this.manager.getCustomRepository(UserRepo);
        const users = await repo.getUsersByEmail(emails);
        await this.deleteInactivePendingUsers(users);
    }

    private async deleteInactivePendingUsers(users: User[]): Promise<void> {
        await Promise.all(users.map((user) => this.deleteInactivePendingUser(user)));
    }

    private async deleteInactivePendingUser(user: User): Promise<void> {
        if (!user.pending) {
            return;
        }

        const qb1 = this.manager
            .createQueryBuilder(FormatMember, 'formatMember')
            .where('formatMember.userId = :userId', { userId: user.id });

        const formatMemberCount = await qb1.getCount();

        if (formatMemberCount > 0) {
            return;
        }

        const qb2 = this.manager
            .createQueryBuilder(WorkspaceMember, 'workspaceMember')
            .where('workspaceMember.userId = :userId', { userId: user.id });

        const workspaceMemberCount = await qb2.getCount();

        if (workspaceMemberCount > 0) {
            return;
        }

        const qb3 = this.manager
            .createQueryBuilder(Library, 'library')
            .innerJoin('library.members', 'member')
            .where('member.id = :userId', { userId: user.id });

        const libraryMemberCount = await qb3.getCount();

        if (libraryMemberCount > 0) {
            return;
        }

        // if user is pending and not a member of any format, library or workspace (see checks above), delete the user
        await this.manager.getCustomRepository(UserRepo).delete(user.id);
    }
}
