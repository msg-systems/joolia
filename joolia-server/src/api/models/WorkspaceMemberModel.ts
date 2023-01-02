import { Column, Entity, ManyToOne } from 'typeorm';
import { User, Workspace } from './internal';
import { AbstractModelWithoutId } from './AbstractModel';

export enum WorkspaceMemberRole {
    ADMIN = 'admin',
    PARTICIPANT = 'participant'
}

/**
 * WorkspaceMember is an enriched relation entity between User & Workspace.
 */
@Entity()
export class WorkspaceMember extends AbstractModelWithoutId<WorkspaceMember> {
    @Column({
        default: false
    })
    public admin: boolean;

    @ManyToOne(() => User, (user) => user.id, { nullable: false, primary: true })
    public user: User;

    @ManyToOne(() => Workspace, (workspace) => workspace.members, { nullable: false, primary: true })
    public workspace: Workspace;
}
