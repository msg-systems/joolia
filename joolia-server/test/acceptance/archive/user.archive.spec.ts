import * as request from 'supertest';
import { describe } from 'mocha';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../../utils';
import { server } from '../test.common.spec';
import { ArchiveRepo } from '../../../src/api/repositories/archive';
import { expect } from 'chai';
import * as httpStatus from 'http-status';

const workspaces = seeds.workspaces;
const formats = seeds.formats;
const users = seeds.users;

/**
 * See JOOLIA-876 for context and related stories.
 */
describe('User archive & delete tests', async () => {
    let luke, leia;

    before(async () => {
        await loadFixtures();
        luke = await getSignedIn(server, users.Luke);
        leia = await getSignedIn(server, users.Leia);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('Delete a member from Format', async () => {
        let requestId = null;

        it('Step Check, Format & Team membership should not be archived', async () => {
            await request(server.application)
                .post(`/format/${formats.FormatOne.id}/member/_delete`)
                .set('Authorization', luke)
                .send({
                    emails: ['mickey@disney.com']
                })
                .expect(httpStatus.NO_CONTENT)
                .expect((res) => {
                    requestId = res.headers['X-Joolia-RequestId'];
                });

            /**
             * Memberships should be removed permanently.
             */
            let [, cnt] = await ArchiveRepo.getFormatMembers(requestId);
            expect(cnt).equals(0);

            [, cnt] = await ArchiveRepo.getTeamMembers(requestId);
            expect(cnt).equals(0);

            /**
             * Only step checks by teams are archived.
             */
            [, cnt] = await ArchiveRepo.getStepChecks(requestId);
            expect(cnt).equals(0);
        });
    });

    describe('Delete a member from Workspace', async () => {
        let requestId = null;

        it('Workspace membership should not be archived', async () => {
            await request(server.application)
                .post(`/workspace/${workspaces.Workspace2.id}/member/_delete`)
                .set('Authorization', luke)
                .send({
                    emails: [users.George.email]
                })
                .expect(httpStatus.NO_CONTENT)
                .expect((res) => {
                    requestId = res.headers['X-Joolia-RequestId'];
                });

            const [, cnt] = await ArchiveRepo.getWorkspaceMembers(requestId);
            expect(cnt).equals(0);
        });
    });

    describe('Users', async () => {
        it('Delete a User', async () => {
            let requestId = null;

            await request(server.application)
                .delete(`/user/${users.Mickey.id}`)
                .set('Authorization', leia)
                .send()
                .expect(httpStatus.NO_CONTENT)
                .expect((res) => {
                    requestId = res.headers['X-Joolia-RequestId'];
                });

            /**
             * Memberships should be removed permanently.
             */
            const [, cnt] = await ArchiveRepo.getFormatMembers(requestId);
            expect(cnt).equals(0);

            //TODO: Implement assertions based on JOOLIA-2383
        });
    });
});
