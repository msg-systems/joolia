import { expect } from 'chai';
import { describe } from 'mocha';
import * as request from 'supertest';
import { clearDatabases, getSignedIn, getSignedInAsAdmin, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import { UserResponse } from '../../src/api/responses';

const userSeed = seeds.users;

describe('UserController', async () => {
    let token = null;

    before(async () => {
        await loadFixtures();
        token = await getSignedIn(server);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('User is admin', async () => {
        let adminToken;

        before(async () => {
            adminToken = await getSignedInAsAdmin(server);
        });

        it('#GET Responds with a specific user information, existing id', async () => {
            const response = await request(server.application)
                .get('/user/' + userSeed.Luke.id)
                .set('Authorization', adminToken);
            expect(response.statusCode).equal(200);
            expect(response.body.id).to.equal(userSeed.Luke.id);
            expect(response.body).to.not.have.keys(['password']);
        });

        it('#GET Responds 404 for a not existing id', async () => {
            await request(server.application)
                .get('/user/' + 'notAnExistingId')
                .set('Authorization', adminToken)
                .expect(404);
        });
    });

    describe('/user/{id}', async () => {
        it('#GET Responds 403 luke is not an administrator', async () => {
            await request(server.application)
                .get('/user/' + userSeed.Luke.id)
                .set('Authorization', token)
                .expect(403);
        });

        it('#DELETE Responds 403 luke is not an administrator', async () => {
            const response = await request(server.application)
                .delete('/user/' + userSeed.Mickey.id)
                .set('Authorization', token);
            expect(response.statusCode).equal(403);
        });
    });

    describe('/user/:id/profile', async () => {
        it('#GET user profile of logged in user', async () => {
            await request(server.application)
                .get('/user/' + userSeed.Luke.id + '/profile')
                .set('Authorization', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(UserResponse.attrs);
                });
        });

        it('#GET user profile select avatar', async () => {
            await request(server.application)
                .get('/user/' + userSeed.Luke.id + '/profile?select=avatar')
                .set('Authorization', token)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'avatar']);
                })
                .expect(200);
        });

        it('#GET user profile', async () => {
            await request(server.application)
                .get('/user/' + userSeed.Leia.id + '/profile')
                .set('Authorization', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(UserResponse.attrs);
                });
        });

        it('#PATCH user profile of logged in user', async () => {
            await request(server.application)
                .patch('/user/' + userSeed.Luke.id + '/profile')
                .set('Authorization', token)
                .send({
                    name: 'Lucky Luke',
                    company: 'Daltons Gold Mine Ltd.'
                })
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'name', 'company']);
                    expect(res.body.name).equal('Lucky Luke');
                    expect(res.body.company).equal('Daltons Gold Mine Ltd.');
                })
                .expect(200);
        });

        it('#PATCH user profile of other user fails', async () => {
            await request(server.application)
                .patch('/user/' + userSeed.Leia.id + '/profile')
                .set('Authorization', token)
                .send({
                    name: 'Lucky Luke',
                    company: 'Daltons Gold Mine Ltd.'
                })
                .expect(403);
        });

        it('#PATCH user profile of logged in user, should fail because email field is not allowed', async () => {
            await request(server.application)
                .patch('/user/' + userSeed.Luke.id + '/profile')
                .set('Authorization', token)
                .send({
                    name: 'Lucky Luke',
                    company: 'Daltons Gold Mine Ltd.',
                    email: 'luke@luckystrike.com'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });
    });

    describe('/user/checkemail', async () => {
        it('#GET Responds with email not available for Luke', async () => {
            await request(server.application)
                .get('/user/checkemail?email[]=' + userSeed.Luke.email)
                .expect(200)
                .expect((res) => {
                    expect(res.body.emailAvailable).equal(false);
                });
        });

        it('#GET Responds with email available for PendingUser', async () => {
            await request(server.application)
                .get('/user/checkemail?email[]=' + userSeed.PendingUser.email)
                .expect(200)
                .expect((res) => {
                    expect(res.body.emailAvailable).equal(true);
                });
        });
    });
});
