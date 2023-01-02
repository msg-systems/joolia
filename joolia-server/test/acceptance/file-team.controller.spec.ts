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

const formatSeed = seeds.formats;
const teamSeed = seeds.teams;

describe('Files on Team', async () => {
    let luke;
    let tempFileEntry;

    before(async () => {
        await loadFixtures();
        luke = await getSignedIn(server);
    });

    after(async () => {
        await clearDatabases();
    });

    it('Request all files', async () => {
        return request(server.application)
            .get(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/file`)
            .set('Authorization', luke)
            .expect(200)
            .expect((res) => {
                expect(res.body)
                    .to.be.an('array')
                    .to.have.lengthOf(2)
                    .and.all.keys(FileEntryResponse.required);
            });
    });

    it('Creates a new file entry for this team', async () => {
        return request(server.application)
            .post(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/file`)
            .set('Authorization', luke)
            .send({ name: 'teamFile.pdf' })
            .expect(201)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
                tempFileEntry = res.body;
            });
    });

    it('Retrieves the newly created file entry', async () => {
        return request(server.application)
            .get(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/file/${tempFileEntry.id}`)
            .set('Authorization', luke)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('Updates the newly created file entry name', async () => {
        return request(server.application)
            .patch(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/file/${tempFileEntry.id}`)
            .set('Authorization', luke)
            .send({ name: 'New file name.pdf' })
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(['id', 'name']);
                expect(res.body.name).eq('New file name.pdf');
            });
    });

    it('Deletes the new file entry for this team', async () => {
        return request(server.application)
            .delete(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/file/${tempFileEntry.id}`)
            .set('Authorization', luke)
            .expect(204)
            .expect((res) => {
                expect(res.body).to.be.empty;
            });
    });
});
