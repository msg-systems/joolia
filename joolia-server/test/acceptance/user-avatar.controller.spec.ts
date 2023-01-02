import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import * as request from 'supertest';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import { UserAvatarResponse } from '../../src/api/responses';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const shaak = seeds.users.Shaak;
const luke = seeds.users.Luke;

let token;

describe('User Avatar', async () => {
    before(async () => {
        await loadFixtures();
        token = await getSignedIn(server, luke);
    });

    after(async () => {
        await clearDatabases();
    });

    it('User does not have avatar', async () => {
        await request(server.application)
            .get(`/user/${shaak.id}/profile/avatar`)
            .set('Authorization', token)
            .expect(404);
    });

    it('User has avatar', async () => {
        await request(server.application)
            .get(`/user/${luke.id}/profile/avatar`)
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(UserAvatarResponse.attrs);
            });
    });

    it('Changes user avatar', async () => {
        await request(server.application)
            .put(`/user/${luke.id}/profile/avatar`)
            .set('Authorization', token)
            .send({ name: 'report.pdf' })
            .expect(201)
            .then((res) => {
                expect(res.body).to.have.keys(UserAvatarResponse.attrs);
            });
    });

    it('Retrieves the newly created avatar', async () => {
        await request(server.application)
            .get(`/user/${luke.id}/profile/avatar`)
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(UserAvatarResponse.attrs);
            });
    });

    it('Cannot change another user avatar', async () => {
        await request(server.application)
            .put(`/user/${shaak.id}/profile/avatar`)
            .set('Authorization', token)
            .send({ name: 'report.pdf' })
            .expect(403);
    });
});
