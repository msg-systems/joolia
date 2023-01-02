import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import * as request from 'supertest';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import { FileEntryResponse } from '../../src/api/responses';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

let lukeToken;
let obiwanToken;

describe('Workspace Logo', async () => {
    const workspaceSeed = seeds.workspaces;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
        obiwanToken = await getSignedIn(server, { email: 'obi.wan@jedi-order.com', password: '12345678' });
    });

    after(async () => {
        await clearDatabases();
    });

    it('#GET returns an existing logo', async () => {
        await request(server.application)
            .get(`/workspace/${workspaceSeed.Workspace2.id}/logo`)
            .set('Authorization', lukeToken)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('#GET returns 404 for not existing logo', async () => {
        await request(server.application)
            .get(`/workspace/${workspaceSeed.Workspace3.id}/logo`)
            .set('Authorization', lukeToken)
            .expect(404);
    });

    it('#PUT creates a new file entry for the logo', async () => {
        await request(server.application)
            .put(`/workspace/${workspaceSeed.Workspace1.id}/logo`)
            .set('Authorization', lukeToken)
            .send({ name: 'vader.jpg' })
            .expect(201)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });

        // get the newly created file entry
        await request(server.application)
            .get(`/workspace/${workspaceSeed.Workspace1.id}/logo`)
            .set('Authorization', lukeToken)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('#PUT change logo fails for workspace participant', async () => {
        await request(server.application)
            .put(`/workspace/${workspaceSeed.Workspace2.id}/logo`)
            .set('Authorization', obiwanToken)
            .send({ name: 'vader.jpg' })
            .expect(403);
    });
});
