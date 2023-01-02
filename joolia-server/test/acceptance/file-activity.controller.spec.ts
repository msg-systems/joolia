import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import * as request from 'supertest';
import { clearDatabases, getSignedIn, loadFixtures } from '../utils';
import { server } from './test.common.spec';
import { FormatFileEntry } from '../../src/api/models';
import { FileEntryResponse } from '../../src/api/responses';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const sampleFileId = '09245a20-0373-4ed9-979b-9fb36482a8ad'; // matches loaded file in s3 for dev
const formatOneId = '5500f071-de3a-4f2b-befb-2e257fbf8bb8';
const phaseTwoId = '707e1c58-f962-4cb6-a3b0-c4b6c9a9df6c';
const activityTwoId = '36d7d5e7-89ec-4a2a-bbfc-4dd34b80d4f9';
const activityFourId = '92eb79a6-d445-4372-8472-ffa4a4ba35de';
let token;
let tempFileEntry;

describe('Files on Activity', async () => {
    before(async () => {
        await loadFixtures();
        token = await getSignedIn(server);
    });

    after(async () => {
        await clearDatabases();
    });

    it('Request all files', async () => {
        return request(server.application)
            .get(`/format/${formatOneId}/phase/${phaseTwoId}/activity/${activityTwoId}/file`)
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(res.body)
                    .to.be.an('array')
                    .to.have.lengthOf(2)
                    .and.all.keys(FileEntryResponse.required);
            });
    });

    it('Request one stored file and get redirection (with download param)', async () => {
        return request(server.application)
            .get(`/format/${formatOneId}/phase/${phaseTwoId}/activity/${activityTwoId}/file/${sampleFileId}`)
            .query({ download: true })
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('Request one stored file and do not get redirection (with download param)', async () => {
        return request(server.application)
            .get(`/format/${formatOneId}/phase/${phaseTwoId}/activity/${activityTwoId}/file/${sampleFileId}`)
            .query({ download: false })
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('Request one stored file and do not get redirection (without download param)', async () => {
        return request(server.application)
            .get(`/format/${formatOneId}/phase/${phaseTwoId}/activity/${activityTwoId}/file/${sampleFileId}`)
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('Creates a new file entry for this activity', async () => {
        return request(server.application)
            .post(`/format/${formatOneId}/phase/${phaseTwoId}/activity/${activityFourId}/file`)
            .set('Authorization', token)
            .send({ name: 'report.pdf' })
            .expect(201)
            .then((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
                tempFileEntry = new FormatFileEntry(res.body);
            });
    });

    it('Retrieves the newly created file entry', async () => {
        return request(server.application)
            .get(`/format/${formatOneId}/phase/${phaseTwoId}/activity/${activityFourId}/file/${tempFileEntry.id}`)
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('Updated the name of the newly created file entry', async () => {
        return request(server.application)
            .patch(`/format/${formatOneId}/phase/${phaseTwoId}/activity/${activityFourId}/file/${tempFileEntry.id}`)
            .set('Authorization', token)
            .send({ name: 'New file name.pdf' })
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(['id', 'name']);
                expect(res.body.name).eq('New file name.pdf');
            });
    });

    it('Deletes the new file entry for this activity', async () => {
        return request(server.application)
            .delete(`/format/${formatOneId}/phase/${phaseTwoId}/activity/${activityFourId}/file/${tempFileEntry.id}`)
            .set('Authorization', token)
            .expect(204)
            .expect((res) => {
                expect(res.body).to.be.empty;
            });
    });
});
