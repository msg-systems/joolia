import { Canvas, CanvasSubmission, TeamCanvasSubmission, User, UserCanvasSubmission } from '../models';
import { Brackets, EntityRepository } from 'typeorm';
import { AbstractRepo, IQueryOptions } from './abstractRepo';

@EntityRepository(CanvasSubmission)
export class CanvasSubmissionRepository<T extends CanvasSubmission> extends AbstractRepo<T> {
    protected entityName = 'canvas_submission';
    protected readonly defaultSortingField: string = 'createdAt';
    protected readonly fieldToFilterAndSortMap = {
        submittedBy: ['user.id', 'team.id']
    };

    public async getEntities(canvas: Canvas, queryOptions: IQueryOptions, user?: User): Promise<[T[], number]> {
        if (!user) {
            return this.getSubmissionsByCanvas(canvas.id, queryOptions);
        }
        return this.getSubmissionsByUser(canvas.id, user.id, queryOptions);
    }

    public async getEntity(submissionId: string): Promise<T> {
        return this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect(`${this.entityName}.team`, 'team')
            .leftJoinAndSelect(`${this.entityName}.user`, 'user')
            .leftJoinAndSelect(`${this.entityName}.votes`, `votes`)
            .leftJoinAndSelect(`votes.createdBy`, 'voteCreatedBy')
            .where(`${this.entityName}.id = :sId`, { sId: submissionId })
            .getOne();
    }

    protected async getSubmissionsByCanvas(canvasId: string, queryOptions: IQueryOptions): Promise<[T[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.slot`, 'slot')
            .leftJoinAndSelect(`${this.entityName}.team`, 'team')
            .leftJoinAndSelect(`${this.entityName}.user`, 'user')
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoin('slot.canvas', 'canvas')
            .leftJoinAndSelect(`${this.entityName}.votes`, `votes`)
            .leftJoinAndSelect(`votes.createdBy`, 'voteCreatedBy')
            .where('canvas.id = :canvasId', { canvasId });

        this.addQueryOptions(qb, queryOptions);

        return await qb.getManyAndCount();
    }

    protected async getSubmissionsByUser(canvasId: string, userId: string, queryOptions: IQueryOptions): Promise<[T[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect(`${this.entityName}.team`, 'team')
            .leftJoinAndSelect(`${this.entityName}.user`, 'user')
            .innerJoinAndSelect(`${this.entityName}.slot`, 'slot')
            .leftJoin('slot.canvas', 'canvas')
            .leftJoinAndSelect(`${this.entityName}.votes`, `votes`)
            .leftJoinAndSelect(`votes.createdBy`, 'voteCreatedBy')
            .leftJoin('team.members', 'teamMember')
            .where('canvas.id = :canvasId', { canvasId })
            .andWhere(
                new Brackets((qb) => {
                    qb.orWhere('user.id = :userId0', { userId0: userId });
                    qb.orWhere('teamMember.userId = :userId1', { userId1: userId });
                })
            );

        this.addQueryOptions(qb, queryOptions);
        return qb.getManyAndCount();
    }
}

@EntityRepository(TeamCanvasSubmission)
export class TeamCanvasSubmissionRepo extends CanvasSubmissionRepository<TeamCanvasSubmission> {
    protected readonly entityName = 'teamCanvasSubmission';
}

@EntityRepository(UserCanvasSubmission)
export class UserCanvasSubmissionRepo extends CanvasSubmissionRepository<UserCanvasSubmission> {
    protected readonly entityName = 'userCanvasSubmission';
}
