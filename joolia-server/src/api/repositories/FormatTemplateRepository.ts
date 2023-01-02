import { EntityRepository } from 'typeorm';
import { FormatTemplate, Library, User } from '../models';
import { AbstractRepo, IQueryOptions } from './abstractRepo';

@EntityRepository(FormatTemplate)
export class FormatTemplateRepo extends AbstractRepo<FormatTemplate> {
    protected readonly entityName = 'formatTemplate';

    public async getEntities(opts: IQueryOptions, user: User, library?: Library): Promise<[FormatTemplate[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.phaseTemplates`, 'phaseTemplate')
            .leftJoinAndSelect('phaseTemplate.activityTemplates', 'activityTemplate')
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'avatarFileEntry')
            .leftJoinAndSelect(`${this.entityName}.files`, 'formatFileEntry')
            .leftJoinAndSelect(`${this.entityName}.keyVisual`, 'keyVisual')
            .leftJoinAndSelect('keyVisual.keyVisualFile', 'keyVisualFileEntry')
            .leftJoinAndSelect('keyVisualFileEntry.createdBy', 'kvFileEntryCreatedBy')
            .leftJoinAndSelect('keyVisual.keyVisualLink', 'keyVisualLinkEntry')
            .leftJoinAndSelect('keyVisualLinkEntry.createdBy', 'kvLinkCreatedBy')
            .innerJoinAndSelect(`${this.entityName}.library`, 'library')
            .innerJoin('library.members', 'user')
            .where('user.id = :userId', { userId: user.id });

        if (library) {
            qb.andWhere('library.id = :libraryId', { libraryId: library.id });
        }

        this.addQueryOptions(qb, opts);

        return qb.getManyAndCount();
    }

    public async getEntity(id: string): Promise<FormatTemplate> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.phaseTemplates`, 'phaseTemplate')
            .leftJoinAndSelect('phaseTemplate.activityTemplates', 'activityTemplate')
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'avatarFileEntry')
            .leftJoinAndSelect(`${this.entityName}.files`, 'formatFileEntry')
            .leftJoinAndSelect(`${this.entityName}.keyVisual`, 'keyVisual')
            .leftJoinAndSelect('keyVisual.keyVisualFile', 'keyVisualFileEntry')
            .leftJoinAndSelect('keyVisualFileEntry.createdBy', 'kvFileEntryCreatedBy')
            .leftJoinAndSelect('keyVisual.keyVisualLink', 'keyVisualLinkEntry')
            .leftJoinAndSelect('keyVisualLinkEntry.createdBy', 'kvLinkCreatedBy')
            .innerJoinAndSelect(`${this.entityName}.library`, 'library')
            .leftJoinAndSelect('library.members', 'user')
            .where(`${this.entityName}.id = :id`, { id });

        return qb.getOne();
    }
}
