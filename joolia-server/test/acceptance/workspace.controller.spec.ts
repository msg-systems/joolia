import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { describe } from 'mocha';
import * as request from 'supertest';
import { clearDatabases, getSignedIn, getSignedInAsAdmin, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import { GetFormatResponse, WorkspaceResponse } from '../../src/api/responses';
import { WorkspaceMemberRole } from '../../src/api/models';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const workspaceSeed = seeds.workspaces;
const userSeed = seeds.users;

describe('WorkspaceController', async () => {
    let lukeToken = null;
    let georgeToken = null;
    let adminToken = null;

    before(async () => {
        await loadFixtures();
        adminToken = await getSignedInAsAdmin(server);
        lukeToken = await getSignedIn(server);
        georgeToken = await getSignedIn(server, userSeed.George);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('/workspace', async () => {
        it('#GET Responds with a list of existing workspaces', async () => {
            await request(server.application)
                .get('/workspace')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(['entities', 'count']);

                    expect(res.body.count).equal(3);

                    // Workspaces should be order on name asc name by default
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(WorkspaceResponse.attrs);
                        expect(entity.id).to.be.oneOf([
                            workspaceSeed.Workspace1.id,
                            workspaceSeed.Workspace2.id,
                            workspaceSeed.Workspace3.id
                        ]);
                    });
                });
        });

        it('#POST Responds with an newly created workspace', async () => {
            await request(server.application)
                .post('/workspace')
                .set('Accept', 'application/json')
                .set('Authorization', adminToken)
                .send({
                    name: 'testWorkspace',
                    description: 'The workspace description',
                    licensesCount: 50
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).be.an('object');
                    expect(res.body.name).equal('testWorkspace');
                    expect(res.body.description).equal('The workspace description');
                    expect(res.body.memberCount).equal(1);
                    expect(res.body.formatCount).equal(0);
                    expect(res.body.licensesCount).equal(50);
                });
        });

        it('#POST Responds with a newly created workspace, even if the name is null', async () => {
            await request(server.application)
                .post('/workspace')
                .set('Accept', 'application/json')
                .set('Authorization', adminToken)
                .send({
                    name: undefined,
                    description: 'This is another workspace without a name',
                    licensesCount: 50
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).be.an('object');
                    expect(res.body.description).equal('This is another workspace without a name');
                });
        });

        it('#POST Responds with an error because of missing system admin rights', async () => {
            await request(server.application)
                .post('/workspace')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(403)
                .send({
                    name: 'testWorkspace',
                    description: 'The workspace description',
                    licensesCount: 50
                });
        });

        it('#POST Responds with an error, because an id is included in the body', async () => {
            await request(server.application)
                .post('/workspace')
                .set('Accept', 'application/json')
                .set('Authorization', adminToken)
                .send({
                    id: 'idInTheBody',
                    name: 'testWorkspace',
                    description: 'The workspace description',
                    licensesCount: 50
                })
                .expect(422)
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                });
        });

        it('#POST Responds with an error, because the licensesCount is not included', async () => {
            await request(server.application)
                .post('/workspace')
                .set('Accept', 'application/json')
                .set('Authorization', adminToken)
                .expect(422)
                .send({
                    name: 'cool workspace',
                    description: 'The workspace description'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                });
        });

        it('#GET Responds with a list of workspaces with a select on id and name', async () => {
            await request(server.application)
                .get('/workspace?select[]=id&select[]=name')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    res.body.entities.forEach((e) => {
                        expect(e).to.have.keys('id', 'name');
                    });
                });
        });

        it('#GET Responds with a list of workspaces with a select on formatCount', async () => {
            await request(server.application)
                .get('/workspace?select=formatCount')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    res.body.entities.forEach((e) => {
                        expect(e).to.have.keys('id', 'formatCount');
                    });
                });
        });

        it('#GET Responds with a list of workspaces with a select on formatCount and name', async () => {
            await request(server.application)
                .get('/workspace?select[]=formatCount&select[]=name')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    res.body.entities.forEach((e) => {
                        expect(e).to.have.keys('id', 'formatCount', 'name');
                    });
                });
        });
    });

    describe('/workspace?order=', async () => {
        it('#GET Responds with a list of existing workspaces,ordered by description', async () => {
            await request(server.application)
                .get('/workspace?order[description]=asc')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('description');
                });
        });

        it('#GET Responds with a list of existing workspaces,ordered by description descending', async () => {
            await request(server.application)
                .get('/workspace?order[description]=desc')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    // @ts-ignore
                    expect(res.body.entities).to.be.descendingBy('description');
                });
        });

        it('#GET Responds with a list of existing workspaces,ordered by description and descending id', async () => {
            await request(server.application)
                .get('/workspace?order[id]=asc&order[description]=desc')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    const twinWorkspaces = res.body.entities.filter((entity) => {
                        return entity.description === 'twin description';
                    });
                    // @ts-ignore
                    expect(twinWorkspaces).to.be.descendingBy('id');
                    // @ts-ignore
                    expect(twinWorkspaces).to.be.ascendingBy('description');
                });
        });

        it('#GET Responds with a list of existing workspaces, ordered by updatedAt', async () => {
            await request(server.application)
                .get('/workspace?order[updatedAt]=desc')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    // @ts-ignore
                    expect(res.body.entities).to.be.descendingBy('updatedAt');
                });
        });
    });

    describe('/workspace?take=&skip=', async () => {
        it('#GET Responds with a list of existing workspaces, with 2 in limit', async () => {
            await request(server.application)
                .get('/workspace?take=2')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .be.an('object')
                        .that.have.keys(['count', 'entities']);
                    expect(res.body.entities.length).equals(2);
                });
        });

        it('#GET Responds with a list of existing workspaces,with 1 in offset and limit 3', async () => {
            await request(server.application)
                .get('/workspace?take=3&skip=1')
                .set('Authorization', adminToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .be.an('object')
                        .that.have.keys(['count', 'entities']);
                    expect(res.body.entities.length).equals(2);
                });
        });
    });

    describe('/workspace/:id', async () => {
        it('#GET Responds with a specific workspace information, existing id', async () => {
            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace2.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .be.an('object')
                        .that.have.keys(WorkspaceResponse.attrs);

                    expect(res.body.id).equal(workspaceSeed.Workspace2.id);
                    expect(res.body.me.userRole).equal(WorkspaceMemberRole.ADMIN);
                    expect(res.body.name).equal(workspaceSeed.Workspace2.name);
                    expect(res.body.description).equal(workspaceSeed.Workspace2.description);
                    expect(res.body.memberCount).equal(4);
                    expect(res.body.formatCount).equal(107);
                    expect(res.body.adminCount).equal(2);
                });
        });

        it('#GET Responds with a specific workspace information, existing id select name', async () => {
            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace2.id + '?select=name')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).be.an('object');
                    expect(res.body).to.have.keys('id', 'name');
                    expect(res.body.name).equal(workspaceSeed.Workspace2.name);
                });
        });

        it('#GET Responds with a specific workspace information, existing id select formatCount', async () => {
            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace2.id + '?select=formatCount')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).be.an('object');
                    expect(res.body).to.have.keys('id', 'formatCount');
                    expect(res.body.formatCount).equal(107);
                });
        });

        it('#GET Responds with a specific workspace fails cause user is no workspace member', async () => {
            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace4.id + '?select=formatCount')
                .set('Authorization', lukeToken)
                .expect(403);
        });

        it('#GET Responds 404 for a not existing id', async () => {
            await request(server.application)
                .get('/workspace/' + 'notAnExistingId')
                .set('Authorization', lukeToken)
                .expect(404);
        });

        it('#PATCH Responds with the patched workspace', async () => {
            await request(server.application)
                .patch('/workspace/' + workspaceSeed.Workspace2.id)
                .set('Authorization', lukeToken)
                .send({
                    description: 'NewDescriptionPatched'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'description']);
                    expect(res.body.description).equal('NewDescriptionPatched');
                });
        });

        it('#PATCH Responds with the patched workspace (consent details)', async () => {
            await request(server.application)
                .patch('/workspace/' + workspaceSeed.Workspace2.id)
                .set('Authorization', lukeToken)
                .send({
                    tenant: 'c19bf6b1-9976-432d-b166-55cbcc724947',
                    domain: 'example-company.com',
                    consentDate: '2021-04-07 05:27:38.206782'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'tenant', 'domain', 'consentDate']);
                    expect(res.body.tenant).equal('c19bf6b1-9976-432d-b166-55cbcc724947');
                    expect(res.body.domain).equal('example-company.com');
                    expect(res.body.consentDate).equal('2021-04-07 05:27:38.206782');
                });
        });

        it('#PATCH Responds with an error can not update licensesCount', async () => {
            await request(server.application)
                .patch('/workspace/' + workspaceSeed.Workspace2.id)
                .set('Authorization', lukeToken)
                .set('Accept', 'application/json')
                .send({
                    licensesCount: 11
                })
                .expect(422)
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                });
        });

        it('#PATCH Responds with an error due to missing admin permissions', async () => {
            await request(server.application)
                .patch('/workspace/' + workspaceSeed.Workspace2.id)
                .set('Authorization', georgeToken)
                .send({
                    description: 'DescriptionFromGeorge'
                })
                .expect(403);
        });

        it('#PATCH Responds with an error - tenant is invalid', async () => {
            await request(server.application)
                .patch('/workspace/' + workspaceSeed.Workspace2.id)
                .set('Authorization', lukeToken)
                .send({
                    tenant: 'invalid tenant'
                })
                .expect(422)
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                });
        });

        it('#DELETE Responds with an error because of missing admin rights', async () => {
            await request(server.application)
                .delete('/workspace/' + workspaceSeed.Workspace1.id)
                .set('Authorization', lukeToken)
                .expect(403);
        });

        it('#DELETE Responds with a successful workspace deletion', async () => {
            await request(server.application)
                .delete('/workspace/' + workspaceSeed.Workspace1.id)
                .set('Authorization', adminToken)
                .expect(204);
        });
    });

    describe('/workspace/:id/format', async () => {
        it('#GET Responds with the formats of the workspace', async () => {
            await request(server.application)
                .get('/workspace/' + workspaceSeed.Workspace2.id + '/format')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(['entities', 'count']);

                    expect(res.body.entities.length).equal(100); // default pagination limit
                    expect(res.body.count).equal(106);

                    res.body.entities.forEach((format) => {
                        expect(format.workspaceId).equal(workspaceSeed.Workspace2.id);
                        expect(format).to.have.keys(GetFormatResponse.attrs);
                    });
                });
        });
    });

    describe('/workspace/:id/_consent', async () => {
        it('#POST Send admin consent request', async () => {
            await request(server.application)
                .post('/workspace/' + workspaceSeed.Workspace2.id + '/_consent')
                .set('Authorization', lukeToken)
                .send({
                    adminEmail: 'dummy.admin.account@msg.group',
                    domain: 'msg.group',
                    message: 'Message',
                    redirectUri: 'http://localhost:9000/callback'
                })
                .expect(204);
        });

        it('#POST Send admin consent request (missing workspace admin permissions)', async () => {
            await request(server.application)
                .post('/workspace/' + workspaceSeed.Workspace2.id + '/_consent')
                .set('Authorization', georgeToken)
                .send({
                    adminEmail: 'dummy.admin.account@msg.group',
                    domain: 'msg.group',
                    message: 'Message',
                    redirectUri: 'http://localhost:9000/callback'
                })
                .expect(403);
        });

        it('#POST Send admin consent request (invalid domain)', async () => {
            await request(server.application)
                .post('/workspace/' + workspaceSeed.Workspace2.id + '/_consent')
                .set('Authorization', lukeToken)
                .send({
                    adminEmail: 'dummy.admin.account@msg.group',
                    domain: 'this-domain-is.invalid',
                    message: 'Message',
                    redirectUri: 'http://localhost:9000/callback'
                })
                .expect(400);
        });
    });
});
