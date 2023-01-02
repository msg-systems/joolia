import * as request from 'supertest';
import { describe } from 'mocha';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../../utils';
import { server } from '../test.common.spec';
import * as httpStatus from 'http-status';

const workspaces = seeds.workspaces;
const users = seeds.users;

/**
 * See JOOLIA-876 for context and related stories.
 */
describe('Workspace archive & delete tests', async () => {
    let luke, leia;

    before(async () => {
        await loadFixtures();
        luke = await getSignedIn(server, users.Luke);
        leia = await getSignedIn(server, users.Leia);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('Workspaces', async () => {
        it('Archive a Workspace', async () => {
            await request(server.application)
                .delete(`/workspace/${workspaces.Workspace2.id}`)
                .set('Authorization', leia)
                .send()
                .expect(httpStatus.NO_CONTENT);

            //TODO: See JOOLIA-2400/876. Implement assertions.
        });
    });
});
