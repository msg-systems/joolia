import * as request from 'supertest';
import { describe } from 'mocha';
import { clearDatabases, getSignedIn, loadFixtures, checkArchiveMetaData, seeds } from '../../utils';
import { server } from '../test.common.spec';
import { ArchiveRepo } from '../../../src/api/repositories/archive';
import { expect } from 'chai';
import * as httpStatus from 'http-status';

const formats = seeds.formats;
const users = seeds.users;

/**
 * See JOOLIA-876 for context and related stories.
 */
describe('Format archive & delete tests', async () => {
    let luke, leia;

    before(async () => {
        await loadFixtures();
        luke = await getSignedIn(server, users.Luke);
        leia = await getSignedIn(server, users.Leia);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('Delete a Format', async () => {
        it('Archive a Format', async () => {
            const format = formats.FormatTwo;

            await request(server.application)
                .delete(`/format/${format.id}`)
                .set('Authorization', luke)
                .expect(httpStatus.NO_CONTENT);

            const [aFormats, cnt] = await ArchiveRepo.getFormats();
            expect(cnt).equals(1);
            aFormats.forEach((a) => checkArchiveMetaData(a, users.Luke.id));

            //TODO: See JOOLIA-2400/876. Implement assertions.
        });
    });
});
