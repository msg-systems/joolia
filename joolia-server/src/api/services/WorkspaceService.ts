import { User, Workspace, WorkspaceMember } from '../models';
import { QueryRunner } from 'typeorm';

/**
 * TODO: Not a service. Move to custom repo instead.
 */
export class WorkspaceService {
    /**
     * @deprecated JOOLIA-1642
     */
    public static async createWorkspace(runner: QueryRunner, workspaceData: Partial<Workspace>, createdBy: User): Promise<Workspace> {
        const workspace = new Workspace(workspaceData);
        workspace.createdBy = createdBy;
        const createdWorkspace = await runner.manager.save(workspace);

        // add creator as member
        const member = new WorkspaceMember();
        member.user = createdBy;
        member.admin = true;
        member.workspace = workspace;
        await runner.manager.save(member, { reload: false });

        return createdWorkspace;
    }
}
