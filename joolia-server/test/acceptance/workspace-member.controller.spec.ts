import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { describe } from 'mocha';
import * as request from 'supertest';
import { clearDatabases, getSignedIn, loadFixtures, seeds, sleep } from '../utils';
import { server } from './test.common.spec';
import { WorkspaceMemberAdminResponse, WorkspaceMemberResponse } from '../../src/api/responses';
import { WorkspaceMemberRole } from '../../src/api/models';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const workspaceSeed = seeds.workspaces;
const userSeed = seeds.users;

let lukeToken = null;
let georgeToken = null;
let obiWanToken = null;
let leiaToken = null;

function setupBeforeAndAfter(): void {
    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server, userSeed.Luke);
        georgeToken = await getSignedIn(server, userSeed.George);
        obiWanToken = await getSignedIn(server, userSeed.ObiWan);
        leiaToken = await getSignedIn(server, userSeed.Leia);
    });

    after(async () => {
        await clearDatabases();
    });
}

describe('WorkspaceMemberController', async () => {
    describe('User is an Admin', async () => {
        setupBeforeAndAfter();

        it('Get all members', async () => {
            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace2.id + '/member')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.count).equals(4);

                    // Ordered asc name by default
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(WorkspaceMemberAdminResponse.attrs);
                    });
                });
        });

        it('Get all members. Select name, pending', async () => {
            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace2.id + '/member?select[]=name&select[]=pending')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities).to.be.an('array');
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(['id', 'name', 'pending']);
                    });
                });
        });

        it('Get all pending members', async () => {
            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace1.id + '/member?filter[pending]=true')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(WorkspaceMemberAdminResponse.attrs);
                    });

                    expect(res.body.entities).to.have.length(1);
                    expect(res.body.entities[0].name).to.eq(userSeed.PendingUser.name);
                    expect(res.body.entities[0].pending).to.equals(userSeed.PendingUser.pending);
                });
        });

        it('Add new members to the workspace - all existing users (not pending)', async () => {
            await request(server.application)
                .patch('/workspace/' + workspaceSeed.Workspace2.id + '/member')
                .set('Authorization', lukeToken)
                .send({
                    emails: [userSeed.Luke.email, 'MICKEY@disney.com', userSeed.Mickey.email]
                })
                .expect(204);

            await sleep(5000); // Invitation is processed async and there are dependent tests belows

            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace2.id + '/member?filter[pending]=false')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equals(5);
                    res.body.entities.forEach((entity) => {
                        expect(entity.email).to.be.oneOf([
                            userSeed.Luke.email,
                            userSeed.Mickey.email,
                            userSeed.ObiWan.email,
                            userSeed.George.email,
                            userSeed.Anakin.email
                        ]);
                    });
                });

            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace2.id + '/member?filter[pending]=true')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equals(0);
                });
        });

        it('Add a member to the workspace - A NON-existing user', async () => {
            let someone = null;

            // Luke invite someone
            await request(server.application)
                .patch('/workspace/' + workspaceSeed.Workspace2.id + '/member')
                .set('Authorization', lukeToken)
                .send({
                    emails: ['someone@somewhere.net']
                })
                .expect(204);

            await sleep(5000); // Invitation is processed async and there are dependent tests belows

            // Luke check is pending
            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace2.id + '/member?filter[pending]=true')
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
                .post('/workspace/' + workspaceSeed.Workspace2.id + '/member/_delete')
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

        it('Delete a member from the workspace', async () => {
            await request(server.application)
                .post('/workspace/' + workspaceSeed.Workspace2.id + '/member/_delete')
                .set('Authorization', lukeToken)
                .send({
                    emails: ['MICKEY@disney.com']
                })
                .expect(204);

            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace2.id + '/member')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.some((e) => e.email === 'mickey@disney.com')).is.false;
                });
        });

        it('Admin cannot delete himself from the workspace', async () => {
            await request(server.application)
                .post('/workspace/' + workspaceSeed.Workspace2.id + '/member/_delete')
                .set('Authorization', lukeToken)
                .send({
                    emails: [userSeed.Luke.email]
                })
                .expect(400);
        });

        it('Get all members skip 1 take 3', async () => {
            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace2.id + '/member?take=3&skip=1')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.count).equals(4);
                    expect(res.body.entities.length).equals(3);

                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(WorkspaceMemberAdminResponse.attrs);
                    });
                });
        });

        it('Get unknown member', async () => {
            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace2.id + '/member/NotExistingMember')
                .set('Authorization', lukeToken)
                .expect(404);
        });

        it('Cannot change role of last admin to participant ', async () => {
            await request(server.application)
                .patch('/workspace/' + workspaceSeed.Workspace6.id + '/member/' + userSeed.George.id)
                .set('Authorization', georgeToken)
                .send({
                    role: WorkspaceMemberRole.PARTICIPANT
                })
                .expect(400);
        });

        it('Update a members role', async () => {
            await request(server.application)
                .patch('/workspace/' + workspaceSeed.Workspace2.id + '/member/' + userSeed.George.id)
                .set('Authorization', lukeToken)
                .send({
                    role: WorkspaceMemberRole.ADMIN
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'role']);
                    expect(res.body.role).equal(WorkspaceMemberRole.ADMIN);
                    expect(res.body.id).equal(userSeed.George.id);
                });
        });

        it('Get all members. Ordered by name.', async () => {
            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace6.id + '/member?order[name]=asc')
                .set('Authorization', georgeToken)
                .expect(200)
                .expect((res) => {
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(WorkspaceMemberAdminResponse.attrs);
                    });

                    const membersNameNotNull = res.body.entities.map((member) => {
                        if (!member.name) {
                            member.name = 'zzz';
                        }
                        return member;
                    });
                    // @ts-ignore
                    expect(membersNameNotNull).to.be.ascendingBy('name');
                });
        });
    });

    describe('User is not an Admin ', async () => {
        setupBeforeAndAfter();

        it('Get all members', async () => {
            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace2.id + '/member')
                .set('Authorization', obiWanToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.count).equals(4);

                    // Ordered asc name by default
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(WorkspaceMemberResponse.attrs);
                    });
                });
        });

        it('Cannot update a members role', async () => {
            await request(server.application)
                .patch('/workspace/' + workspaceSeed.Workspace2.id + '/member/' + userSeed.Luke.id)
                .set('Authorization', obiWanToken)
                .send({
                    role: WorkspaceMemberRole.PARTICIPANT
                })
                .expect(403);
        });

        it('Cannot add members', async () => {
            await request(server.application)
                .patch('/workspace/' + workspaceSeed.Workspace2.id + '/member')
                .set('Authorization', obiWanToken)
                .send({
                    emails: [userSeed.Luke.email, 'MICKEY@disney.com', userSeed.Mickey.email]
                })
                .expect(403);
        });

        it('Cannot delete members', async () => {
            await request(server.application)
                .post('/workspace/' + workspaceSeed.Workspace2.id + '/member/_delete')
                .set('Authorization', obiWanToken)
                .send({
                    emails: ['MICKEY@disney.com']
                })
                .expect(403);
        });
    });
});
