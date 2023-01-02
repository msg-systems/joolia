import { EntityRepository, Repository } from 'typeorm';
import { Workspace, WorkspaceMember } from '../models';

/**
 * Note: WorkspaceMember are fully queried/filtered through the WorkspaceMemberViewRepo.
 * This repository is to be used to write/update entries of the relation.
 *
 */
@EntityRepository(WorkspaceMember)
export class WorkspaceMemberRepo extends Repository<WorkspaceMember> {
    protected entityName = 'workspaceMember';

    public async getEntity(workspace: Workspace, userId: string): Promise<WorkspaceMember> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.user`, 'user')
            .innerJoinAndSelect(`${this.entityName}.workspace`, 'workspace')
            .where('user.id = :userId', { userId })
            .andWhere('workspace.id = :workspaceId', { workspaceId: workspace.id });

        return qb.getOne();
    }

    public async isMember(workspace: Workspace, userEmail: string): Promise<boolean> {
        if (userEmail) {
            const qb = this.createQueryBuilder(this.entityName)
                .innerJoinAndSelect(`${this.entityName}.user`, 'user')
                .innerJoinAndSelect(`${this.entityName}.workspace`, 'workspace')
                .where('user.email = :userEmail', { userEmail })
                .andWhere('workspace.id = :workspaceId', { workspaceId: workspace.id });

            const member = await qb.getOne();
            return member !== undefined;
        }

        return false;
    }

    public async isWorkspaceAdmin(workspace: Workspace, userId: string): Promise<boolean> {
        const member = await this.getEntity(workspace, userId);
        return member !== undefined && member.admin;
    }

    public async countMembersByRole(workspace: Workspace, admin: boolean): Promise<number> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.user`, 'user')
            .innerJoin(`${this.entityName}.workspace`, 'workspace')
            .where('workspace.id = :workspaceId', { workspaceId: workspace.id })
            .andWhere(`${this.entityName}.admin = :admin`, { admin: admin });

        return qb.getCount();
    }

    public async countMembers(workspace: Workspace, memberMails?: string[]): Promise<number> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.user`, 'user')
            .innerJoin(`${this.entityName}.workspace`, 'workspace')
            .where('workspace.id = :workspaceId', { workspaceId: workspace.id });

        if (memberMails) {
            qb.andWhere('user.email IN (:emails)', { emails: memberMails });
        }

        return qb.getCount();
    }

    public async countWorkspacesForUser(userId: string): Promise<number> {
        const query = this.createQueryBuilder(this.entityName)
            .select(`${this.entityName}.userId`)
            .where(`${this.entityName}.userId = :userId`, { userId });
        return query.getCount();
    }
}
