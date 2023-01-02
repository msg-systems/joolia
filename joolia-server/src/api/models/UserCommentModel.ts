import { Submission, User } from './internal';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractModel } from './AbstractModel';

@Entity()
export class UserComment extends AbstractModel<UserComment> {
    @Column({
        type: 'text',
        nullable: true
    })
    public comment: string;

    @ManyToOne(() => Submission, (submission) => submission.comments, { nullable: false })
    public submission: Submission;

    @ManyToOne(() => User, { nullable: false })
    public createdBy: User;
}
