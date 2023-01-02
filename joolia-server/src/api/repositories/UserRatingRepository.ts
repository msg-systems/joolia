import { Submission, User, UserRating } from '../models';
import { EntityRepository } from 'typeorm';
import { AbstractRepo } from './abstractRepo';

@EntityRepository(UserRating)
export class UserRatingRepository extends AbstractRepo<UserRating> {
    protected readonly entityName = 'userRating';
    protected readonly defaultSortingField = 'createdAt';

    public async getEntity(submission: Submission, user: User): Promise<UserRating> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'userAvatar')
            .leftJoinAndSelect('userAvatar.createdBy', 'userAvatarCreatedBy')
            .innerJoin(`${this.entityName}.submission`, 'submission')
            .where('submission.id = :submissionId', { submissionId: submission.id })
            .andWhere('createdBy.id = :userId', { userId: user.id });

        return qb.getOne();
    }

    public async getSubmissionRatings(submission: Submission): Promise<[UserRating[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.submission`, 'submission')
            .where('submission.id = :submissionId', { submissionId: submission.id });

        return qb.getManyAndCount();
    }
}
