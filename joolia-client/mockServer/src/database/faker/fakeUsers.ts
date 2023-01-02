import * as faker from 'faker';
import { times } from 'lodash';
import { User } from '../../../../src/app/core/models';

export function createFakeUser() {
    return {
        company: faker.company.companyName(),
        email: faker.internet.email(),
        id: faker.random.uuid(),
        name: faker.name.findName(),
        password: faker.internet.password(),
    };
}

export function createFakeUsers(count: number): User[] {
    return times(count, createFakeUser);
}
