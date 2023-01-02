import { describe } from 'mocha';
import * as request from 'supertest';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import { expect } from 'chai';
import { ProfileResponse } from '../../src/api/responses';
import { UserAvatarResponse } from '../../src/api/responses/avatar.response';

const userSeed = seeds.users;

describe('ProfileController', async () => {
    let lukeToken = null;
    let leiaToken = null;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server, userSeed.Luke);
        leiaToken = await getSignedIn(server, userSeed.Leia);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('Fetch user data of logged user', async () => {
        it('GET user profile', async () => {
            await request(server.application)
                .get('/profile')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => expect(res.body).to.have.keys(ProfileResponse.attrs));
        });

        it('GET user avatar', async () => {
            await request(server.application)
                .get('/profile/avatar')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => expect(res.body).to.have.keys(UserAvatarResponse.attrs));
        });

        it('GET user avatar (avatar does not exist)', async () => {
            await request(server.application)
                .get('/profile/avatar')
                .set('Authorization', leiaToken)
                .expect(204);
        });
    });
});
