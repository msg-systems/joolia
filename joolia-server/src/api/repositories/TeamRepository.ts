import { Brackets, EntityRepository } from 'typeorm';
import { Format, FormatMember, Team, User } from '../models';
import { AbstractRepo, IQueryOptions } from './abstractRepo';

@EntityRepository(Team)
export class TeamRepository extends AbstractRepo<Team> {
    protected entityName = 'team';

    public async getAvailableTeams(
        queryOptions: IQueryOptions,
        format: Format,
        formatMember: FormatMember,
        user?: User
    ): Promise<[Team[], number]> {
        if (user) {
            return this.getAvailableTeamsByUser(format, formatMember, user, queryOptions);
        } else {
            return this.getAvailableTeamsByFormat(format, formatMember, queryOptions);
        }
    }

    public async getEntities(format: Format, queryOptions: IQueryOptions, user?: User): Promise<[Team[], number]> {
        if (user) {
            return this.getTeamsByUser(format, user, queryOptions);
        } else {
            return this.getTeamsByFormat(format, queryOptions);
        }
    }

    public async getTeamsByFormat(format: Format, queryOptions: IQueryOptions): Promise<[Team[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.format`, 'format')
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect(`${this.entityName}.avatar`, 'avatar')
            .leftJoinAndSelect(`${this.entityName}.members`, 'members')
            .leftJoinAndSelect('members.user', 'user')
            .where('format.id = :formatId', { formatId: format.id });

        this.addQueryOptions(qb, queryOptions);
        return qb.getManyAndCount();
    }

    public async getTeamsByUser(format: Format, user: User, queryOptions: IQueryOptions): Promise<[Team[], number]> {
        const subQb = this.createQueryBuilder(this.entityName)
            .select(`${this.entityName}.id`, 'id')
            .innerJoin(`${this.entityName}.format`, 'format')
            .leftJoin(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoin(`${this.entityName}.members`, 'members')
            .leftJoin('members.user', 'user')
            .where('format.id = :formatId', { formatId: format.id })
            .andWhere(
                new Brackets((qb) => {
                    qb.orWhere('createdBy.id = :createdById', { createdById: user.id });
                    qb.orWhere('user.id = :userId', { userId: user.id });
                })
            );

        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.format`, 'format')
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect(`${this.entityName}.avatar`, 'avatar')
            .leftJoinAndSelect(`${this.entityName}.members`, 'members')
            .leftJoinAndSelect('members.user', 'user')
            .where(`${this.entityName}.id IN ( ${subQb.getQuery()} )`)
            .setParameters(subQb.getParameters());

        this.addQueryOptions(qb, queryOptions);
        return qb.getManyAndCount();
    }

    public async getEntity(teamId: string): Promise<Team> {
        return this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect(`${this.entityName}.avatar`, 'avatar')
            .leftJoinAndSelect(`${this.entityName}.members`, 'formatMember')
            .leftJoinAndSelect(`${this.entityName}.format`, 'format')
            .leftJoinAndSelect('formatMember.user', 'user')
            .leftJoinAndSelect('user.avatar', 'userAvatar')
            .leftJoinAndSelect('formatMember.teams', 'teams')
            .where(`${this.entityName}.id = :teamId`, { teamId })
            .getOne();
    }

    public async getTeamWithMeetingLink(teamId: string): Promise<Team> {
        return this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.meetingLink`, 'meetingLink')
            .where(`${this.entityName}.id = :teamId`, { teamId })
            .getOne();
    }

    protected async getAvailableTeamsByFormat(
        format: Format,
        formatMember: FormatMember,
        queryOptions: IQueryOptions
    ): Promise<[Team[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.format`, 'format')
            .leftJoinAndSelect(`${this.entityName}.members`, 'members')
            .leftJoinAndSelect('members.user', 'user')
            .where(`${this.entityName}.formatId = :formatId`, { formatId: format.id })
            .andWhere((qb) => {
                const subQ = qb
                    .subQuery()
                    .from(Team, 'team')
                    .leftJoin('team.members', 'member')
                    .where('team.formatId = :formatId', { formatId: format.id })
                    .andWhere('member.id = :formatMemberId', { formatMemberId: formatMember.id })
                    .select('team.id')
                    .getQuery();

                return `${this.entityName}.id NOT IN` + subQ;
            });

        this.addQueryOptions(qb, queryOptions);
        return qb.getManyAndCount();
    }

    protected async getAvailableTeamsByUser(
        format: Format,
        formatMember: FormatMember,
        user: User,
        queryOptions: IQueryOptions
    ): Promise<[Team[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.format`, 'format')
            .leftJoinAndSelect(`${this.entityName}.members`, 'members')
            .leftJoinAndSelect('members.user', 'user')
            .where(`${this.entityName}.formatId = :formatId`, { formatId: format.id })
            .andWhere(`user.id = :userId`, { userId: user.id })
            .andWhere((qb) => {
                const subQ = qb
                    .subQuery()
                    .from(Team, 'team')
                    .leftJoin('team.members', 'member')
                    .where('team.formatId = :formatId', { formatId: format.id })
                    .andWhere('member.id = :formatMemberId', { formatMemberId: formatMember.id })
                    .select('team.id')
                    .getQuery();

                return `${this.entityName}.id NOT IN` + subQ;
            });

        this.addQueryOptions(qb, queryOptions);
        return qb.getManyAndCount();
    }
}
