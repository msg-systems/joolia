import { ChildEntity, Column, Entity, ManyToOne, TableInheritance } from 'typeorm';
import { FormatMember, Step, SubmissionModifySetting, Team } from './internal';
import { AbstractModel } from './AbstractModel';

@Entity()
@TableInheritance({ column: 'relationType' })
export abstract class StepCheck extends AbstractModel<StepCheck> {
    @Column({
        nullable: false,
        type: 'enum',
        enum: SubmissionModifySetting
    })
    public relationType: SubmissionModifySetting;

    @ManyToOne(() => Step, (step) => step.checks, { nullable: false })
    public step: Step;

    public get isTeamCheck(): boolean {
        switch (this.relationType) {
            case SubmissionModifySetting.TEAM:
                return true;
            case SubmissionModifySetting.MEMBER:
                return false;
            default:
                throw new Error('Unexpected relation type');
        }
    }
}

@ChildEntity(SubmissionModifySetting.TEAM)
export class TeamStepCheck extends StepCheck {
    @ManyToOne(() => Team, (team) => team.steps)
    public team: Team;

    public constructor(obj?) {
        super(obj);
        this.relationType = SubmissionModifySetting.TEAM;
    }
}

@ChildEntity(SubmissionModifySetting.MEMBER)
export class MemberStepCheck extends StepCheck {
    @ManyToOne(() => FormatMember, (member) => member.steps)
    public member: FormatMember;

    public constructor(obj?) {
        super(obj);
        this.relationType = SubmissionModifySetting.MEMBER;
    }
}
