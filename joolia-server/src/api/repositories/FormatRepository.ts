import { EntityRepository } from 'typeorm';
import { Format } from '../models';
import { AbstractRepo } from './abstractRepo';

@EntityRepository(Format)
export class FormatRepo extends AbstractRepo<Format> {
    protected readonly entityName = 'format';

    public async getEntity(id: string): Promise<Format> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.keyVisual`, 'keyVisual')
            .leftJoinAndSelect('keyVisual.keyVisualFile', 'keyVisualFile')
            .leftJoinAndSelect('keyVisual.keyVisualLink', 'keyVisualLink')
            .where(`${this.entityName}.id = :id`, { id });

        return qb.getOne();
    }

    public async getFormatWithMembers(id: string): Promise<Format> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoinAndSelect(`${this.entityName}.members`, 'formatMember')
            .innerJoinAndSelect('formatMember.user', 'formatMemberUser')
            .where(`${this.entityName}.id = :id`, { id });

        return qb.getOne();
    }

    public async getFormatWithMeetingLink(id: string): Promise<Format> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.meetingLink`, 'meetingLink')
            .where(`${this.entityName}.id = :id`, { id });

        return qb.getOne();
    }
}
