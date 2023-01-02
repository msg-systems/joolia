import { Brackets, EntityRepository } from 'typeorm';
import { Library } from '../models';
import { AbstractRepo, IQueryOptions } from './abstractRepo';

@EntityRepository(Library)
export class LibraryRepo extends AbstractRepo<Library> {
    protected readonly entityName = 'library';

    public async getEntities(userId: string, queryOptions?: IQueryOptions): Promise<[Library[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect('library.members', 'member')
            .leftJoinAndSelect('library.createdBy', 'createdBy')
            .where(
                new Brackets((qb) => {
                    qb.orWhere('createdBy.id = :createdById', { createdById: userId });
                    qb.orWhere('member.id = :userId', { userId });
                })
            );

        this.addQueryOptions(qb, queryOptions);
        return await qb.getManyAndCount();
    }

    public async getEntity(id: string): Promise<Library> {
        return await this.createQueryBuilder('library')
            .leftJoinAndSelect('library.members', 'member')
            .leftJoinAndSelect('library.createdBy', 'createdBy')
            .where('library.id = :libraryId', { libraryId: id })
            .getOne();
    }
}
