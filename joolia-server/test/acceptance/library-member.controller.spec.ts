import { expect, use } from 'chai';
import { describe } from 'mocha';
import * as request from 'supertest';
import * as chaiSorted from 'chai-sorted';
import { UserResponse } from '../../src/api/responses';
import { clearDatabases, getSignedIn, loadFixtures, seeds, sleep } from '../utils';
import { server } from './test.common.spec';

const userSeed = seeds.users;
const librarySeed = seeds.libraries;
use(chaiSorted);

describe('LibraryMemberController', async () => {
    let lukeToken = null;
    let leiaToken = null;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
        leiaToken = await getSignedIn(server, { email: 'princess@alliance.com', password: '12345678' });
    });

    after(async () => {
        await clearDatabases();
    });

    describe('/library/{id}/member', async () => {
        it('#GET Responds with the members of a library', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/member')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(2);
                    expect(res.body.entities).to.be.an('array');
                    expect(res.body.entities[0]).to.have.keys(UserResponse.attrs);
                    expect(res.body.entities).to.be.length(2);
                    // Library members should be order on name asc name by default
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });

        it('#GET Responds with the members of a library filtered by pending', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library2.id + '/member?filter[pending]=true')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(1);
                    expect(res.body.entities[0].name).equal(userSeed.PendingUser.name);
                    expect(res.body.entities[0].pending).equal(userSeed.PendingUser.pending);
                });
        });

        it('#GET Responds with the members of a library with a select on the name', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/member?select=name')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(2);
                    expect(res.body.entities).to.be.an('array');
                    expect(res.body.entities[0]).to.have.keys(['id', 'name']);
                    expect(res.body.entities).to.be.length(2);
                });
        });

        it('#GET Responds with the members of a library with a select on the avatar', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/member?select=avatar')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(2);
                    expect(res.body.entities).to.be.an('array');
                    expect(res.body.entities[0]).to.have.keys(['id', 'avatar']);
                    expect(res.body.entities).to.be.length(2);
                });
        });

        it('#GET Responds with the members of a library with a select on pending', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/member?select=pending')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(2);
                    expect(res.body.entities).to.be.an('array');
                    expect(res.body.entities[0]).to.have.keys(['id', 'pending']);
                    expect(res.body.entities).to.be.length(2);
                });
        });

        it('#PATCH Adds a new member to the library', async () => {
            await request(server.application)
                .patch('/library/' + librarySeed.library1.id + '/member')
                .set('Authorization', lukeToken)
                .set('Accept', 'application/json')
                .send({
                    emails: ['LUKE@alliance.com', 'vader@sith-lords.com']
                })
                .expect(204);

            // The Request returns immediately - before the invitations are fulfilled.
            // The other tests below depends on this test.
            await sleep(5000);
        });

        it('And the user should be returned when requested', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/member')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.entities.length).equals(3);
                    const emails = res.body.entities.map((m) => m.email);
                    expect(emails).to.have.members(['luke@alliance.com', 'vader@sith-lords.com', 'princess@alliance.com']);
                });
        });

        it('#DELETE Responds with a 204', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/member/_delete')
                .set('Authorization', lukeToken)
                .send({
                    emails: ['vader@SITH-lords.com']
                })
                .expect(204);
        });

        it('#DELETE Responds with a 400, cannot remove all members', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/member/_delete')
                .set('Authorization', lukeToken)
                .send({
                    emails: [userSeed.Anakin.email, userSeed.Luke.email, userSeed.Leia.email]
                })
                .expect(400);
        });

        it('And the user should not be returned anymore when requested', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/member')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.entities.length).equals(2);
                    const emails = res.body.entities.map((m) => m.email);
                    expect(emails).to.have.members(['luke@alliance.com', 'princess@alliance.com']);
                });
        });

        it('#PATCH Adds a new member to the library - A NON-existing user', async () => {
            let someone = null;

            // Luke invite someone
            await request(server.application)
                .patch('/library/' + librarySeed.library1.id + '/member')
                .set('Authorization', lukeToken)
                .send({
                    emails: ['someone@somewhere.net']
                })
                .expect(204);

            await sleep(5000); // Invitation is processed async and there are dependent tests belows

            // Luke check is pending
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/member?filter[pending]=true')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equals(1);
                    someone = res.body.entities[0];
                    expect(someone.pending).equals(true);
                    expect(someone.email).equals('someone@somewhere.net');
                });

            // Luke delete invited member
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/member/_delete')
                .set('Authorization', lukeToken)
                .send({
                    emails: ['someone@somewhere.net']
                })
                .expect(204);

            // Leia does not find the user anymore.
            await request(server.application)
                .get(`/user/${someone.id}`)
                .set('Authorization', leiaToken)
                .expect(404);
        });

        it('#GET should fail because user is not member of the library', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library3.id + '/member')
                .set('Authorization', lukeToken)
                .expect(403);
        });
    });
});
