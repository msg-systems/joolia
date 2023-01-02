import { AbstractModel } from './AbstractModel';
import { AfterLoad, ChildEntity, Column, Entity, ManyToOne, OneToMany, TableInheritance } from 'typeorm';
import { CanvasSlot, CanvasSubmissionVote, Team, User } from './internal';

/**
 * Discriminator for the entities in the underlying table through Table Inheritance.
 */
enum CanvasSubmissionOwnerType {
    TEAM = 'Team',
    USER = 'User'
}

@Entity({ name: 'canvas_submission' })
@TableInheritance({ column: 'ownerType' })
export abstract class CanvasSubmission extends AbstractModel<CanvasSubmission> {
    @ManyToOne(() => CanvasSlot, (canvasSlot) => canvasSlot.submissions)
    public slot: CanvasSlot;

    @Column({
        nullable: false,
        type: 'enum',
        enum: CanvasSubmissionOwnerType
    })
    public ownerType: CanvasSubmissionOwnerType;

    @Column({
        type: 'text',
        nullable: false
    })
    public content: string;

    @Column({
        nullable: true
    })
    public color: string;

    @OneToMany(() => CanvasSubmissionVote, (vote) => vote.canvasSubmission)
    public votes: CanvasSubmissionVote[];

    @ManyToOne(() => User)
    public createdBy: User;

    public voteCount: number;

    @AfterLoad()
    setComputed() {
        this.voteCount = this.votes.length;
    }
}

@ChildEntity(CanvasSubmissionOwnerType.TEAM)
export class TeamCanvasSubmission extends CanvasSubmission {
    @ManyToOne(() => Team, (team) => team.canvasSubmissions)
    public team: Team;

    public constructor(obj?: CanvasSubmission) {
        super(obj);
        this.ownerType = CanvasSubmissionOwnerType.TEAM;
    }
}

@ChildEntity(CanvasSubmissionOwnerType.USER)
export class UserCanvasSubmission extends CanvasSubmission {
    @ManyToOne(() => User, (user) => user.canvasSubmissions)
    public user: User;

    public constructor(obj?: CanvasSubmission) {
        super(obj);
        this.ownerType = CanvasSubmissionOwnerType.USER;
    }
}
