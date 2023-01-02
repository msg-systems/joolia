import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { User, WorkspaceMember } from './internal';
import { AbstractModel } from './AbstractModel';
import { WorkspaceLogoFileEntry } from './FileEntryModel';

@Entity()
export class Workspace extends AbstractModel<Workspace> {
    @Column({
        nullable: true
    })
    public name: string;

    @Column({
        nullable: true,
        type: 'text'
    })
    public description: string;

    @Column({
        nullable: true,
        select: false
    })
    public licensesCount: number;

    @Column({
        nullable: true
    })
    public tenant: string;

    @Column({
        nullable: true
    })
    public domain: string;

    @Column({
        nullable: true
    })
    public consentDate: Date;

    @ManyToOne(() => User, { nullable: false })
    public createdBy: User;

    @OneToMany(() => WorkspaceMember, (member) => member.workspace)
    public members: WorkspaceMember[];

    @OneToOne(() => WorkspaceLogoFileEntry, (logo) => logo.workspace)
    @JoinColumn()
    public logo: WorkspaceLogoFileEntry;
}
