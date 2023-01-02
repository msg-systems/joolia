import { Activity, Format, Submission, Team, TeamSubmission, User, UserSubmission } from '../models';
import { Brackets, EntityRepository } from 'typeorm';
import { AbstractRepo, IQueryOptions } from './abstractRepo';

@EntityRepository(Submission)
export class SubmissionRepo<T extends Submission> extends AbstractRepo<T> {
    protected entityName = 'submission';
    protected readonly fieldToFilterAndSortMap = {
        submittedBy: ['user.name', 'team.name'],
        activity: 'activity.name',
        method: 'activity.name',
        phase: 'phase.name',
        date: `${this.entityName}.createdAt`,
        commentCount: `${this.entityName}.commentCount`,
        averageRating: `${this.entityName}.averageRating`,
        fileCount: `${this.entityName}.fileCount`
    };

    public async getEntities(o: Activity | Format | Team, queryOptions: IQueryOptions, user?: User): Promise<[T[], number]> {
        if (o instanceof Format) {
            return this.getSubmissionsByFormat(o.id, queryOptions);
        }

        if (o instanceof Team) {
            return this.getSubmissionsByTeam(o.id, queryOptions);
        }

        if (o instanceof Activity) {
            if (user) {
                return this.getSubmissionsByUser(o.id, user.id, queryOptions);
            } else {
                return this.getSubmissionsByActivity(o.id, queryOptions);
            }
        }
    }

    public async getEntity(submissionId: string): Promise<T> {
        return this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'createdByAvatar')
            .leftJoinAndSelect(`${this.entityName}.team`, 'team')
            .leftJoinAndSelect(`${this.entityName}.user`, 'user')
            .innerJoinAndSelect(`${this.entityName}.activity`, 'activity')
            .where(`${this.entityName}.id = :sId`, { sId: submissionId })
            .getOne();
    }

    protected async getSubmissionsByActivity(activityId: string, queryOptions: IQueryOptions): Promise<[T[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'createdByAvatar')
            .leftJoinAndSelect(`${this.entityName}.team`, 'team')
            .leftJoinAndSelect('team.avatar', 'teamAvatar')
            .leftJoinAndSelect(`${this.entityName}.user`, 'user')
            .leftJoinAndSelect('user.avatar', 'userAvatar')
            .innerJoinAndSelect(`${this.entityName}.activity`, 'activity')
            .innerJoinAndSelect('activity.phase', 'phase')
            .innerJoinAndSelect('phase.format', 'format')
            .where('activity.id = :activityId', { activityId });

        this.addQueryOptions(qb, queryOptions);

        return await qb.getManyAndCount();
    }

    protected async getSubmissionsByFormat(formatId: string, queryOptions: IQueryOptions): Promise<[T[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'createdByAvatar')
            .leftJoinAndSelect(`${this.entityName}.team`, 'team')
            .leftJoinAndSelect('team.avatar', 'teamAvatar')
            .leftJoinAndSelect(`${this.entityName}.user`, 'user')
            .leftJoinAndSelect('user.avatar', 'userAvatar')
            .innerJoinAndSelect(`${this.entityName}.activity`, 'activity')
            .innerJoinAndSelect('activity.phase', 'phase')
            .innerJoin('phase.format', 'format')
            .where('format.id = :formatId', { formatId });

        this.addQueryOptions(qb, queryOptions);

        return await qb.getManyAndCount();
    }

    protected async getUsersWithSubmissions(formatId: string): Promise<T[]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoin(`${this.entityName}.user`, 'user')
            .select('user.name')
            .distinct(true)
            .innerJoin(`${this.entityName}.activity`, 'activity')
            .innerJoin('activity.phase', 'phase')
            .innerJoin('phase.format', 'format')
            .where('format.id = :formatId', { formatId })
            .andWhere(`${this.entityName}.ownerType = 'User'`);

        const userDataPacket = await qb.getRawMany();

        const userFilterValues = [];
        userDataPacket.forEach((element: { user_name: string }) => {
            userFilterValues.push(element.user_name);
        });

        return userFilterValues;
    }

    protected async getTeamsWithSubmissions(formatId: string): Promise<T[]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoin(`${this.entityName}.team`, 'team')
            .select('team.name')
            .distinct(true)
            .innerJoin(`${this.entityName}.activity`, 'activity')
            .innerJoin('activity.phase', 'phase')
            .innerJoin('phase.format', 'format')
            .where('format.id = :formatId', { formatId })
            .andWhere(`${this.entityName}.ownerType = 'Team'`);

        const teamDataPacket = await qb.getRawMany();

        const teamFilterValues = [];
        teamDataPacket.forEach((element: { team_name: string }) => {
            teamFilterValues.push(element.team_name);
        });

        return teamFilterValues;
    }

    protected async getPhasesWithSubmissions(formatId: string): Promise<T[]> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.activity`, 'activity')
            .innerJoin('activity.phase', 'phase')
            .select('phase.name')
            .distinct(true)
            .innerJoin('phase.format', 'format')
            .where('format.id = :formatId', { formatId });

        const phaseDataPacket = await qb.getRawMany();

        const phaseFilterValues = [];
        phaseDataPacket.forEach((element: { phase_name: string }) => {
            phaseFilterValues.push(element.phase_name);
        });

        return phaseFilterValues;
    }

    protected async getSubmissionsByUser(activityId: string, userId: string, queryOptions: IQueryOptions): Promise<[T[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'createdByAvatar')
            .leftJoinAndSelect(`${this.entityName}.team`, 'team')
            .leftJoinAndSelect('team.avatar', 'teamAvatar')
            .leftJoinAndSelect(`${this.entityName}.user`, 'user')
            .leftJoinAndSelect('user.avatar', 'userAvatar')
            .innerJoinAndSelect(`${this.entityName}.activity`, 'activity')
            .leftJoin('team.members', 'teamMember')
            .where('activity.id = :activityId', { activityId })
            .andWhere(
                new Brackets((qb) => {
                    qb.orWhere('user.id = :userId0', { userId0: userId });
                    qb.orWhere('teamMember.userId = :userId1', { userId1: userId });
                })
            );

        this.addQueryOptions(qb, queryOptions);
        return qb.getManyAndCount();
    }

    protected async getSubmissionsByTeam(teamId: string, queryOptions: IQueryOptions): Promise<[T[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'createdByAvatar')
            .leftJoinAndSelect(`${this.entityName}.team`, 'team')
            .leftJoinAndSelect('team.avatar', 'teamAvatar')
            .leftJoinAndSelect(`${this.entityName}.user`, 'user')
            .leftJoinAndSelect('user.avatar', 'userAvatar')
            .innerJoinAndSelect(`${this.entityName}.activity`, 'activity')
            .leftJoinAndSelect('activity.phase', 'phase')
            .where('team.id = :teamId', { teamId });

        this.addQueryOptions(qb, queryOptions);

        return qb.getManyAndCount();
    }
}

@EntityRepository(TeamSubmission)
export class TeamSubmissionRepo extends SubmissionRepo<TeamSubmission> {
    protected readonly entityName = 'teamSubmission';
}

@EntityRepository(UserSubmission)
export class UserSubmissionRepo extends SubmissionRepo<UserSubmission> {
    protected readonly entityName = 'userSubmission';
}
