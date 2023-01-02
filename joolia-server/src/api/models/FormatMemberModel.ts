import { Column, Entity, ManyToMany, ManyToOne, OneToMany, Unique } from 'typeorm';
import { Format, MemberStepCheck, StepCheck, Team, User } from './internal';
import { AbstractModel } from './AbstractModel';

export enum FormatMemberRoles {
    ORGANIZER = 'organizer',
    PARTICIPANT = 'participant',
    TECHNICAL = 'technical'
}

@Entity()
@Unique(['user', 'format'])
export class FormatMember extends AbstractModel<FormatMember> {
    @Column({
        type: 'enum',
        enum: FormatMemberRoles,
        default: FormatMemberRoles.PARTICIPANT
    })
    public role: FormatMemberRoles;

    @ManyToOne(() => User, (user) => user.id, { nullable: false })
    public user: User;

    @ManyToOne(() => Format, (format) => format.members, { nullable: false })
    public format: Format;

    @ManyToMany(() => Team, (team) => team.members, { onDelete: 'NO ACTION' })
    public teams: Team[];

    @OneToMany(() => MemberStepCheck, (step) => step.member)
    public steps: StepCheck[];
}
