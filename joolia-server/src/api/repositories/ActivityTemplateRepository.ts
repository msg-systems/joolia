import { EntityRepository } from 'typeorm';
import { ActivityTemplate, Library, User } from '../models';
import { AbstractRepo, IQueryOptions } from './abstractRepo';

@EntityRepository(ActivityTemplate)
export class ActivityTemplateRepo extends AbstractRepo<ActivityTemplate> {
    protected readonly entityName = 'activityTmpl';

    /**
     * Returns Only User's Activity Templates that DO NOT have a parent Phase Template.
     */
    public async getEntities(opts: IQueryOptions, user: User): Promise<[ActivityTemplate[], number]>;
    public async getEntities(opts: IQueryOptions, library: Library): Promise<[ActivityTemplate[], number]>;
    public async getEntities(opts: IQueryOptions, userOrLib: User | Library): Promise<[ActivityTemplate[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'avatarFileEntry')
            .leftJoinAndSelect(`${this.entityName}.phaseTemplate`, 'phaseTmpl')
            .leftJoinAndSelect(`${this.entityName}.stepTemplates`, 'stepTmpl')
            .leftJoinAndSelect(`${this.entityName}.configuration`, 'config')
            .leftJoinAndSelect(`${this.entityName}.keyVisual`, 'keyVisual')
            .leftJoinAndSelect('keyVisual.keyVisualLink', 'keyVisualLink')
            .leftJoinAndSelect('keyVisualLink.createdBy', 'kvLinkCreatedBy')
            .leftJoinAndSelect('keyVisual.keyVisualFile', 'keyVisualFile')
            .leftJoinAndSelect('keyVisualFile.createdBy', 'kvFileCreatedBy')
            .leftJoinAndSelect(`${this.entityName}.canvases`, 'canvases')
            .leftJoinAndSelect('canvases.slots', 'slots')
            .innerJoinAndSelect(`${this.entityName}.library`, 'library')
            .innerJoin('library.members', 'user')
            .where('phaseTmpl.id is NULL');

        if (userOrLib instanceof Library) {
            qb.andWhere('library.id = :libraryId', { libraryId: userOrLib.id });
        } else {
            qb.andWhere('user.id = :userId', { userId: userOrLib.id });
        }

        this.addQueryOptions(qb, opts);
        return qb.getManyAndCount();
    }

    public async getEntity(id: string, library: Library): Promise<ActivityTemplate> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.createdBy`, 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'avatarFileEntry')
            .leftJoinAndSelect(`${this.entityName}.phaseTemplate`, 'phaseTmpl')
            .leftJoinAndSelect(`${this.entityName}.stepTemplates`, 'stepTmpl')
            .leftJoinAndSelect(`${this.entityName}.configuration`, 'config')
            .leftJoinAndSelect(`${this.entityName}.keyVisual`, 'keyVisual')
            .leftJoinAndSelect('keyVisual.keyVisualLink', 'keyVisualLink')
            .leftJoinAndSelect('keyVisualLink.createdBy', 'kvLinkCreatedBy')
            .leftJoinAndSelect('keyVisual.keyVisualFile', 'keyVisualFile')
            .leftJoinAndSelect('keyVisualFile.createdBy', 'kvFileCreatedBy')
            .leftJoinAndSelect(`${this.entityName}.canvases`, 'canvases')
            .leftJoinAndSelect('canvases.slots', 'slots')
            .innerJoinAndSelect(`${this.entityName}.library`, 'library')
            .where(`${this.entityName}.id = :id`, { id })
            .andWhere('library.id = :libraryId', { libraryId: library.id })
            .addOrderBy('stepTmpl.position', 'ASC');

        return qb.getOne();
    }
}
