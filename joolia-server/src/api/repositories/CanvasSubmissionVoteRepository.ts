import { EntityRepository } from 'typeorm';
import { AbstractRepo } from './abstractRepo';
import { CanvasSubmission, CanvasSubmissionVote, User } from '../models';

@EntityRepository(CanvasSubmissionVote)
export class CanvasSubmissionVoteRepository extends AbstractRepo<CanvasSubmissionVote> {
    protected readonly entityName = 'canvasSubmissionVote';

    public async getEntities(canvasSubmission: CanvasSubmission): Promise<[CanvasSubmissionVote[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .innerJoin(`${this.entityName}.canvasSubmission`, 'submission')
            .where('submission.id = :submissionId', { submissionId: canvasSubmission.id });

        return qb.getManyAndCount();
    }

    public async getEntityByUser(canvasSubmission: CanvasSubmission, user: User): Promise<CanvasSubmissionVote> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .innerJoin(`${this.entityName}.canvasSubmission`, 'submission')
            .where('submission.id = :submissionId', { submissionId: canvasSubmission.id })
            .andWhere('createdBy.id = :userId', { userId: user.id });

        return qb.getOne();
    }
}
