import { User } from '../../../src/app/core/models';
import { fakeUserCount, usingFaker } from '../config';
import { createFakeUsers } from './faker/fakeUsers';
import * as seedData from './seed/user.json';

let userData: User[] = [];

if (usingFaker) {
    userData = createFakeUsers(fakeUserCount);
} else {
    userData = seedData;
}

export function getUsers() {
    return userData;
}
