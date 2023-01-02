import { Library, User } from '../models';
import { QueryRunner } from 'typeorm';
import { LibraryRepo } from '../repositories';

/**
 * TODO: Not a service. Move to custom repo instead.
 */
export class LibraryService {
    public static async createLibrary(runner: QueryRunner, libraryData: Partial<Library>, createdBy: User): Promise<Library> {
        // #TODO just created by special users
        const library = new Library(libraryData);

        // set creator as initial member
        library.members = [createdBy];
        library.createdBy = createdBy;

        return runner.manager.getCustomRepository(LibraryRepo).saveEntity(library);
    }
}
