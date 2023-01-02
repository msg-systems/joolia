import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { describe } from 'mocha';
import * as request from 'supertest';
import { ActivityResponse, FileEntryResponse, LinkEntryResponse } from '../../src/api/responses';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import { SubmissionModifySetting, SubmissionViewSetting } from '../../src/api/models';
import { logger } from '../../src/logger';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const activitySeed = seeds.activities;
const phaseSeed = seeds.phases;
const formatSeed = seeds.formats;
const activityTmplSeed = seeds.templates.activities;
const stepTmplSeed = seeds.templates.steps;
const keyVisualSeed = seeds.files.keyVisuals;
const activityConfigurationSeed = seeds.configurations;
const phaseThreeActivities = [
    activitySeed.ActivityOne,
    activitySeed.ActivityThree,
    activitySeed.ActivitySeven,
    activitySeed.ActivityEight,
    activitySeed.ActivityNine,
    activitySeed.ActivityTwentySeven,
    activitySeed.ActivityTwentyEight,
    activitySeed.ActivityTwentyNine,
    activitySeed.ActivityThirty,
    activitySeed.ActivityThirtyOne,
    activitySeed.ActivityThirtyTwo,
    ,
    activitySeed.ActivityThirtyThree,
    activitySeed.ActivityThirtyFour
];

describe('ActivityController', async () => {
    let lukeToken = null;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('/activity/:activityId/_position', async () => {
        it('PATCH update position of activity two from 2 to 1', async () => {
            const positionNew = 1;
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseTwo.id +
                        '/activity/' +
                        activitySeed.ActivityTwo.id +
                        '/_position'
                )
                .set('Authorization', lukeToken)
                .send({
                    position: positionNew
                })
                .expect((res) => {
                    expect(res.body.position).equal(positionNew);
                })
                .expect(200);

            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseTwo.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityTwo.id).position).equal(positionNew);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityFour.id).position).equal(0);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivitySix.id).position).equal(2);
                })
                .expect(200);
        });

        it('PATCH update position of activity two from 1 to 5', async () => {
            const positionNew = 5;
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseTwo.id +
                        '/activity/' +
                        activitySeed.ActivityTwo.id +
                        '/_position'
                )
                .set('Authorization', lukeToken)
                .send({
                    position: positionNew
                })
                .expect((res) => {
                    expect(res.body.position).equal(2);
                })
                .expect(200);

            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseTwo.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityTwo.id).position).equal(2);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityFour.id).position).equal(0);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivitySix.id).position).equal(1);
                })
                .expect(200);
        });

        it('PATCH update position of activity nine from 4 to 3', async () => {
            const positionNew = 3;
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityNine.id +
                        '/_position'
                )
                .set('Authorization', lukeToken)
                .send({
                    position: positionNew
                })
                .expect((res) => {
                    expect(res.body.position).equal(positionNew);
                })
                .expect(200);

            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseThree.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityOne.id).position).equal(0);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityThree.id).position).equal(1);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivitySeven.id).position).equal(2);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityNine.id).position).equal(positionNew);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityEight.id).position).equal(4);
                })
                .expect(200);
        });

        it('PATCH update position of activity nine from 3 to 3', async () => {
            const positionNew = 3;
            await request(server.application)
                // tslint:disable-next-line:max-line-length
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityNine.id +
                        '/_position'
                )
                .set('Authorization', lukeToken)
                .send({
                    position: positionNew
                })
                .expect((res) => {
                    expect(res.body.position).equal(positionNew);
                })
                .expect(200);

            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseThree.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityOne.id).position).equal(0);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityThree.id).position).equal(1);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivitySeven.id).position).equal(2);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityNine.id).position).equal(positionNew);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityEight.id).position).equal(4);
                })
                .expect(200);
        });

        it('PATCH update position of activity two from 2 to 2', async () => {
            const positionNew = 2;
            await request(server.application)
                // tslint:disable-next-line:max-line-length
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseTwo.id +
                        '/activity/' +
                        activitySeed.ActivityTwo.id +
                        '/_position'
                )
                .set('Authorization', lukeToken)
                .send({
                    position: positionNew
                })
                .expect((res) => {
                    expect(res.body.position).equal(positionNew);
                })
                .expect(200);

            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseTwo.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityTwo.id).position).equal(positionNew);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityFour.id).position).equal(0);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivitySix.id).position).equal(1);
                })
                .expect(200);
        });

        it('PATCH update position fails because position is negative', async () => {
            await request(server.application)
                // tslint:disable-next-line:max-line-length
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseTwo.id +
                        '/activity/' +
                        activitySeed.ActivityTwo.id +
                        '/_position'
                )
                .set('Authorization', lukeToken)
                .send({
                    position: -2
                })
                .expect(422);
        });

        it('PATCH update position fails because position update includes name', async () => {
            await request(server.application)
                // tslint:disable-next-line:max-line-length
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseTwo.id +
                        '/activity/' +
                        activitySeed.ActivityTwo.id +
                        '/_position'
                )
                .set('Authorization', lukeToken)
                .send({
                    name: 'notNamedAllowedHere',
                    position: 1
                })
                .expect(422);
        });

        it('PATCH update position fails because position required', async () => {
            await request(server.application)
                // tslint:disable-next-line:max-line-length
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseTwo.id +
                        '/activity/' +
                        activitySeed.ActivityTwo.id +
                        '/_position'
                )
                .set('Authorization', lukeToken)
                .send({})
                .expect(422);
        });

        it('PATCH update position fails because position is not a integer', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseTwo.id +
                        '/activity/' +
                        activitySeed.ActivityTwo.id +
                        '/_position'
                )
                .set('Authorization', lukeToken)
                .send({
                    position: 3.5
                })
                .expect(422);
        });

        it('PATCH update position fails because user is no format organizer', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySixteen.id +
                        '/_position'
                )
                .set('Authorization', lukeToken)
                .send({
                    position: 3
                })
                .expect(403);
        });
    });

    describe('/activity', async () => {
        it('#GET Retrieve all the activities and the count from Phase Three', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseThree.id}/activity`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(ActivityResponse.attrs);
                        expect(entity.id).to.be.oneOf(phaseThreeActivities.map((a) => a.id));
                    });
                    // Activities should be order on name asc name by default
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });

        it('#GET Activities with a select on name', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseThree.id}/activity?select[]=name`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(['id', 'name']);
                        expect(entity.name).to.be.oneOf(phaseThreeActivities.map((a) => a.name));
                    });
                });
        });

        it('#GET Activities with a select on name and position', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseThree.id}/activity?select[]=name&select[]=position`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(['id', 'name', 'position']);
                        expect(entity.name).to.be.oneOf(phaseThreeActivities.map((a) => a.name));
                        expect(entity.position).to.be.oneOf(phaseThreeActivities.map((a) => a.position));
                    });
                });
        });

        it('#GET Activities with a order on position for phase with > 10 activities', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseThree.id}/activity?order[position]=asc`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    for (let i = 0; i < res.body.entities.length; i++) {
                        expect(res.body.entities[i].position).equal(i);
                    }
                });
        });

        it('#GET Activities error not found format', async () => {
            await request(server.application)
                .get('/format/notFormatId/phase/' + phaseSeed.PhaseThree.id + '/activity?order=position')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(404);
        });

        it('#GET Activities error not found phase', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/notPhaseId/activity?order=position')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(404);
        });

        it('#POST create new activity in phase four (duration type minutes)', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    name: 'new activity1',
                    description: "This is an activity description with a dangerous tag: <script>alert('Owned')</script>.",
                    shortDescription: "Description short with dangerous tag: <script>alert('Owned')</script>.",
                    duration: 10,
                    position: 1
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(ActivityResponse.required);

                    expect(res.body).to.have.keys(ActivityResponse.required);
                    expect(res.body.duration).equal(15);
                    expect(res.body.name).equal('new activity1');
                    expect(res.body.description).equal('This is an activity description with a dangerous tag: .');
                    expect(res.body.shortDescription).equal('Description short with dangerous tag: .');
                    expect(res.body.position).equal(1);
                });
        });

        it('#POST create new activity in phase four with position larger than activity count', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity')
                .set('Authorization', lukeToken)
                .send({
                    name: 'new activity2',
                    description: 'This is an activity description.',
                    shortDescription: 'Description short',
                    duration: 10,
                    position: 111
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(ActivityResponse.required);

                    expect(res.body.duration).equal(15);
                    expect(res.body.name).equal('new activity2');
                    expect(res.body.description).equal('This is an activity description.');
                    expect(res.body.shortDescription).equal('Description short');
                    expect(res.body.position).equal(4);
                });
        });

        it('#POST create new activity fails cause no position is set', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    name: 'new phase',
                    description: 'This is an activity description.',
                    shortDescription: 'Description short',
                    duration: 10
                })
                .expect(422);
        });

        it('#POST create new activity fails cause name is not set', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    description: 'This is an activity description.',
                    shortDescription: 'Description short',
                    duration: 10,
                    position: 2
                })
                .expect(422);
        });

        it('#POST create new activity fails cause name is longer than 55 chars', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    name: 'new phase with name is way to long to and triggers a validation error',
                    description: 'This is an activity description.',
                    shortDescription: 'Description short',
                    duration: 10,
                    position: 2
                })
                .expect(422);
        });

        it('#POST create new activity fails cause position is negative', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    name: 'new phase with name is way to long to and triggers a validation error',
                    description: 'This is an activity description.',
                    shortDescription: 'Description short',
                    duration: 10,
                    position: -2
                })
                .expect(422);
        });

        it('#POST create new activity fails cause no duration is set', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    name: 'new phase with name is way to long to and triggers a validation error',
                    description: 'This is an activity description.',
                    shortDescription: 'Description short',
                    position: 1
                })
                .expect(422);
        });

        it('#POST create new activity fails cause duration is smaller 1', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    name: 'new phase with name is way to long to and triggers a validation error',
                    description: 'This is an activity description.',
                    shortDescription: 'Description short',
                    position: 1,
                    duration: 0
                })
                .expect(422);
        });

        it('#POST create new activity fails cause id is set', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    id: 'abababab-abababab-abababab-abababab',
                    name: 'new phase with name is way to long to and triggers a validation error',
                    description: 'This is an activity description.',
                    shortDescription: 'Description short',
                    position: 1
                })
                .expect(422);
        });

        it('#POST create new activity fails cause user is no organizer of format', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatThree.id + '/phase/' + phaseSeed.PhaseFive.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    name: 'new phase with name',
                    description: 'This is an activity description.',
                    shortDescription: 'Description short',
                    position: 1
                })
                .expect(403);
        });
    });

    describe('/activity/:activityId', async () => {
        it('#GET activities in phase that has submissions', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseTwo.id + '/activity/' + activitySeed.ActivityTwo.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(ActivityResponse.attrs);

                    expect(res.body.duration).equal(30);
                    expect(res.body.name).equal('Activity duis');
                });
        });

        it('#GET specific activity', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseThree.id}/activity/${activitySeed.ActivityOne.id}`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(ActivityResponse.attrs);

                    expect(res.body.configuration.submissionModifySetting).equal(SubmissionModifySetting.TEAM);
                    expect(res.body.configuration.submissionViewSetting).equal(SubmissionViewSetting.SUBMITTER);
                    expect(res.body.keyVisual.id).equal(keyVisualSeed.ActivityKeyVisualOne.id);
                });
        });

        it('#GET specific activity select keyVisual', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '?select=keyVisual'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(['id', 'keyVisual']);

                    expect(res.body.keyVisual).to.have.keys(FileEntryResponse.required);
                    expect(res.body.keyVisual.id).equal(keyVisualSeed.ActivityKeyVisualOne.id);
                });
        });

        it('#GET specific activity select on configuration', async () => {
            await request(server.application)
                .get(
                    `/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseThree.id}/activity/${
                        activitySeed.ActivityOne.id
                    }?select=configuration`
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(['id', 'configuration']);
                    expect(res.body.configuration.submissionModifySetting).equal(SubmissionModifySetting.TEAM);
                    expect(res.body.configuration.submissionViewSetting).equal(SubmissionViewSetting.SUBMITTER);
                });
        });

        it('#GET specific activity with select on duration', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '?select=duration'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'duration']);
                    expect(activitySeed.ActivityOne.duration).equal(res.body.duration);
                });
        });

        it('#GET specific activity with select fails not existing activity', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseTwo.id + '/activity/NotAnID')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(404);
        });

        it('#PATCH specific activity with configuration on activity with no progress', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseSeven.id +
                        '/activity/' +
                        activitySeed.ActivityFourteen.id
                )
                .set('Authorization', lukeToken)
                .send({
                    name: 'newActivityName',
                    configuration: { submissionModifySetting: SubmissionModifySetting.TEAM }
                })
                .expect(200)
                .expect((res) => {
                    logger.info('%o', res.body);
                    expect(res.body).to.have.keys('id', 'name', 'configuration');
                    expect(res.body.name).equal('newActivityName');
                    expect(res.body.configuration.submissionModifySetting).equal(SubmissionModifySetting.TEAM);
                    expect(res.body.configuration.submissionViewSetting).equal(SubmissionViewSetting.SUBMITTER);
                });
        });

        it('#PATCH specific activity', async () => {
            const response = await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseSeven.id +
                        '/activity/' +
                        activitySeed.ActivityFourteen.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    name: 'newActivityName',
                    shortDescription: "<i>Short description</i> with a dangerous tag: <script>alert('Owned')</script>.",
                    description: "<b>new description</b> with a dangerous tag: <script>alert('Owned')</script>.",
                    configuration: { submissionModifySetting: SubmissionModifySetting.TEAM }
                });
            expect(response.statusCode).equal(200);
            expect(response.body).to.have.keys('id', 'name', 'shortDescription', 'description', 'configuration');
            expect(response.body.name).equal('newActivityName');
            expect(response.body.shortDescription).equal('<i>Short description</i> with a dangerous tag: .');
            expect(response.body.description).equal('<b>new description</b> with a dangerous tag: .');
            expect(response.body.configuration.submissionModifySetting).equal(SubmissionModifySetting.TEAM);
            expect(response.body.configuration.submissionViewSetting).equal(SubmissionViewSetting.SUBMITTER);
        });

        it('#PATCH activity without changing its configuration, though activity has submission', async () => {
            await request(server.application)
                .patch(
                    '/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseThree.id + '/activity/' + activitySeed.ActivityOne.id
                )
                .set('Authorization', lukeToken)
                .send({
                    name: 'newActivityName'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.statusCode).equal(200);
                    expect(res.body).to.have.keys('id', 'name');
                    expect(res.body.name).equal('newActivityName');
                });
        });

        it('#PATCH FAILS because activity has progress - checked steps', async () => {
            await request(server.application)
                .patch(
                    '/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseThree.id + '/activity/' + activitySeed.ActivityOne.id
                )
                .set('Authorization', lukeToken)
                .send({
                    configuration: { submissionModifySetting: SubmissionModifySetting.TEAM }
                })
                .expect(400);
        });

        it('#PATCH FAILS activity has progress - submissions', async () => {
            await request(server.application)
                .patch(
                    '/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseThree.id + '/activity/' + activitySeed.ActivityOne.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    configuration: { submissionModifySetting: SubmissionModifySetting.TEAM }
                })
                .expect(400);
        });

        it('#PATCH FAILS activity has Canvas - submissions', async () => {
            await request(server.application)
                .patch(`/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseSeven.id}/activity/${activitySeed.ActivityThirteen.id}`)
                .set('Authorization', lukeToken)
                .send({
                    configuration: { submissionModifySetting: SubmissionModifySetting.TEAM }
                })
                .expect(400);
        });

        it('#PATCH fails because of invalid configuration', async () => {
            await request(server.application)
                .patch(
                    '/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseThree.id + '/activity/' + activitySeed.ActivityOne.id
                )
                .set('Authorization', lukeToken)
                .send({
                    configuration: { submissionModifySetting: 'not valid' }
                })
                .expect(422);
        });

        it('#PATCH specific activity duration check round up on minutes phase', async () => {
            await request(server.application)
                .patch(
                    '/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseThree.id + '/activity/' + activitySeed.ActivityOne.id
                )
                .set('Authorization', lukeToken)
                .send({
                    duration: '2'
                })
                .expect((res) => {
                    expect(res.body).to.have.keys('id', 'duration');
                    expect(res.body.duration).equal(15);
                })
                .expect(200);
        });

        it('#PATCH specific activity duration check round up on minutes phase', async () => {
            request(server.application)
                .patch(
                    '/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseThree.id + '/activity/' + activitySeed.ActivityOne.id
                )
                .set('Authorization', lukeToken)
                .send({
                    duration: '17'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys('id', 'duration');
                    expect(res.body.duration).equal(15);
                });
        });

        it('#PATCH specific activity duration check round up on minutes phase', async () => {
            await request(server.application)
                .patch(
                    '/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseThree.id + '/activity/' + activitySeed.ActivityOne.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    duration: '25'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys('id', 'duration');
                    expect(res.body.duration).equal(30);
                });
        });

        it('#PATCH specific activity duration check round up on days phase', async () => {
            await request(server.application)
                .patch(
                    '/format/' + formatSeed.FormatTwo.id + '/phase/' + phaseSeed.PhaseSix.id + '/activity/' + activitySeed.ActivityFive.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    duration: 1300
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys('id', 'duration');
                    expect(res.body.duration).equal(1440);
                });
        });

        it('#PATCH specific activity duration check on exactly 2 days phase', async () => {
            await request(server.application)
                .patch(
                    '/format/' + formatSeed.FormatTwo.id + '/phase/' + phaseSeed.PhaseSix.id + '/activity/' + activitySeed.ActivityFive.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    duration: 2880
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys('id', 'duration');
                    expect(res.body.duration).equal(2880);
                });
        });

        it('#PATCH specific activity duration check round up on days phase', async () => {
            await request(server.application)
                .patch(
                    '/format/' + formatSeed.FormatTwo.id + '/phase/' + phaseSeed.PhaseSix.id + '/activity/' + activitySeed.ActivityFive.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    duration: 2900
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys('id', 'duration');
                    expect(res.body.duration).equal(4320);
                });
        });

        it('#PATCH specific activity duration check round up on days phase', async () => {
            await request(server.application)
                .patch(
                    '/format/' + formatSeed.FormatTwo.id + '/phase/' + phaseSeed.PhaseSix.id + '/activity/' + activitySeed.ActivityFive.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    duration: 10
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys('id', 'duration');
                    expect(res.body.duration).equal(1440);
                });
        });

        it('#PATCH specific activity duration fails duration less than 1', async () => {
            await request(server.application)
                .patch(
                    '/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseThree.id + '/activity/' + activitySeed.ActivityOne.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    duration: -0.5
                })
                .expect(422);
        });

        it('#PATCH specific activity fails position should no be updated here', async () => {
            await request(server.application)
                .patch(
                    '/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseThree.id + '/activity/' + activitySeed.ActivityOne.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    position: '5'
                })
                .expect(422);
        });

        it('#PATCH specific activity fails because user in no format member', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySixteen.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    duration: '5'
                })
                .expect(403);
        });

        it('#GET specific activity with collaboration links', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseTwo.id + '/activity/' + activitySeed.ActivitySix.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(ActivityResponse.attrs);

                    expect(res.body.collaborationLinks.length).equals(2);

                    res.body.collaborationLinks.forEach((link) => {
                        expect(link).to.have.keys(LinkEntryResponse.attrs);
                    });
                });
        });

        it('#PATCH specific activity to add a new link entry', async () => {
            const activityUrl = `/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseTwo.id}/activity/${activitySeed.ActivitySix.id}`;

            await request(server.application)
                .patch(activityUrl)
                .set('Authorization', lukeToken)
                .send({
                    collaborationLinks: [{ linkUrl: 'http://teams.microsoft.com/1' }]
                })
                .expect(200)
                .expect((res) => {
                    logger.info('%o', res.body);
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys('collaborationLinks', 'id');

                    expect(res.body.collaborationLinks.length).equals(3);
                });

            await request(server.application)
                .get(activityUrl)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(ActivityResponse.attrs);

                    expect(res.body.collaborationLinks.length).equals(3);

                    res.body.collaborationLinks.forEach((link) => {
                        expect(link).to.have.keys(LinkEntryResponse.attrs);
                    });
                });
        });

        it('#PATCH specific activity to delete a link entry', async () => {
            await request(server.application)
                .patch(
                    '/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseTwo.id + '/activity/' + activitySeed.ActivitySix.id
                )
                .set('Authorization', lukeToken)
                .send({
                    collaborationLinks: [{ id: 'fc9cf038-533d-4f46-b15c-8f86b2e38fcc', linkUrl: null }]
                })
                .expect(200)
                .expect((res) => {
                    logger.info('%o', res.body);
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys('collaborationLinks', 'id');
                });
        });

        it('#PATCH specific activity with collaboration links w/o description', async () => {
            let linkCreated = null;
            const activityUrl = `/format/${formatSeed.FormatTwo.id}/phase/${phaseSeed.PhaseSix.id}/activity/${
                activitySeed.ActivityFive.id
            }`;

            await request(server.application) // add
                .patch(activityUrl)
                .set('Authorization', lukeToken)
                .send({
                    collaborationLinks: [{ linkUrl: 'http://www.google.de' }]
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys('collaborationLinks', 'id');

                    expect(res.body.collaborationLinks.length).equals(1);
                    expect(res.body.collaborationLinks[0]).to.have.keys(LinkEntryResponse.attrs);
                    expect(res.body.collaborationLinks[0].linkUrl).equals('http://www.google.de');
                    expect(res.body.collaborationLinks[0].description).equals(null);
                    linkCreated = res.body.collaborationLinks[0];
                });

            await request(server.application) // remove it
                .patch(activityUrl)
                .set('Authorization', lukeToken)
                .send({
                    collaborationLinks: [{ id: linkCreated.id, linkUrl: null }]
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys('collaborationLinks', 'id');

                    expect(res.body.collaborationLinks.length).equals(0);
                });

            await request(server.application) // nothing left
                .get(activityUrl)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.collaborationLinks.length).equals(0);
                });
        });

        it('#PATCH specific activity with collaboration links', async () => {
            const activityUrl = `/format/${formatSeed.FormatTwo.id}/phase/${phaseSeed.PhaseSix.id}/activity/${
                activitySeed.ActivityFive.id
            }`;

            await request(server.application)
                .patch(activityUrl)
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    collaborationLinks: [{ linkUrl: 'http://www.facebook.de', description: 'Test Collaboration-Links' }]
                })
                .expect(200)
                .expect((res) => {
                    logger.info('%o', res.body);
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys('collaborationLinks', 'id');

                    expect(res.body.collaborationLinks.length).equals(1);
                    expect(res.body.collaborationLinks[0]).to.have.keys(LinkEntryResponse.attrs);
                    expect(res.body.collaborationLinks[0].linkUrl).equals('http://www.facebook.de');
                    expect(res.body.collaborationLinks[0].description).equals('Test Collaboration-Links');
                });

            await request(server.application)
                .get(activityUrl)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(ActivityResponse.attrs);

                    expect(res.body.collaborationLinks.length).equals(1);
                    expect(res.body.collaborationLinks[0]).to.have.keys(LinkEntryResponse.attrs);
                    expect(res.body.collaborationLinks[0].linkUrl).equals('http://www.facebook.de');
                    expect(res.body.collaborationLinks[0].description).equals('Test Collaboration-Links');
                });
        });

        it('#PATCH specific activity to delete collaboration links', async () => {
            const activityUrl = `/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseTwo.id}/activity/${activitySeed.ActivitySix.id}`;

            await request(server.application)
                .patch(activityUrl)
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    collaborationLinks: null
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys('collaborationLinks', 'id');
                    expect(res.body.collaborationLinks).to.be.null;
                });

            await request(server.application)
                .get(activityUrl)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(ActivityResponse.attrs);

                    expect(res.body.collaborationLinks.length).equals(0);
                });
        });

        it('#DELETE activity thirteen of phase 7', async () => {
            await request(server.application)
                .delete(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseSeven.id +
                        '/activity/' +
                        activitySeed.ActivityThirteen.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(204);

            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseSeven.id + '/activity')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    logger.info('%o', res.body);
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(['count', 'entities']);

                    expect(res.body.count).equals(2);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityFourteen.id).position).equal(0);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityFithteen.id).position).equal(1);
                });
        });

        it('#DELETE last activity of phase 7', async () => {
            await request(server.application)
                .delete(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseSeven.id +
                        '/activity/' +
                        activitySeed.ActivityFithteen.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(204);

            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseSeven.id + '/activity')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityFourteen.id).position).equal(0);
                })
                .expect(200);
        });

        it('#DELETE from format 3 fails cause user is no organizer of that format', async () => {
            await request(server.application)
                .delete(
                    '/format/' +
                        formatSeed.FormatThree.id +
                        '/phase/' +
                        phaseSeed.PhaseFive.id +
                        '/activity/' +
                        activitySeed.ActivityFive.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(403);
        });

        it('#DELETE activity fails as id does not exist', async () => {
            await request(server.application)
                .delete('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseSeven.id + '/activity/123-not-a-valid-id')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(404);
        });
    });

    describe('/activity/:activityId/_details', async () => {
        it('#GET activity details', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseThree.id}/activity/${activitySeed.ActivityOne.id}/_details`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(['submissionCount', 'stepCount', 'configuration']);
                    expect(res.body.submissionCount).equal(2);
                    expect(res.body.stepCount).equal(2);
                    expect(res.body.configuration.blocked).equal(true);
                });
        });

        it('Activity Configuration should be blocked because of Canvas Submissions', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseTwo.id}/activity/${activitySeed.ActivityTwo.id}/_details`)
                .set('Authorization', lukeToken)
                .send()
                .expect(200)
                .expect((res) => {
                    expect(res.body.submissionCount).equal(2);
                    expect(res.body.stepCount).equal(0);
                    expect(res.body.configuration.blocked).to.be.true;
                });
        });

        it('#GET activity details - configuration NOT blocked by progress or submissions', async () => {
            await request(server.application)
                .get(
                    `/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseThree.id}/activity/${activitySeed.ActivityThree.id}/_details`
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(['submissionCount', 'stepCount', 'configuration']);
                    expect(res.body.submissionCount).equal(0);
                    expect(res.body.stepCount).equal(0);
                    expect(res.body.configuration.blocked).equal(false);
                });
        });

        it('#GET activity details - configuration blocked by progress', async () => {
            await request(server.application)
                .get(
                    `/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseThree.id}/activity/${activitySeed.ActivitySeven.id}/_details`
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(['submissionCount', 'stepCount', 'configuration']);
                    expect(res.body.submissionCount).equal(0);
                    expect(res.body.stepCount).equal(5);
                    expect(res.body.configuration.blocked).equal(true);
                });
        });

        it('#GET activity details - configuration blocked by submissions', async () => {
            await request(server.application)
                .get(
                    `/format/${formatSeed.FormatFour.id}/phase/${phaseSeed.PhaseEight.id}/activity/${
                        activitySeed.ActivitySixteen.id
                    }/_details`
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    logger.info('%o', res.body);
                    expect(res.body)
                        .to.be.an('object')
                        .that.have.keys(['submissionCount', 'stepCount', 'configuration']);
                    expect(res.body.submissionCount).equal(1);
                    expect(res.body.stepCount).equal(0);
                    expect(res.body.configuration.blocked).equal(true);
                });
        });
    });

    describe('/activity/_template', async (): Promise<void> => {
        let createdActivityId = null;

        it('#POST create Activity from ActivityTemplate', async (): Promise<void> => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity/_template')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    activityTemplateId: activityTmplSeed.ActivityTemplate4.id,
                    position: 1
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).to.have.keys(ActivityResponse.attrs);
                    expect(res.body.duration).equal(75); // Rounds up form 70 to 75
                    expect(res.body.name).equal(activityTmplSeed.ActivityTemplate4.name);
                    expect(res.body.description).equal(activityTmplSeed.ActivityTemplate4.description);
                    expect(res.body.shortDescription).equal(activityTmplSeed.ActivityTemplate4.shortDescription);
                    expect(res.body.position).equal(1);
                    expect(res.body.keyVisual).to.have.keys(FileEntryResponse.required);
                    expect(res.body.configuration.submissionModifySetting).equal(
                        activityConfigurationSeed.ActivityConfigurationThirty.submissionModifySetting
                    );
                    expect(res.body.configuration.submissionViewSetting).equal(
                        activityConfigurationSeed.ActivityConfigurationThirty.submissionViewSetting
                    );
                    createdActivityId = res.body.id;
                });

            // Check position was set correctly for all activities in phase
            await request(server.application)
                .get('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityTen.id).position).equal(0);
                    expect(res.body.entities.find((activity) => activity.name === activityTmplSeed.ActivityTemplate4.name).position).equal(
                        1
                    );
                    expect(res.body.entities.find((activity) => activity.name === 'new activity1').position).equal(2);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityEleven.id).position).equal(3);
                    expect(res.body.entities.find((activity) => activity.id === activitySeed.ActivityTwelve.id).position).equal(4);
                    expect(res.body.entities.find((activity) => activity.name === 'new activity2').position).equal(5);
                });

            // Check steps were set correctly for the new created activity
            await request(server.application)
                .get(
                    '/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity/' + createdActivityId + '/step'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    res.body.entities.forEach((entity) => {
                        expect(entity.description).to.be.oneOf([
                            stepTmplSeed.StepTemplate4.description,
                            stepTmplSeed.StepTemplate5.description
                        ]);
                    });
                    expect(res.body.entities.find((step) => step.description === stepTmplSeed.StepTemplate4.description).position).equal(0);
                    expect(res.body.entities.find((step) => step.description === stepTmplSeed.StepTemplate5.description).position).equal(1);
                });
        });

        it('#GET checks the files have been transferred to new activity from activity template 4', async () => {
            const response = await request(server.application)
                .get(
                    '/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity/' + createdActivityId + '/file'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body)
                .to.be.an('array')
                .lengthOf(1);
            expect(response.body[0]).to.have.keys(FileEntryResponse.required);
        });

        it('#POST create Activity from Template and round up to one day', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseOne.id + '/activity/_template')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    activityTemplateId: activityTmplSeed.ActivityTemplate1.id,
                    position: 1
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).to.have.keys(ActivityResponse.attrs);
                    expect(res.body.duration).equal(1440); // Rounds up form 3 minutes to one day 24*60 = 1440
                    expect(res.body.name).equal(activityTmplSeed.ActivityTemplate1.name);
                    expect(res.body.description).equal(activityTmplSeed.ActivityTemplate1.description);
                    expect(res.body.shortDescription).equal(activityTmplSeed.ActivityTemplate1.shortDescription);
                    expect(res.body.position).equal(0); // changes position to 0 as no other activity is there.
                });
        });

        it('#POST create Activity from Template and round down from one day to 60 min', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity/_template')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    activityTemplateId: activityTmplSeed.ActivityTemplate6.id,
                    position: 10
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).to.have.keys(ActivityResponse.attrs);
                    expect(res.body.duration).equal(60); // Rounds down form 1440 minutes to one hour
                    expect(res.body.name).equal(activityTmplSeed.ActivityTemplate6.name);
                    expect(res.body.description).equal(activityTmplSeed.ActivityTemplate6.description);
                    expect(res.body.shortDescription).equal(activityTmplSeed.ActivityTemplate6.shortDescription);
                    expect(res.body.position).equal(6); // changes position to 6 as only 6 other activities (0-5) exist
                });
        });

        it('#POST create new activity fails cause no position is set', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity/_template')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    activityTemplateId: activityTmplSeed.ActivityTemplate4.id
                })
                .expect(422);
        });

        it('#POST create new activity fails cause no activiyTemplateId is set', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity/_template')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    position: 2
                })
                .expect(422);
        });

        it('#POST create new activity fails cause activityTemplateId is no uuid', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity/_template')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    activityTemplateId: 'abc',
                    position: 2
                })
                .expect(422);
        });

        it('#POST create new activity fails cause position is negative', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFive.id + '/phase/' + phaseSeed.PhaseFour.id + '/activity/_template')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    activityTemplateId: activityTmplSeed.ActivityTemplate4.id,
                    position: -2
                })
                .expect(422);
        });

        it('#POST create new activity fails because user is not an organizer', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatFour.id + '/phase/' + phaseSeed.PhaseEight.id + '/activity/_template')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    activityTemplateId: activityTmplSeed.ActivityTemplate4.id,
                    position: 1
                })
                .expect(403);
        });
    });

    describe('/activity/:activityId/keyvisual (FILE)', async () => {
        const activityOnePath = `/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseThree.id}/activity/${
            activitySeed.ActivityOne.id
        }/keyvisual`;

        it('#PUT replaces an existing key visual', async () => {
            const response = await request(server.application)
                .put(activityOnePath)
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(201);
            expect(response.body).to.have.keys(FileEntryResponse.attrs);
        });

        it('#GET gets the activity key visual', async () => {
            const response = await request(server.application)
                .get(activityOnePath)
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body).to.have.keys(FileEntryResponse.attrs);
        });

        const activityTwoPath = `/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseTwo.id}/activity/${
            activitySeed.ActivityTwo.id
        }/keyvisual`;

        let createdKeyVisualId = null;

        it('#PUT creates the activity key visual', async () => {
            const response = await request(server.application)
                .put(activityTwoPath)
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(201);
            expect(response.body).to.have.keys(FileEntryResponse.attrs);

            createdKeyVisualId = response.body.id;
        });

        it('#GET newly created key visual', async () => {
            const response = await request(server.application)
                .get(activityTwoPath)
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body).to.have.keys(FileEntryResponse.attrs);
            expect(response.body.id).equals(createdKeyVisualId);
        });
    });

    describe('/activity/:activityId/keyvisual (LINK)', async () => {
        const activityOnePath = `/format/${formatSeed.FormatOne.id}/phase/${phaseSeed.PhaseThree.id}/activity/${
            activitySeed.ActivityOne.id
        }`;

        it('#PUT replaces an existing key visual with a link fails as the link is not a youtube link', async () => {
            await request(server.application)
                .put(activityOnePath + '/keyvisual')
                .set('Authorization', lukeToken)
                .send({
                    linkUrl: 'youTub.com'
                })
                .expect(422);
        });

        it('#PUT replaces an existing key visual with a youtube link', async () => {
            await request(server.application)
                .put(activityOnePath + '/keyvisual')
                .set('Authorization', lukeToken)
                .send({
                    linkUrl: 'https://www.youtube.com/embed/u_vMChpZMCk'
                })
                .expect(201)
                .expect((res) => {
                    //TODO: Re-enable this check
                    // expect(res.body).to.have.keys(LinkEntryResponse.attrs);
                    expect(res.body.linkUrl).equal('https://www.youtube.com/embed/u_vMChpZMCk');
                });
        });

        it('#GET gets the activity checks keyVisual has been updated', async () => {
            await request(server.application)
                .get(activityOnePath)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.keyVisual).to.have.keys(LinkEntryResponse.attrs);
                    expect(res.body.keyVisual.linkUrl).equal('https://www.youtube.com/embed/u_vMChpZMCk');
                });
        });
    });
});
