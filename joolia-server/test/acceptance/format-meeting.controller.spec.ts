import { describe } from 'mocha';
import * as request from 'supertest';
import { server } from './test.common.spec';
import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { MeetingAccessResponse } from '../../src/api/responses';
import { ImportMock } from 'ts-mock-imports';
import * as bbbModule from '../../src/api/services/meeting/BBBService';
import * as msTeamsModule from '../../src/api/services/meeting/MSTeamsService';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const formatSeed = seeds.formats;
const userSeed = seeds.users;

describe('Format Meeting Controller Test', async () => {
    let token;

    before(async () => {
        await loadFixtures();
    });

    after(async () => {
        await clearDatabases();
    });

    describe('As Platform User', () => {
        before(async () => {
            token = await getSignedIn(server, userSeed.Unprivileged);
        });

        it('Create meeting - forbidden', async () => {
            await request(server.application)
                .post(`/format/${formatSeed.FormatOne.id}/meeting`)
                .set('Authorization', token)
                .send({
                    type: 'MSTeams',
                    authorizationCode: 'dummyCode',
                    redirectUri: 'dummyUri'
                })
                .expect(403);
        });

        it('Join meeting - forbidden', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(403);
        });

        it('Delete meeting - forbidden', async () => {
            await request(server.application)
                .delete(`/format/${formatSeed.FormatOne.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(403);
        });
    });

    describe('As Organizer', () => {
        before(async () => {
            token = await getSignedIn(server, userSeed.Luke);
        });

        it.skip('Create format meeting - BBB', async () => {
            const meetingUrl = 'https://meeting-staging.joolia.live/bigbluebutton/api/join?dummyURL';
            const serviceMock = ImportMock.mockStaticClass(bbbModule, 'BBBService');
            serviceMock.mock('createMeeting', meetingUrl);

            await request(server.application)
                .post(`/format/${formatSeed.FormatOne.id}/meeting`)
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

        it('Create and join format meeting - MSTeams', async () => {
            const meetingUrl = 'https://teams.microsoft.com/l/meetup-join/dummyURL';
            const serviceMock = ImportMock.mockStaticClass(msTeamsModule, 'MSTeamsService');
            serviceMock.mock('createMeeting', meetingUrl);

            await request(server.application)
                .post(`/format/${formatSeed.FormatOne.id}/meeting`)
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
                .get(`/format/${formatSeed.FormatOne.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200)
                .expect((res) => {
                    expect(res.body.url).equal(meetingUrl);
                });

            ImportMock.restore();
        });

        it('Join format meeting if meetingLink exists', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(MeetingAccessResponse.attrs);
                });
        });

        it('Join expired format meeting - MSTeams', async () => {
            const meetingUrl = 'https://teams.microsoft.com/l/meetup-join/dummyURL';
            const serviceMock = ImportMock.mockStaticClass(msTeamsModule, 'MSTeamsService');
            serviceMock.mock('createMeeting', meetingUrl);

            await request(server.application)
                .post(`/format/${formatSeed.FormatFive.id}/meeting`)
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
                .get(`/format/${formatSeed.FormatFive.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(204);

            ImportMock.restore();
        });

        it('Join valid format meeting - MSTeams', async () => {
            const meetingUrl = 'https://teams.microsoft.com/l/meetup-join/dummyURL';
            const serviceMock = ImportMock.mockStaticClass(msTeamsModule, 'MSTeamsService');
            serviceMock.mock('createMeeting', meetingUrl);
            serviceMock.mock('getExpirationTime', new Date());

            await request(server.application)
                .post(`/format/${formatSeed.FormatFive.id}/meeting`)
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

            serviceMock.mock('hasExceededExpirationTime', false);

            await request(server.application)
                .get(`/format/${formatSeed.FormatFive.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(MeetingAccessResponse.attrs);
                });

            ImportMock.restore();
        });

        it('Delete format meeting - MSTeams', async () => {
            const meetingUrl = 'https://teams.microsoft.com/l/meetup-join/dummyURL';
            const serviceMockMSTeams = ImportMock.mockStaticClass(msTeamsModule, 'MSTeamsService');
            const serviceMockBBB = ImportMock.mockStaticClass(bbbModule, 'BBBService');
            serviceMockMSTeams.mock('createMeeting', meetingUrl);

            await request(server.application)
                .post(`/format/${formatSeed.FormatFive.id}/meeting`)
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
                .get(`/format/${formatSeed.FormatFive.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200)
                .expect((res) => {
                    expect(res.body.url).equal(meetingUrl);
                });

            await request(server.application)
                .delete(`/format/${formatSeed.FormatFive.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200);

            serviceMockBBB.mock('getMeeting', null);

            await request(server.application)
                .get(`/format/${formatSeed.FormatFive.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(204);

            ImportMock.restore();
        });

        it.skip('Delete format meeting - BBB', async () => {
            const meetingUrl = 'https://meeting-staging.joolia.live/bigbluebutton/api/join?dummyURL';
            const serviceMock = ImportMock.mockStaticClass(bbbModule, 'BBBService');
            serviceMock.mock('createMeeting', meetingUrl);
            serviceMock.mock('getMeeting', meetingUrl);
            serviceMock.mock('deleteMeeting', true);

            await request(server.application)
                .post(`/format/${formatSeed.FormatFive.id}/meeting`)
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
                .get(`/format/${formatSeed.FormatFive.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200)
                .expect((res) => {
                    expect(res.body.url).equal(meetingUrl);
                });

            await request(server.application)
                .delete(`/format/${formatSeed.FormatFive.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200);

            serviceMock.mock('getMeeting', null);

            await request(server.application)
                .get(`/format/${formatSeed.FormatFive.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(204);

            ImportMock.restore();
        });

        it('Try to delete non existing format meeting', async () => {
            const serviceMock = ImportMock.mockStaticClass(bbbModule, 'BBBService');
            serviceMock.mock('deleteMeeting', false);

            await request(server.application)
                .get(`/format/${formatSeed.FormatFive.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(204);

            await request(server.application)
                .delete(`/format/${formatSeed.FormatFive.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(404);

            ImportMock.restore();
        });

        it('Join non existing meeting', async () => {
            const serviceMock = ImportMock.mockStaticClass(bbbModule, 'BBBService');
            serviceMock.mock('getMeeting', null);

            await request(server.application)
                .get(`/format/${formatSeed.FormatNine.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(204);

            ImportMock.restore();
        });

        it.skip('Join format meeting - BBB', async () => {
            const meetingUrl = 'https://meeting-staging.joolia.live/bigbluebutton/api/join?dummyURL';
            const serviceMock = ImportMock.mockStaticClass(bbbModule, 'BBBService');
            serviceMock.mock('getMeeting', meetingUrl);

            await request(server.application)
                .get(`/format/${formatSeed.FormatNine.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200)
                .expect((res) => {
                    expect(res.body.url).equal(meetingUrl);
                });

            ImportMock.restore();
        });
    });

    describe('As Participant', () => {
        before(async () => {
            token = await getSignedIn(server, userSeed.Luke);
        });

        it('Join format meeting if meetingLink exists', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatFour.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(MeetingAccessResponse.attrs);
                });
        });

        it.skip('Join format meeting if BBB URL exists', async () => {
            const meetingUrl = 'https://meeting-staging.joolia.live/bigbluebutton/api/join?dummyURL';
            const serviceMock = ImportMock.mockStaticClass(bbbModule, 'BBBService');
            serviceMock.mock('getMeeting', meetingUrl);

            await request(server.application)
                .get(`/format/${formatSeed.FormatEight.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(200)
                .expect((res) => {
                    expect(res.body.url).equal(meetingUrl);
                });

            ImportMock.restore();
        });

        it('Join non existing meeting - no meetingLink in format table / no BBB link', async () => {
            const serviceMock = ImportMock.mockStaticClass(bbbModule, 'BBBService');
            serviceMock.mock('getMeeting', null);

            await request(server.application)
                .get(`/format/${formatSeed.FormatEight.id}/meeting`)
                .set('Authorization', token)
                .send()
                .expect(204);

            ImportMock.restore();
        });

        it('Join non existing meeting - format is unknown', async () => {
            await request(server.application)
                .get(`/format/123/meeting`)
                .set('Authorization', token)
                .send()
                .expect(404);
        });

        it('Create format meeting - Not allowed', async () => {
            await request(server.application)
                .post(`/format/${formatSeed.FormatEight.id}/meeting`)
                .set('Authorization', token)
                .send({
                    type: 'MSTeams',
                    authorizationCode: '',
                    redirectUri: ''
                })
                .expect(403);
        });

        it('Delete format meeting - Not allowed', async () => {
            await request(server.application)
                .delete(`/format/${formatSeed.FormatEight.id}/meeting`)
                .set('Authorization', token)
                .send({
                    type: 'MSTeams',
                    authorizationCode: '',
                    redirectUri: ''
                })
                .expect(403);
        });
    });
});
