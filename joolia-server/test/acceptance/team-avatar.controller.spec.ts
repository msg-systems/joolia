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

let token;

describe('Files on team avatar', async () => {
    const formatSeed = seeds.formats;
    const teamSeed = seeds.teams;

    before(async () => {
        await loadFixtures();
        token = await getSignedIn(server);
    });

    after(async () => {
        await clearDatabases();
    });

    it('Request one stored file', async () => {
        return request(server.application)
            .get(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team2.id}/avatar`)
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('Creates a new file entry for this avatar', async () => {
        return request(server.application)
            .put(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team2.id}/avatar`)
            .set('Authorization', token)
            .send({ name: 'report.pdf' })
            .expect(201)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });

    it('Retrieves the newly created file entry', async () => {
        return request(server.application)
            .get(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team2.id}/avatar`)
            .set('Authorization', token)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(FileEntryResponse.attrs);
            });
    });
});
