import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, Unique } from 'typeorm';
import {
    Format,
    FormatMember,
    LinkEntry,
    StepCheck,
    TeamAvatarFileEntry,
    TeamCanvasSubmission,
    TeamFileEntry,
    TeamStepCheck,
    TeamSubmission,
    User
} from './internal';
import { AbstractModel } from './AbstractModel';

@Entity()
@Unique(['name', 'createdBy', 'format']) // Users can create more than one Team for a Format but name should be unique
export class Team extends AbstractModel<Team> {
    @Column({
        nullable: false
    })
    public name: string;

    @ManyToOne(() => User, { nullable: false })
    public createdBy: User;

    @ManyToOne(() => Format, (format) => format.teams, { nullable: false })
    public format: Format;

    @OneToOne(() => TeamAvatarFileEntry)
    @JoinColumn()
    public avatar: TeamAvatarFileEntry;

    @ManyToMany(() => FormatMember, (participant) => participant.teams, { onDelete: 'NO ACTION' })
    @JoinTable()
    public members: FormatMember[];

    @OneToMany(() => TeamSubmission, (teamSubmission) => teamSubmission.team)
    public submissions: TeamSubmission[];

    @OneToMany(() => TeamStepCheck, (step) => step.team)
    public steps: StepCheck[];

    @OneToMany(() => TeamFileEntry, (file) => file.team, { cascade: true })
    public files: TeamFileEntry[];

    @OneToMany(() => TeamCanvasSubmission, (teamCanvasSubmission) => teamCanvasSubmission.team)
    public canvasSubmissions: TeamSubmission[];

    @OneToOne(() => LinkEntry)
    @JoinColumn()
    public meetingLink: LinkEntry;
}
