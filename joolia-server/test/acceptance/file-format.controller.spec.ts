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
const fileSeed = seeds.files.formatFileEntries;

describe('Files on Format', async () => {
    let tempFileEntry;
    let luke;

    before(async () => {
        await loadFixtures();
        luke = await getSignedIn(server);
    });

    after(async () => {
        await clearDatabases();
    });

    it('Request all files', async () => {
        return request(server.application)
            .get(`/format/${formatSeed.FormatTwo.id}/file`)
            .set('Authorization', luke)
            .expect(200)
            .expect((res) => {
                expect(res.body)
                    .to.be.an('array')
                    .to.have.lengthOf(2)
                    .and.all.keys(FileEntryResponse.required);
            });
    });

    it('Request one stored file for downloading', async () => {
        return request(server.application)
            .get(`/format/${formatSeed.FormatTwo.id}/file/${fileSeed.FormatTwoFile1.id}`)
            .query({ download: true })
            .set('Authorization', luke)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('Request one stored file for displaying', async () => {
        return request(server.application)
            .get(`/format/${formatSeed.FormatTwo.id}/file/${fileSeed.FormatTwoFile1.id}`)
            .query({ download: false })
            .set('Authorization', luke)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('Request unknown file', async () => {
        return request(server.application)
            .get(`/format/${formatSeed.FormatOne.id}/file/unknown`)
            .set('Authorization', luke)
            .expect(404)
            .expect((res) => {
                expect(res.body).not.to.be.empty;
            });
    });

    xit('Request orphan file (no data in storage)', async () => {
        /**
         * Can be re-enabled when we have proper consistency check to detect
         * orphan files. Should be solved in JOOLIA-1245.
         */
        return request(server.application)
            .get(`/format/${formatSeed.FormatTwo.id}/file/${fileSeed.FormatTwoFileWithoutData.id}`)
            .set('Authorization', luke)
            .expect(404)
            .expect((res) => {
                expect(res.body).not.to.be.empty;
            });
    });

    it('Creates a new file entry for this format', async () => {
        return request(server.application)
            .post(`/format/${formatSeed.FormatOne.id}/file`)
            .set('Authorization', luke)
            .send({ name: 'report.pdf' })
            .expect(201)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
                tempFileEntry = res.body;
            });
    });

    it('Retrieves the newly created file entry', async () => {
        return request(server.application)
            .get(`/format/${formatSeed.FormatOne.id}/file/${tempFileEntry.id}`)
            .set('Authorization', luke)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('Changes the name of newly created file entry', async () => {
        return request(server.application)
            .patch(`/format/${formatSeed.FormatOne.id}/file/${tempFileEntry.id}`)
            .set('Authorization', luke)
            .send({ name: 'New file name.pdf' })
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(['id', 'name']);
                expect(res.body.name).eq('New file name.pdf');
            });
    });

    it('Deletes the new file entry for this format', async () => {
        return request(server.application)
            .delete(`/format/${formatSeed.FormatOne.id}/file/${tempFileEntry.id}`)
            .set('Authorization', luke)
            .expect(204)
            .expect((res) => {
                expect(res.body).to.be.empty;
            });
    });

    it('Cannot create file with name that exceeds length limits', async () => {
        return request(server.application)
            .post(`/format/${formatSeed.FormatOne.id}/file`)
            .set('Authorization', luke)
            .send({
                name: 'x'.repeat(256)
            })
            .expect(422);
    });

    it('Cannot create file without name', async () => {
        return request(server.application)
            .post(`/format/${formatSeed.FormatOne.id}/file`)
            .set('Authorization', luke)
            .send({})
            .expect(422);
    });

    it('Cannot create file with empty name', async () => {
        return request(server.application)
            .post(`/format/${formatSeed.FormatOne.id}/file`)
            .set('Authorization', luke)
            .send({ name: '' })
            .expect(422);
    });

    it('Cannot update file with name that exceeds length limits', async () => {
        return request(server.application)
            .patch(`/format/${formatSeed.FormatTwo.id}/file/${fileSeed.FormatTwoFile1.id}`)
            .set('Authorization', luke)
            .send({
                name: 'x'.repeat(256)
            })
            .expect(422);
    });

    it('Cannot update file without name', async () => {
        return request(server.application)
            .patch(`/format/${formatSeed.FormatTwo.id}/file/${fileSeed.FormatTwoFile1.id}`)
            .set('Authorization', luke)
            .send({})
            .expect(422);
    });

    it('Cannot update file with empty name', async () => {
        return request(server.application)
            .patch(`/format/${formatSeed.FormatTwo.id}/file/${fileSeed.FormatTwoFile1.id}`)
            .set('Authorization', luke)
            .send({ name: '' })
            .expect(422);
    });

    it('Update file with spaces in name', async () => {
        return request(server.application)
            .patch(`/format/${formatSeed.FormatTwo.id}/file/${fileSeed.FormatTwoFile1.id}`)
            .set('Authorization', luke)
            .send({ name: 'This is a file.txt' })
            .expect(200);
    });

    it('Update file with commas in name', async () => {
        return request(server.application)
            .patch(`/format/${formatSeed.FormatTwo.id}/file/${fileSeed.FormatTwoFile1.id}`)
            .set('Authorization', luke)
            .send({ name: '.png' })
            .expect(200);
    });

    it('Update file with wrong request payload', async () => {
        return request(server.application)
            .patch(`/format/${formatSeed.FormatTwo.id}/file/${fileSeed.FormatTwoFile1.id}`)
            .set('Authorization', luke)
            .send({ name: {} })
            .expect(422);
    });

    it('Update file with invalid file name', async () => {
        return request(server.application)
            .patch(`/format/${formatSeed.FormatTwo.id}/file/${fileSeed.FormatTwoFile1.id}`)
            .set('Authorization', luke)
            .send({ name: '/etc/passwd' })
            .expect(422);
    });

    it('Update file with invalid file name 2', async () => {
        return request(server.application)
            .patch(`/format/${formatSeed.FormatTwo.id}/file/${fileSeed.FormatTwoFile1.id}`)
            .set('Authorization', luke)
            .send({ name: '>this.txt' })
            .expect(422);
    });

    it('Create file with forbidden field', async () => {
        return request(server.application)
            .post(`/format/${formatSeed.FormatTwo.id}/file`)
            .set('Authorization', luke)
            .send({ versionId: 1, name: 'this.txt' })
            .expect(422);
    });
});
