import { DeepPartial, EntityRepository } from 'typeorm';
import { Library, User } from '../models';
import { AbstractRepo, IQueryOptions } from './abstractRepo';
import * as moment from 'moment';

/**
 * TODO: Move to configuration.
 */
const FAILED_LOGIN_THRESHOLD = 5;
const FAILED_LOGIN_TIMEOUT = 5; // Minutes

@EntityRepository(User)
export class UserRepo extends AbstractRepo<User> {
    protected readonly entityName = 'user';

    public async getEntities(opts: IQueryOptions, o: DeepPartial<Library>): Promise<[User[], number]> {
        return this.getUsersInLibrary(opts, o);
    }

    public async getEntity(id: string): Promise<User> {
        const query = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.avatar`, 'avatar')
            .where(`${this.entityName}.id = :id`, { id });
        return query.getOne();
    }

    public async updateFailedLoginInfo(user: DeepPartial<User>): Promise<void> {
        let failedLoginTimeout = user.failedLoginTimeout;
        const failedLoginAttempts = user.failedLoginAttempts + 1;

        if (failedLoginAttempts % FAILED_LOGIN_THRESHOLD === 0) {
            failedLoginTimeout = moment()
                .add(FAILED_LOGIN_TIMEOUT, 'minutes')
                .toDate();
        }

        const updatedLoginInfo = {
            failedLoginAttempts,
            failedLoginTimeout
        };

        await this.update({ id: user.id }, updatedLoginInfo);
    }

    public async resetFailedLoginInfo(user: DeepPartial<User>): Promise<void> {
        await this.update({ email: user.email }, { failedLoginAttempts: 0, failedLoginTimeout: null, lastLogin: moment.utc().toDate() });
    }

    public async getUserWithCredentials(credentials: { email: string; password: string }): Promise<User> {
        const qb = this.createQueryBuilder(this.entityName)
            .select(this.entityName)
            .addSelect(`${this.entityName}.password`)
            .addSelect(`${this.entityName}.admin`)
            .addSelect(`${this.entityName}.failedLoginAttempts`)
            .addSelect(`${this.entityName}.failedLoginTimeout`)
            .where({ email: credentials.email });

        return await qb.getOne();
    }

    public async getUserById(id: string): Promise<User> {
        const qb = this.createQueryBuilder(this.entityName)
            .select(this.entityName)
            .addSelect(`${this.entityName}.admin`)
            .addSelect(`${this.entityName}.failedLoginAttempts`)
            .addSelect(`${this.entityName}.failedLoginTimeout`)
            .where({ id });

        return await qb.getOne();
    }

    public async getUserByEmail(email: string): Promise<User> {
        const qb = this.createQueryBuilder(this.entityName)
            .select(this.entityName)
            .addSelect(`${this.entityName}.admin`)
            .addSelect(`${this.entityName}.failedLoginAttempts`)
            .addSelect(`${this.entityName}.failedLoginTimeout`)
            .where({ email });

        return await qb.getOne();
    }

    public async countUsers(emails: string[], library: DeepPartial<Library>): Promise<number> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.libraries`, 'library')
            .where('library.id = :libraryId', { libraryId: library.id })
            .andWhere(`${this.entityName}.email IN (:emails)`, { emails });

        return qb.getCount();
    }

    public async getUsersByEmail(emails: string[], library?: DeepPartial<Library>): Promise<User[]> {
        const qb = this.createQueryBuilder(this.entityName)
            .leftJoinAndSelect(`${this.entityName}.avatar`, 'avatar')
            .where(`${this.entityName}.email IN (:emails)`, { emails });

        if (library) {
            qb.innerJoin(`${this.entityName}.libraries`, 'library');
            qb.andWhere('library.id = :libraryId', { libraryId: library.id });
        }

        return qb.getMany();
    }

    public async userExists(email: string): Promise<boolean> {
        return (
            (await this.count({
                where: {
                    email: email,
                    pending: false
                }
            })) > 0
        );
    }

    private async getUsersInLibrary(queryOpts: IQueryOptions, library: DeepPartial<Library>): Promise<[User[], number]> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.libraries`, 'library')
            .leftJoinAndSelect(`${this.entityName}.avatar`, 'avatar')
            .where('library.id = :libraryId', { libraryId: library.id });

        this.addQueryOptions(qb, queryOpts);

        return qb.getManyAndCount();
    }
}
