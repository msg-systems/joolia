import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { describe } from 'mocha';
import * as request from 'supertest';
import { FormatMemberResponse } from '../../src/api/responses';
import { FormatMemberRoles } from '../../src/api/models';
import { clearDatabases, getSignedIn, loadFixtures, seeds, sleep } from '../utils';
import { server } from './test.common.spec';
import { constants } from 'http2';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const users = seeds.users;
const formats = seeds.formats;

describe('FormatMemberController', async () => {
    let lukeToken;
    let leiaToken;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
        leiaToken = await getSignedIn(server, { email: 'princess@alliance.com', password: '12345678' });
    });

    after(async () => {
        await clearDatabases();
    });

    describe('/format/:formatId/member', async () => {
        it('Get the format members', async () => {
            await request(server.application)
                .get('/format/' + formats.FormatOne.id + '/member')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.count).equals(3);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(FormatMemberResponse.attrs);
                        expect(entity.id).to.be.oneOf([users.Luke.id, users.Mickey.id, users.ObiWan.id]);
                    });
                });
        });

        it('Get the format members with name selected', async () => {
            await request(server.application)
                .get('/format/' + formats.FormatOne.id + '/member?select[]=name&select[]=role')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities[0]).to.have.keys(['id', 'name', 'role']);
                });
        });

        it('Get the format members ordered by name of the member', async () => {
            await request(server.application)
                .get('/format/' + formats.FormatTwo.id + '/member?order[name]=asc')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });

        it('Get the format members filtered pending of the member', async () => {
            await request(server.application)
                .get('/format/' + formats.FormatTwo.id + '/member?filter[pending]=true')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    // @ts-ignore
                    expect(res.body.entities).to.have.length(1);
                    expect(res.body.entities[0].name).to.eq(users.PendingUser.name);
                    expect(res.body.entities[0].pending).to.eq(users.PendingUser.pending);
                });
        });

        it('Get the format members and check that pending ones are at the end', async () => {
            // invite some people
            await request(server.application)
                .patch(`/format/${formats.FormatOne.id}/member`)
                .set('Authorization', lukeToken)
                .send({
                    role: 'participant',
                    emails: ['test1@somewhere.net', 'test2@somewhere.net', 'test3@somewhere.net'],
                    message: 'Do not be shy and join the army'
                })
                .expect(204);

            await sleep(5000); // Invitation is processed async and there are dependent tests belows

            await request(server.application)
                .get('/format/' + formats.FormatOne.id + '/member?select[]=name&select[]=role&order[name]=ASC')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities).to.have.length(6);
                    for (let i = 0; i < 3; i++) {
                        expect(res.body.entities[i].name).to.not.eq(null);
                    }
                    for (let i = 3; i < 6; i++) {
                        expect(res.body.entities[i].name).to.eq(null);
                    }
                });
        });

        it('#PATCH add members to the format', async () => {
            await request(server.application)
                .patch(`/format/${formats.FormatOne.id}/member`)
                .set('Authorization', lukeToken)
                .send({
                    role: 'participant',
                    emails: ['SHAAK.ti@jedi-order.com', 'TESTOR@joolia.net'],
                    message: 'Do not be shy and join the army'
                })
                .expect(204);

            await sleep(2500); // Invitation runs async, hard to test :/
        });

        it('#PATCH add a member to the format - A NON-existing user', async () => {
            let someone = null;

            // Luke invite someone
            await request(server.application)
                .patch(`/format/${formats.FormatOne.id}/member`)
                .set('Authorization', lukeToken)
                .send({
                    role: 'participant',
                    emails: ['someone@somewhere.net'],
                    message: 'Do not be shy and join the army'
                })
                .expect(204);

            await sleep(5000); // Invitation is processed async and there are dependent tests belows

            // Luke check is pending
            await request(server.application)
                .get('/format/' + formats.FormatOne.id + '/member?filter[pending]=true')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    someone = res.body.entities.find((u) => u.email === 'someone@somewhere.net');
                    expect(!!someone).equals(true);
                    expect(someone.pending).equals(true);
                });

            // Luke delete invited member
            await request(server.application)
                .post(`/format/${formats.FormatOne.id}/member/_delete`)
                .set('Authorization', lukeToken)
                .send({
                    emails: [someone.email]
                })
                .expect(204);

            // Leia does not find the user anymore.
            await request(server.application)
                .get(`/user/${someone.id}`)
                .set('Authorization', leiaToken)
                .expect(404);
        });

        it('#POST SignUp of invited user', async () => {
            await request(server.application)
                .post('/signup')
                .set('Accept', 'application/json')
                .send({
                    name: 'Testor M',
                    email: 'testor@joolia.net',
                    password: 'test1234'
                })
                .expect((res) => {
                    expect(res.body.user).be.an('object');
                    expect(res.body.user.name).equal('Testor M');
                    expect(res.body.user.email).equal('testor@joolia.net');
                })
                .expect(201);
        });

        it('#PATCH add members to the format fail because role not included', async () => {
            await request(server.application)
                .patch('/format/' + formats.FormatOne.id + '/member')
                .set('Authorization', lukeToken)
                .send({
                    emails: ['mickey@disney.com', 'thebossman@lucasfilm.com']
                })
                .expect(422);
        });

        it('#PATCH add member fails because user is no organizer', async () => {
            await request(server.application)
                .patch('/format/' + formats.FormatThree.id + '/member')
                .set('Authorization', lukeToken)
                .send({
                    role: FormatMemberRoles.ORGANIZER,
                    emails: ['luke@alliance.com']
                })
                .expect(403);
        });

        it('#PATCH/DELETE: add/remove technical user', async () => {
            await request(server.application)
                .patch('/format/' + formats.FormatOne.id + '/member')
                .set('Authorization', lukeToken)
                .send({
                    role: FormatMemberRoles.TECHNICAL,
                    emails: []
                })
                .expect(204);

            await request(server.application)
                .get('/format/' + formats.FormatOne.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.containsTechnicalUser).equals(true);
                });

            await request(server.application)
                .post('/format/' + formats.FormatOne.id + '/member/_delete')
                .set('Authorization', lukeToken)
                .send({
                    role: FormatMemberRoles.TECHNICAL,
                    emails: []
                })
                .expect(204);

            await request(server.application)
                .get('/format/' + formats.FormatOne.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.containsTechnicalUser).equals(false);
                });
        });

        it('#PATCH update member role fails because member not found', async () => {
            await request(server.application)
                .patch(`/format/${formats.FormatOne.id}/member/NotExistingMember`)
                .set('Authorization', lukeToken)
                .send({
                    role: 'participant'
                })
                .expect(404);
        });

        it('#DELETE members from format that has teams should succeed too', async () => {
            await request(server.application)
                .post(`/format/${formats.FormatOne.id}/member/_delete`)
                .set('Authorization', lukeToken)
                .send({
                    emails: ['MIckey@disney.com']
                })
                .expect(204);
        });

        it('#DELETE members from format without any team should succeed', async () => {
            await request(server.application)
                .post(`/format/${formats.FormatFive.id}/member/_delete`)
                .set('Authorization', lukeToken)
                .send({
                    emails: ['MIckey@disney.com']
                })
                .expect(204);
        });

        it('#DELETE members from format should fail because last user can not be removed', async () => {
            await request(server.application)
                .post(`/format/${formats.FormatTwo.id}/member/_delete`)
                .set('Authorization', lukeToken)
                .send({
                    emails: ['princess@alliance.com', 'luke@alliance.com', 'pendinguser@example.com']
                })
                .expect(400);
        });

        it('#PATCH update fails because user is the last organizer of format', async () => {
            await request(server.application)
                .patch(`/format/${formats.FormatOne.id}/member/${users.Luke.id}`)
                .set('Authorization', lukeToken)
                .send({
                    role: 'participant'
                })
                .expect(400);
        });

        it('#PATCH update a specific user', async () => {
            await request(server.application)
                .patch(`/format/${formats.FormatOne.id}/member/${users.ObiWan.id}`)
                .set('Authorization', lukeToken)
                .send({
                    role: 'organizer'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'role']);
                    expect(res.body.role).equal('organizer');
                    expect(res.body.id).equal(users.ObiWan.id);
                });
        });

        it('#PATCH update member fails because user is no organizer', async () => {
            await request(server.application)
                .patch('/format/' + formats.FormatThree.id + '/member/202d5a50-29f8-11e9-b210-d663bd873d93')
                .set('Authorization', lukeToken)
                .send({
                    role: 'participant'
                })
                .expect(403);
        });

        it('#DELETE members from format fail emails is not an array', async () => {
            await request(server.application)
                .post('/format/' + formats.FormatOne.id + '/member/_delete')
                .set('Authorization', lukeToken)
                .send({
                    emails: 'Not an array'
                })
                .expect(422);
        });

        it('#DELETE members fails because user is no organizer', async () => {
            await request(server.application)
                .post('/format/' + formats.FormatThree.id + '/member/_delete')
                .set('Authorization', lukeToken)
                .send({
                    emails: ['mickey@disney.com']
                })
                .expect(403);
        });

        it('#GET member details', async () => {
            await request(server.application)
                .get(`/format/${formats.FormatOne.id}/member/${users.Luke.id}`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(FormatMemberResponse.attrs);
                    expect(res.body.name).equal(users.Luke.name);
                    expect(res.body.teamCount).equal(2);
                    res.body.teams.forEach((team) => {
                        expect(team).to.have.keys(['id', 'name', 'memberCount', 'avatar', 'me']);
                        expect(team.id).to.be.oneOf([seeds.teams.Team1.id, seeds.teams.Team2.id]);
                        expect(team.memberCount).to.be.oneOf([1, 2]);
                    });
                    expect(res.body.skills).to.have.length(2);
                    res.body.skills.forEach((skill) => {
                        expect(skill).to.have.keys(['name']);
                        expect(skill.name).to.be.oneOf([seeds.skills.SkillOne.name, seeds.skills.SkillTwo.name]);
                    });
                });
        });

        it('#GET member details fails (user not in format)', async () => {
            await request(server.application)
                .get(`/format/${formats.FormatOne.id}/member/${users.Leia.id}`)
                .set('Authorization', lukeToken)
                .expect(404);
        });
    });

    describe('/format/:formatId/member/_sendMail', async () => {
        it('Send mail fails because user is not an Organizer', async () => {
            await request(server.application)
                .post('/format/' + formats.FormatSeven.id + '/member/_sendMail')
                .set('Authorization', lukeToken)
                .send({
                    message: 'A super duper message for all member!'
                })
                .expect(constants.HTTP_STATUS_FORBIDDEN);
        });

        it('Send mail to all members', async () => {
            await request(server.application)
                .post('/format/' + formats.FormatOne.id + '/member/_sendMail')
                .set('Authorization', lukeToken)
                .send({
                    message: 'Shortest english poem: "Oh wet pet."'
                })
                .expect(constants.HTTP_STATUS_NO_CONTENT);

            await sleep(7000);
        });

        it('Send mail to a Member', async () => {
            await request(server.application)
                .post('/format/' + formats.FormatOne.id + '/member/_sendMail')
                .set('Authorization', lukeToken)
                .send({
                    message: 'It`s a trap!!!',
                    memberIds: [users.Mickey.id]
                })
                .expect(constants.HTTP_STATUS_NO_CONTENT);

            await sleep(7000);
        });

        it('With no message should fail', async () => {
            await request(server.application)
                .post(`/format/${formats.FormatOne.id}/member/_sendMail`)
                .set('Authorization', lukeToken)
                .send({})
                .expect(constants.HTTP_STATUS_UNPROCESSABLE_ENTITY);
        });

        it('With empty message should fail', async () => {
            await request(server.application)
                .post(`/format/${formats.FormatOne.id}/member/_sendMail`)
                .set('Authorization', lukeToken)
                .send({
                    message: ''
                })
                .expect(constants.HTTP_STATUS_UNPROCESSABLE_ENTITY);
        });
    });
});
