import { Submission, User } from './internal';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractModel } from './AbstractModel';

@Entity()
export class UserRating extends AbstractModel<UserRating> {
    @Column({
        type: 'float',
        precision: 12,
        nullable: false,
        default: 0.0
    })
    public rating: number;

    @ManyToOne(() => Submission, (submission) => submission.ratings, { nullable: false })
    public submission: Submission;

    @ManyToOne(() => User, { nullable: false })
    public createdBy: User;

    /**
     * Rounds rating in insertion and update
     */
    public static roundRating(rating: number): number {
        if (rating < 0.5 || rating > 5) {
            throw new Error('Rating value out of range');
        }

        const ratingStep = 0.5; // if changed all stored database entries must be fixed!!!
        const k = 1 / ratingStep;
        return Math.ceil(rating * k) / k;
    }
}
