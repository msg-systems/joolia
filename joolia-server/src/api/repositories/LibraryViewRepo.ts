import { EntityRepository } from 'typeorm';
import { LibraryView } from '../models/views';
import { AbstractRepo, IQueryOptions } from './abstractRepo';
import { LibraryRepo } from './LibraryRepo';

@EntityRepository(LibraryView)
export class LibraryViewRepo extends AbstractRepo<LibraryView> {
    protected readonly entityName = 'library_view';

    public async getEntities(userId: string, queryOptions?: IQueryOptions): Promise<[LibraryView[], number]> {
        /**
         * This extra query can be removed when views can handle relations properly (i.e, createdBy & members relations).
         * https://github.com/typeorm/typeorm/issues/4668
         *
         */
        const libRepo = this.manager.getCustomRepository(LibraryRepo);
        const [libraries, count] = await libRepo.getEntities(userId, queryOptions);

        const viewPromises: Array<Promise<LibraryView>> = [];
        for (const library of libraries) {
            viewPromises.push(this.findOne(library.id));
        }

        const libraryViews = await Promise.all(viewPromises);
        return [libraryViews, count];
    }

    public async getEntity(id: string): Promise<LibraryView> {
        return this.findOne(id);
    }
}
