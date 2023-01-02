import { ChildEntity, Column, Entity, ManyToOne, OneToMany, TableInheritance } from 'typeorm';
import { Activity, SubmissionFileEntry, Team, User, UserComment, UserRating } from './internal';
import { AbstractModel } from './AbstractModel';

/**
 * Discriminator for the entities in the underlying table through Table Inheritance.
 */
enum SubmissionOwnerType {
    TEAM = 'Team',
    USER = 'User'
}

@Entity({ name: 'submission' })
@TableInheritance({ column: 'ownerType' })
export abstract class Submission extends AbstractModel<Submission> {
    @Column({
        nullable: false,
        type: 'enum',
        enum: SubmissionOwnerType
    })
    public ownerType: SubmissionOwnerType;

    @Column({
        nullable: true,
        length: 55
    })
    public name: string;

    @Column({
        type: 'text',
        nullable: true
    })
    public description: string;

    @Column({
        type: 'int',
        nullable: false,
        default: 0
    })
    public commentCount: number;

    @Column({
        type: 'float',
        precision: 12,
        nullable: false,
        default: 0.0
    })
    public averageRating: number;

    @Column({
        type: 'int',
        nullable: false,
        default: 0
    })
    public fileCount: number;

    @ManyToOne(() => Activity, (activity) => activity.submissions)
    public activity: Activity;

    @OneToMany(() => SubmissionFileEntry, (file) => file.submission)
    public files: SubmissionFileEntry[];

    @OneToMany(() => UserComment, (comment) => comment.submission)
    public comments: UserComment[];

    @OneToMany(() => UserRating, (rating) => rating.submission)
    public ratings: UserRating[];

    @ManyToOne(() => User, (user) => user.createdSubmissions, { nullable: false })
    public createdBy: User;
}

@ChildEntity(SubmissionOwnerType.TEAM)
export class TeamSubmission extends Submission {
    @ManyToOne(() => Team, (team) => team.submissions)
    public team: Team;

    public constructor(obj?: Submission) {
        super(obj);
        this.ownerType = SubmissionOwnerType.TEAM;
    }
}

@ChildEntity(SubmissionOwnerType.USER)
export class UserSubmission extends Submission {
    @ManyToOne(() => User, (user) => user.submissions)
    public user: User;

    public constructor(obj?: Submission) {
        super(obj);
        this.ownerType = SubmissionOwnerType.USER;
    }
}
