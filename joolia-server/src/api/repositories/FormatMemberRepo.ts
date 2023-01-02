import { Brackets, EntityRepository } from 'typeorm';
import { Format, FormatMember, FormatMemberRoles, Team } from '../models';
import { AbstractRepo, IQueryOptions } from './abstractRepo';

@EntityRepository(FormatMember)
export class FormatMemberRepo extends AbstractRepo<FormatMember> {
    protected entityName = 'formatMember';
    protected readonly fieldToFilterAndSortMap = { name: 'user.name', pending: 'user.pending' };

    public async getEntities(queryOptions: IQueryOptions, format: Format): Promise<[FormatMember[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.format`, 'format')
            .innerJoinAndSelect(`${this.entityName}.user`, 'user')
            .leftJoinAndSelect(`${this.entityName}.teams`, 'team')
            .leftJoinAndSelect('user.avatar', 'userAvatar')
            .where('format.id = :formatId', { formatId: format.id })
            .andWhere(`${this.entityName}.role != 'technical'`);

        this.addQueryOptions(qb, queryOptions);
        return qb.getManyAndCount();
    }

    public async getAvailableTeamMembers(queryOptions: IQueryOptions, format: Format, team: Team): Promise<[FormatMember[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoin(`${this.entityName}.teams`, 'team')
            .innerJoinAndSelect(`${this.entityName}.user`, 'user')
            .where(`${this.entityName}.formatId = :formatId`, { formatId: format.id })
            .andWhere(
                new Brackets((qb) => {
                    qb.where('team.id != :teamId', { teamId: team.id }).orWhere('team.id IS NULL');
                })
            )
            .andWhere((qb) => {
                const subQ = qb
                    .subQuery()
                    .from(FormatMember, 'formatMember')
                    .leftJoin('formatMember.teams', 'team')
                    .where('formatMember.formatId = :formatId', { formatId: format.id })
                    .andWhere('team.id = :teamId', { teamId: team.id })
                    .select('formatMember.id')
                    .getQuery();

                return 'formatMember.id NOT IN ' + subQ;
            })
            .andWhere(`formatMember.role != 'technical'`);

        this.addQueryOptions(qb, queryOptions);
        return qb.getManyAndCount();
    }

    public async getEntity(format: Format, userId: string): Promise<FormatMember> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.user`, 'user')
            .innerJoinAndSelect(`${this.entityName}.format`, 'format')
            .where('user.id = :userId', { userId })
            .andWhere('format.id = :formatId', { formatId: format.id });

        return qb.getOne();
    }

    public async getMemberDetails(format: Format, userId: string): Promise<FormatMember> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.format`, 'format')
            .innerJoinAndSelect(`${this.entityName}.user`, 'user')
            .leftJoinAndSelect(`${this.entityName}.teams`, 'team')
            .leftJoinAndSelect(`team.avatar`, 'teamAvatar')
            .leftJoinAndSelect('user.avatar', 'userAvatar')
            .leftJoinAndSelect('user.skills', 'userSkill')
            .leftJoinAndSelect('userSkill.skill', 'skill')
            .leftJoinAndSelect('team.members', 'member')
            .leftJoinAndSelect('member.user', 'memberUser')
            .where('format.id = :formatId', { formatId: format.id })
            .andWhere('user.id = :userId', { userId });

        return qb.getOne();
    }

    public async isOrganizer(format: Format, userId: string): Promise<boolean> {
        const member = await this.getEntity(format, userId);
        return member && member.role === FormatMemberRoles.ORGANIZER;
    }

    public async getRole(format: Format, userId: string): Promise<FormatMemberRoles> {
        const member = await this.getEntity(format, userId);
        return member ? member.role : null;
    }

    public async isMember(format: Format, userId: string): Promise<boolean> {
        const member = await this.getEntity(format, userId);
        return member !== undefined;
    }

    public async getMembersByMail(format: Format, memberMails: string[]): Promise<FormatMember[]> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.user`, 'user')
            .innerJoinAndSelect(`${this.entityName}.format`, 'format')
            .where('format.id = :formatId', { formatId: format.id })
            .andWhere('user.email IN (:emails)', { emails: memberMails });

        return qb.getMany();
    }

    public async getMembersById(format: Format, userIds: string[]): Promise<FormatMember[]> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.user`, 'user')
            .innerJoinAndSelect(`${this.entityName}.format`, 'format')
            .where('format.id = :formatId', { formatId: format.id })
            .andWhere('user.id IN (:userIds)', { userIds });

        return qb.getMany();
    }

    public async getAllMembers(format: Format): Promise<FormatMember[]> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.user`, 'user')
            .innerJoinAndSelect(`${this.entityName}.format`, 'format')
            .where('format.id = :formatId', { formatId: format.id });

        return qb.getMany();
    }

    public async countMembersByRole(format: Format, role: FormatMemberRoles): Promise<number> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.user`, 'user')
            .innerJoinAndSelect(`${this.entityName}.format`, 'format')
            .where('format.id = :formatId', { formatId: format.id })
            .andWhere(`${this.entityName}.role = :role`, { role: role });

        return qb.getCount();
    }

    public async countMembers(format: Format): Promise<number> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.user`, 'user')
            .innerJoin(`${this.entityName}.format`, 'format')
            .where('format.id = :formatId', { formatId: format.id });

        return qb.getCount();
    }

    public async countMembersByMail(format: Format, memberMails: string[]): Promise<number> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.user`, 'user')
            .innerJoin(`${this.entityName}.format`, 'format')
            .where('format.id = :formatId', { formatId: format.id })
            .andWhere('user.email IN (:emails)', { emails: memberMails });

        return qb.getCount();
    }
}
