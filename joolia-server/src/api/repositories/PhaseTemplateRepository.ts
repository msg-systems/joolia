import { EntityRepository } from 'typeorm';
import { Library, PhaseTemplate, User } from '../models';
import { AbstractRepo, IQueryOptions } from './abstractRepo';

@EntityRepository(PhaseTemplate)
export class PhaseTemplateRepo extends AbstractRepo<PhaseTemplate> {
    protected readonly entityName = 'phaseTmpl';

    /**
     * Returns Only User's Phase Templates that DO NOT have a parent Format Template.
     */
    public async getEntities(opts: IQueryOptions, user: User, library?: Library): Promise<[PhaseTemplate[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'avatarFileEntry')
            .leftJoinAndSelect(`${this.entityName}.formatTemplate`, 'formatTmpl')
            .leftJoinAndSelect(`${this.entityName}.activityTemplates`, 'activityTmpl')
            .innerJoinAndSelect(`${this.entityName}.library`, 'library')
            .innerJoin('library.members', 'user')
            .where('user.id = :userId', { userId: user.id })
            .andWhere('formatTmpl.id is NULL');

        if (library) {
            qb.andWhere('library.id = :libraryId', { libraryId: library.id });
        }

        this.addQueryOptions(qb, opts);
        return qb.getManyAndCount();
    }

    public async getEntity(id: string): Promise<PhaseTemplate> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'avatarFileEntry')
            .leftJoinAndSelect(`${this.entityName}.formatTemplate`, 'formatTmpl')
            .leftJoinAndSelect(`${this.entityName}.activityTemplates`, 'activityTmpl')
            .innerJoinAndSelect(`${this.entityName}.library`, 'library')
            .innerJoinAndSelect('library.members', 'user')
            .where(`${this.entityName}.id = :id`, { id });

        return qb.getOne();
    }
}
