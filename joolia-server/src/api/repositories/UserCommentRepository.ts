import { Submission, User, UserComment } from '../models';
import { EntityRepository } from 'typeorm';
import { AbstractRepo, IQueryOptions } from './abstractRepo';

@EntityRepository(UserComment)
export class UserCommentRepository extends AbstractRepo<UserComment> {
    protected readonly entityName = 'userComment';
    protected readonly defaultSortingField = 'createdAt';

    public async getEntities(queryOptions: IQueryOptions, submission: Submission, user?: User): Promise<[UserComment[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'userAvatar')
            .leftJoinAndSelect('userAvatar.createdBy', 'userAvatarCreatedBy')
            .innerJoin(`${this.entityName}.submission`, 'submission')
            .leftJoin('submission.user', 'user')
            .leftJoin('submission.team', 'team')
            .leftJoin('team.members', 'members')
            .leftJoin('members.user', 'teamMember')
            .where('submission.id = :submissionId', { submissionId: submission.id });

        if (user) {
            qb.andWhere('user.id = :userId', { userId: user.id });
        }

        this.addQueryOptions(qb, queryOptions);
        return qb.getManyAndCount();
    }

    public async getEntity(id: string, submission: Submission): Promise<UserComment> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'userAvatar')
            .leftJoinAndSelect('userAvatar.createdBy', 'userAvatarCreatedBy')
            .innerJoin(`${this.entityName}.submission`, 'submission')
            .where('submission.id = :submissionId', { submissionId: submission.id })
            .andWhere(`${this.entityName}.id = :id`, { id });

        return qb.getOne();
    }
}
