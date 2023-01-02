import { describe } from 'mocha';
import * as request from 'supertest';
import { server } from './test.common.spec';
import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { ImportMock } from 'ts-mock-imports';
import * as bbbModule from '../../src/api/services/meeting/BBBService';
import * as msTeamsModule from '../../src/api/services/meeting/MSTeamsService';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const formatSeed = seeds.formats;
const teamSeed = seeds.teams;
const userSeed = seeds.users;

describe('Team Meeting Controller Test', async () => {
    let token;

    before(async () => {
        await loadFixtures();
    });

    after(async () => {
        await clearDatabases();
    });

    describe('Not a Team member', () => {
        before(async () => {
            token = await getSignedIn(server, userSeed.Unprivileged);
        });

        it('Join a meeting - forbidden', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(403);
        });

        it('Create a meeting - forbidden', async () => {
            await request(server.application)
                .post(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send({
                    type: 'MSTeams',
                    authorizationCode: 'dummyCode',
                    redirectUri: 'dummyUri'
                })
                .expect(403);
        });

        it('Delete a meeting - forbidden', async () => {
            await request(server.application)
                .delete(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send({
                    type: 'MSTeams',
                    authorizationCode: 'dummyCode',
                    redirectUri: 'dummyUri'
                })
                .expect(403);
        });
    });

    describe('As Team Member', () => {
        before(async () => {
            token = await getSignedIn(server, userSeed.Luke);
        });

        it('Create and join team meeting - MSTeams', async () => {
            const meetingUrl = 'https://teams.microsoft.com/l/meetup-join/dummyURL';
            const serviceMock = ImportMock.mockStaticClass(msTeamsModule, 'MSTeamsService');
            serviceMock.mock('createMeeting', meetingUrl);

            await request(server.application)
                .post(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send({
                    type: 'MSTeams',
                    authorizationCode: 'dummyCode',
                    redirectUri: 'dummyUri'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.url).equal(meetingUrl);
                });

            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200)
                .expect((res) => {
                    expect(res.body.url).equal(meetingUrl);
                });

            ImportMock.restore();
        });

        it.skip('Create team meeting - BBB', async () => {
            const meetingUrl = 'https://meeting-staging.joolia.live/bigbluebutton/api/join?dummyURL';
            const serviceMock = ImportMock.mockStaticClass(bbbModule, 'BBBService');
            serviceMock.mock('createMeeting', meetingUrl);

            await request(server.application)
                .post(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team2.id}/meeting`)
                .set('Authorization', token)
                .send({
                    type: 'BBB',
                    authorizationCode: '',
                    redirectUri: ''
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.url).equal(meetingUrl);
                });

            ImportMock.restore();
        });

        it.skip('Join team meeting - BBB', async () => {
            const meetingUrl = 'https://meeting-staging.joolia.live/bigbluebutton/api/join?dummyURL';
            const serviceMock = ImportMock.mockStaticClass(bbbModule, 'BBBService');
            serviceMock.mock('getMeeting', meetingUrl);

            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team2.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200)
                .expect((res) => {
                    expect(res.body.url).equal(meetingUrl);
                });

            ImportMock.restore();
        });

        it('Join non existing meeting - Team does not have a meeting', async () => {
            const serviceMock = ImportMock.mockStaticClass(bbbModule, 'BBBService');
            serviceMock.mock('getMeeting', null);

            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team2.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(204);

            ImportMock.restore();
        });

        it('Join non existing meeting - Team is unknown', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/team/123/meeting`)
                .set('Authorization', token)
                .send()
                .expect(404);
        });

        it('Create meeting for non existing team', async () => {
            await request(server.application)
                .post(`/format/${formatSeed.FormatOne.id}/team/123/meeting`)
                .set('Authorization', token)
                .send({
                    type: 'MSTeams',
                    authorizationCode: 'dummyCode',
                    redirectUri: 'dummyUri'
                })
                .expect(404);
        });

        it('Join expired team meeting - MSTeams', async () => {
            const meetingUrl = 'https://teams.microsoft.com/l/meetup-join/dummyURL';
            const serviceMock = ImportMock.mockStaticClass(msTeamsModule, 'MSTeamsService');
            serviceMock.mock('createMeeting', meetingUrl);

            await request(server.application)
                .post(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send({
                    type: 'MSTeams',
                    authorizationCode: 'dummyCode',
                    redirectUri: 'dummyUri'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.url).equal(meetingUrl);
                });

            serviceMock.mock('hasExceededExpirationTime', true);

            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(204);

            ImportMock.restore();
        });

        it('Delete team meeting - MSTeams', async () => {
            const meetingUrl = 'https://teams.microsoft.com/l/meetup-join/dummyURL';
            const serviceMockMSTeams = ImportMock.mockStaticClass(msTeamsModule, 'MSTeamsService');
            const serviceMockBBB = ImportMock.mockStaticClass(bbbModule, 'BBBService');
            serviceMockMSTeams.mock('createMeeting', meetingUrl);

            await request(server.application)
                .post(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send({
                    type: 'MSTeams',
                    authorizationCode: 'dummyCode',
                    redirectUri: 'dummyUri'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.url).equal(meetingUrl);
                });

            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200)
                .expect((res) => {
                    expect(res.body.url).equal(meetingUrl);
                });

            await request(server.application)
                .delete(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200);

            serviceMockBBB.mock('getMeeting', null);

            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(204);

            ImportMock.restore();
        });

        it.skip('Delete team meeting - BBB', async () => {
            const meetingUrl = 'https://meeting-staging.joolia.live/bigbluebutton/api/join?dummyURL';
            const serviceMock = ImportMock.mockStaticClass(bbbModule, 'BBBService');
            serviceMock.mock('createMeeting', meetingUrl);
            serviceMock.mock('getMeeting', meetingUrl);
            serviceMock.mock('deleteMeeting', true);

            await request(server.application)
                .post(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send({
                    type: 'BBB',
                    authorizationCode: '',
                    redirectUri: ''
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.url).equal(meetingUrl);
                });

            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200)
                .expect((res) => {
                    expect(res.body.url).equal(meetingUrl);
                });

            await request(server.application)
                .delete(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200);

            serviceMock.mock('getMeeting', null);

            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(204);

            ImportMock.restore();
        });

        it('Try to delete non existing team meeting', async () => {
            const serviceMock = ImportMock.mockStaticClass(bbbModule, 'BBBService');
            serviceMock.mock('deleteMeeting', false);

            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(204);

            await request(server.application)
                .delete(`/format/${formatSeed.FormatOne.id}/team/${teamSeed.Team1.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(404);

            ImportMock.restore();
        });
    });
});
