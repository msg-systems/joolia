import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { FormatFileEntry, FormatMember, KeyVisualEntry, LinkEntry, Phase, Team, User, Workspace } from './internal';
import { AbstractModel } from './AbstractModel';

@Entity()
export class Format extends AbstractModel<Format> {
    @Column({
        nullable: true
    })
    public name: string;

    @Column({
        nullable: true,
        type: 'text'
    })
    public description: string;

    @OneToOne(() => LinkEntry)
    @JoinColumn()
    public meetingLink: LinkEntry;

    @Column({
        nullable: true,
        type: 'text'
    })
    public shortDescription: string;

    @Column({
        default: false
    })
    public containsTechnicalUser: boolean;

    @ManyToOne(() => User, { nullable: false })
    public createdBy: User;

    @OneToMany(() => Phase, (phase) => phase.format)
    public phases: Phase[];

    @ManyToOne(() => Workspace, { nullable: false })
    public workspace: Workspace;

    @OneToMany(() => FormatMember, (member) => member.format)
    public members: FormatMember[];

    @OneToMany(() => Team, (team) => team.format)
    public teams: Team[];

    @OneToMany(() => FormatFileEntry, (file) => file.format, { cascade: true })
    public files: FormatFileEntry[];

    @OneToOne(() => KeyVisualEntry)
    @JoinColumn()
    public keyVisual: KeyVisualEntry;
}
