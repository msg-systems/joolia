import { CanvasSubmission, User } from './internal';
import { Entity, ManyToOne } from 'typeorm';
import { AbstractModel } from './AbstractModel';

@Entity()
export class CanvasSubmissionVote extends AbstractModel<CanvasSubmissionVote> {
    @ManyToOne(() => CanvasSubmission, (canvasSubmission) => canvasSubmission.votes, { nullable: false })
    public canvasSubmission: CanvasSubmission;

    @ManyToOne(() => User, { nullable: false })
    public createdBy: User;
}
