import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { describe } from 'mocha';
import * as moment from 'moment';
import * as request from 'supertest';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import { PhaseDurationUnit, PhaseStatus } from '../../src/api/models';
import { PhaseResponse } from '../../src/api/responses';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const phaseSeed = seeds.phases;
const formatSeed = seeds.formats;
const phaseTemplateSeed = seeds.templates.phases;
const activityTemplateSeed = seeds.templates.activities;
const stepTemplateSeed = seeds.templates.steps;
const activityConfigurationSeed = seeds.configurations;

describe('PhaseController', async () => {
    let lukeToken = null;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('/phase', async () => {
        it('#GET phases from Format 5 (as organizer)', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatFive.id + '/phase')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.count).equals(1);

                    const phase = res.body.entities[0];
                    expect(phase).to.have.keys(PhaseResponse.attrs);
                    expect(phase.status).equals(PhaseStatus.PAST);
                    expect(phase.visible).equals(true);
                    expect(phase.activityCount).equals(3);
                    expect(phase.duration).equals(165);
                    expect(phase.endDate).equals('1973-10-31T07:45:00.000Z');

                    // Phases should be order on name asc name by default
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });

        it('#GET Retrieve all the phases and the count (as organizer)', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.count).equals(4);

                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(PhaseResponse.attrs);
                        expect(entity.id).to.be.oneOf([
                            phaseSeed.PhaseTwo.id,
                            phaseSeed.PhaseOne.id,
                            phaseSeed.PhaseThree.id,
                            phaseSeed.PhaseSeven.id
                        ]);
                    });
                });
        });

        it('#GET Retrieve all the phases and the count (as participant)', async () => {
            request(server.application)
                .get('/format/' + formatSeed.FormatFour.id + '/phase')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.count).equals(1); // two phases in format 4 but only one is visible for member luke

                    const phaseEight = res.body.entities[0];

                    expect(phaseEight).to.have.keys(PhaseResponse.attrs);
                    expect(phaseEight.id).equals(phaseSeed.PhaseEight.id);
                    expect(phaseEight.visible).equals(true);
                });
        });

        it('#GET Retrieve all the phases and the count with selected name', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase?select=name')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities[0]).to.have.keys('id', 'name');
                });
        });

        it('#GET Retrieve all the phases and the count with selected status', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/?select=status')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities[0]).to.have.keys('id', 'status');
                    expect(res.body.entities[0].status).equals(PhaseStatus.PAST);
                });
        });

        it('#GET Retrieve all the phases and the count with selected activityCount', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/?select=activityCount')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities[0]).to.have.keys('id', 'activityCount');
                });
        });

        it('#GET Retrieve all the phases and the count with selected status dynamic field', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/?select=status')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities[0]).to.have.keys('id', 'status');
                });
        });

        it('#GET Retrieve all the phases and the count with selected endDate', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/?select=endDate')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities[0]).to.have.keys('id', 'endDate');
                });
        });

        it('#GET Retrieve all the phases and the count, ordered by name descending', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase?order[name]=desc')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    // @ts-ignore
                    expect(res.body.entities).to.be.descendingBy('name');
                });
        });

        it('#POST Returns the created object', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatOne.id + '/phase/')
                .set('Authorization', lukeToken)
                .send({
                    durationUnit: 'minutes'
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(PhaseResponse.attrs);

                    expect(res.body.durationUnit).equals(PhaseDurationUnit.MINUTES);
                    expect(res.body.activityCount).equals(0);
                });
        });

        it('#POST Returns the created object with same name as following test', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatOne.id + '/phase/')
                .set('Authorization', lukeToken)
                .send({
                    name: 'sameName',
                    durationUnit: 'days'
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(PhaseResponse.attrs);

                    expect(res.body.name).equal('sameName');
                    expect(res.body.durationUnit).equals(PhaseDurationUnit.DAYS);
                });
        });

        it('#POST Returns the created object with the same name as previous test', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatOne.id + '/phase/')
                .set('Authorization', lukeToken)
                .send({
                    name: 'sameName',
                    durationUnit: 'days'
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(PhaseResponse.attrs);

                    expect(res.body.name).equal('sameName');
                });
        });

        it('#POST create phase fails because user is no organizer of format', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatThree.id + '/phase')
                .set('Authorization', lukeToken)
                .send({
                    name: 'Phase created !Organizer',
                    durationUnit: 'minutes'
                })
                .expect(403);
        });

        it('#POST Creates phase in the future (status is planned) - unit is minute', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatOne.id + '/phase/')
                .set('Authorization', lukeToken)
                .send({
                    durationUnit: 'minutes',
                    startDate: moment.utc().add(60, 'minutes')
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(PhaseResponse.attrs);
                    expect(res.body.status).equal('planned');
                });
        });

        it('#POST Creates phase in the past (status is past) - unit is minute', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatOne.id + '/phase/')
                .set('Authorization', lukeToken)
                .send({
                    durationUnit: 'minutes',
                    startDate: moment.utc('1915-12-25')
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(PhaseResponse.attrs);
                    expect(res.body.status).equal('past');
                });
        });

        it('#POST Creates phase without startDate (status is unplanned)', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatOne.id + '/phase/')
                .set('Authorization', lukeToken)
                .send({
                    durationUnit: 'minutes'
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(PhaseResponse.attrs);
                    expect(res.body.status).equal('unplanned');
                });
        });

        it('#POST Creates phase in the past (status is past) - unit is day', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatOne.id + '/phase/')
                .set('Authorization', lukeToken)
                .send({
                    durationUnit: 'days',
                    startDate: moment.utc('1915-12-25')
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(PhaseResponse.attrs);
                    expect(res.body.status).equal('past');
                });
        });

        it('#POST Creates phase in the future (status is planned) - unit is day', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatOne.id + '/phase/')
                .set('Authorization', lukeToken)
                .send({
                    durationUnit: 'days',
                    startDate: moment.utc().add(1, 'days')
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(PhaseResponse.attrs);
                    expect(res.body.status).equal('planned');
                });
        });

        it('#POST fails durationUnit not correct', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatOne.id + '/phase/')
                .set('Authorization', lukeToken)
                .send({
                    durationUnit: 'lightyears'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#POST fails because durationUnit is missing', async () => {
            await request(server.application)
                .post(`/format/${formatSeed.FormatOne.id}/phase`)
                .set('Authorization', lukeToken)
                .send({})
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#POST fails because id is in the body', async () => {
            await request(server.application)
                .post(`/format/${formatSeed.FormatOne.id}/phase`)
                .set('Authorization', lukeToken)
                .send({
                    id: 'some id'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#POST fails because startDate is not in ISO format', async () => {
            await request(server.application)
                .post(`/format/${formatSeed.FormatOne.id}/phase`)
                .set('Authorization', lukeToken)
                .send({
                    startDate: '24.03.2089'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });
    });

    describe('/phase/:id', async () => {
        const phase = phaseSeed.PhaseOne;

        it('#GET Retrieve created phase before in this suite', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phase.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(PhaseResponse.attrs);
                    expect(res.body.name).equal(phase.name);
                    expect(res.body.durationUnit).equal(phase.durationUnit);
                });
        });

        it('#GET check duration on specific phase two', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseTwo.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.duration).equal(120);
                });
        });

        it('#GET check endDate on specific phase two', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseTwo.id)
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    const expectedEndDate = moment
                        .utc(phaseSeed.PhaseTwo.startDate)
                        .add(120, phaseSeed.PhaseTwo.durationUnit)
                        .format();

                    expect(moment.utc(res.body.endDate).format()).equal(expectedEndDate);
                });
        });

        it('#GET check endDate on specific phase six (unit days)', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatTwo.id + '/phase/' + phaseSeed.PhaseSix.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    const expectedEndDate = moment
                        .utc(phaseSeed.PhaseSix.startDate)
                        .add(2880, 'minutes') //Activity 5
                        .format();

                    expect(moment.utc(res.body.endDate).format()).equal(expectedEndDate);
                });
        });

        it('#GET check endDate on specific phase two with select', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseTwo.id + '?select=endDate')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    const expectedEndDate = moment
                        .utc(phaseSeed.PhaseTwo.startDate)
                        .add(120, phaseSeed.PhaseTwo.durationUnit)
                        .format();

                    expect(moment.utc(res.body.endDate).format()).equal(expectedEndDate);
                });
        });

        it('#GET phase fails because user is not a member of that format', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatThree.id + '/phase/' + phaseSeed.PhaseFive.id)
                .set('Authorization', lukeToken)
                .expect(403);
        });

        it('#GET Retrieve specific phase select on name', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phase.id + '?select=name')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'name']);
                    expect(res.body.name).equal(phase.name);
                });
        });

        it('#GET Retrieve specific phase select on startDate', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + phase.id + '?select=startDate')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'startDate']);
                    expect(new Date(res.body.startDate).getTime()).equal(new Date(phase.startDate).getTime());
                });
        });

        it('#GET returns 404 because phaseId not existing', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/phase/' + 'not existingId')
                .set('Authorization', lukeToken)
                .expect(404);
        });

        it('#PATCH phase fails because user is no organizer', async () => {
            await request(server.application)
                .patch('/format/' + formatSeed.FormatFour.id + '/phase/' + phaseSeed.PhaseEight.id)
                .set('Authorization', lukeToken)
                .send({
                    name: 'changedName'
                })
                .expect(403);
        });

        it('#PATCH specific phase fails because the date is not in ISO', async () => {
            await request(server.application)
                .patch('/format/' + formatSeed.FormatOne.id + '/phase/' + phase.id)
                .set('Authorization', lukeToken)
                .send({
                    name: 'newPhaseName',
                    startDate: '2019-03-13'
                })
                .expect(422)
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                });
        });

        it('#PATCH durationUnit successful (phase has no activities)', async () => {
            await request(server.application)
                .patch('/format/' + formatSeed.FormatOne.id + '/phase/' + phase.id)
                .set('Authorization', lukeToken)
                .send({
                    durationUnit: 'minutes'
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.durationUnit).equal('minutes');
                });
        });

        it('#PATCH durationUnit fails (phase contains activities)', async () => {
            await request(server.application)
                .patch('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseThree.id)
                .set('Authorization', lukeToken)
                .send({
                    durationUnit: 'days'
                })
                .expect(422)
                .expect((res) => {
                    expect(res.body).to.have.key('error');
                });
        });

        it('#PATCH specific phase fails because the id is in the body', async () => {
            await request(server.application)
                .patch('/format/' + formatSeed.FormatOne.id + '/phase/' + phase.id)
                .set('Authorization', lukeToken)
                .send({
                    id: 'someId'
                })
                .expect(422)
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                });
        });

        it('#PATCH specific phase', async () => {
            await request(server.application)
                .patch('/format/' + formatSeed.FormatOne.id + '/phase/' + phase.id)
                .set('Authorization', lukeToken)
                .send({
                    name: 'newPhaseName',
                    startDate: moment.utc('2019-03-13')
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(PhaseResponse.attrs);
                    expect(res.body.name).equal('newPhaseName');
                    expect(res.body.startDate).equal('2019-03-13T00:00:00.000Z');
                    expect(res.body.status).equal('past');
                });
        });

        it('#PATCH specific phase startDate check new status is active', async () => {
            await request(server.application)
                .patch('/format/' + formatSeed.FormatOne.id + '/phase/' + phaseSeed.PhaseTwo.id)
                .set('Authorization', lukeToken)
                .send({
                    name: 'newPhaseName',
                    startDate: moment.utc().subtract(10, 'minutes')
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(PhaseResponse.attrs);
                    expect(res.body.status).equal('active');
                });
        });

        it('#PATCH specific phase startDate check new status is active with unit days', async () => {
            await request(server.application)
                .patch('/format/' + formatSeed.FormatTwo.id + '/phase/' + phaseSeed.PhaseSix.id)
                .set('Authorization', lukeToken)
                .send({
                    name: 'newPhaseName',
                    startDate: moment.utc().subtract(10, 'minutes')
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(PhaseResponse.attrs);
                    expect(res.body.status).equal('active');
                });
        });

        it('#PATCH specific phase; set startDate to null', async () => {
            await request(server.application)
                .patch('/format/' + formatSeed.FormatOne.id + '/phase/' + phase.id)
                .set('Authorization', lukeToken)
                .send({
                    startDate: null
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(PhaseResponse.attrs);
                    expect(res.body.startDate).equal(null);
                });
        });

        it('#PATCH specific phase set visibility to false', async () => {
            request(server.application)
                .patch('/format/' + formatSeed.FormatOne.id + '/phase/' + phase.id)
                .set('Authorization', lukeToken)
                .send({
                    visible: false
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.visible).equal(false);
                });
        });

        it('#PATCH phase visibility fails because user is not an organizer', async () => {
            request(server.application)
                .patch('/format/' + formatSeed.FormatFour.id + '/phase/' + phaseSeed.PhaseEight.id)
                .set('Authorization', lukeToken)
                .send({
                    visible: 'false'
                })
                .expect(403);
        });

        it('#DELETE fails because user is not an organizer', async () => {
            await request(server.application)
                .delete('/format/' + formatSeed.FormatFour.id + '/phase/' + phaseSeed.PhaseEight.id)
                .set('Authorization', lukeToken)
                .expect(403);
        });
    });

    describe('/format/:id/phase/_template', async () => {
        it('#POST fails user not member of the library ', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatOne.id + '/phase/_template')
                .set('Authorization', lukeToken)
                .send({
                    // Luke is not member of library 3 where phase template 6 belongs to
                    phaseTemplateId: phaseTemplateSeed.phaseTemplate6.id
                })
                .expect(403);
        });

        it('#POST fails user not format organizer ', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatThree.id + '/phase/_template')
                .set('Authorization', lukeToken)
                .send({
                    // Luke is not organizer of format 3
                    phaseTemplateId: phaseTemplateSeed.phaseTemplate6.id
                })
                .expect(403);
        });

        it('#POST fails phaseTemplateId ', async () => {
            await request(server.application)
                .post('/format/' + formatSeed.FormatOne.id + '/phase/_template')
                .set('Authorization', lukeToken)
                .send({})
                .expect(422);
        });

        describe('#SUCCESFULL /format/:id/phase/_template', async () => {
            let createdPhase = null;

            it('#POST create a new phase from a phase template', async () => {
                const phaseTemplate5 = phaseTemplateSeed.phaseTemplate5;

                await request(server.application)
                    .get('/format/' + formatSeed.FormatFive.id + '/phase')
                    .set('Authorization', lukeToken)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.count).equals(1);
                        expect(res.body.entities.length).equals(1);
                    });

                await request(server.application)
                    .post('/format/' + formatSeed.FormatFive.id + '/phase/_template')
                    .set('Authorization', lukeToken)
                    .send({
                        phaseTemplateId: phaseTemplate5.id
                    })
                    .expect(201)
                    .expect((res) => {
                        expect(res.body).to.have.keys(PhaseResponse.attrs);
                        createdPhase = res.body;
                    });

                await request(server.application)
                    .get('/format/' + formatSeed.FormatFive.id + '/phase/' + createdPhase.id)
                    .set('Authorization', lukeToken)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.name).equals(phaseTemplate5.name);
                        expect(res.body.durationUnit).equals(phaseTemplate5.durationUnit);
                    });

                await request(server.application)
                    .get('/format/' + formatSeed.FormatFive.id + '/phase')
                    .set('Authorization', lukeToken)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.count).equals(2);
                        expect(res.body.entities.length).equals(2);
                    });
            });

            it('#GET the activities and check if the steps have also been created', async () => {
                const activityResponse = await request(server.application)
                    .get('/format/' + formatSeed.FormatFive.id + '/phase/' + createdPhase.id + '/activity')
                    .set('Authorization', lukeToken);

                for (const activity of activityResponse.body.entities) {
                    expect(activity.name).to.be.oneOf([
                        activityTemplateSeed.ActivityTemplate7.name,
                        activityTemplateSeed.ActivityTemplate8.name
                    ]);
                    if (activity.name === activityTemplateSeed.ActivityTemplate7.name) {
                        expect(activity.position).equal(activityTemplateSeed.ActivityTemplate7.position);
                        expect(activity.configuration.submissionModifySetting).equal(
                            activityConfigurationSeed.ActivityConfigurationThirtyThree.submissionModifySetting
                        );
                        expect(activity.configuration.submissionViewSetting).equal(
                            activityConfigurationSeed.ActivityConfigurationThirtyThree.submissionViewSetting
                        );
                    }
                    if (activity.name === activityTemplateSeed.ActivityTemplate8.name) {
                        expect(activity.position).equal(activityTemplateSeed.ActivityTemplate8.position);
                        expect(activity.configuration.submissionModifySetting).equal(
                            activityConfigurationSeed.ActivityConfigurationThirtyFour.submissionModifySetting
                        );
                        expect(activity.configuration.submissionViewSetting).equal(
                            activityConfigurationSeed.ActivityConfigurationThirtyFour.submissionViewSetting
                        );
                    }

                    // Check the steps have been created
                    const stepResponse = await request(server.application)
                        .get('/format/' + formatSeed.FormatFive.id + '/phase/' + createdPhase.id + '/activity/' + activity.id + '/step')
                        .set('Authorization', lukeToken);

                    for (const step of stepResponse.body.entities) {
                        expect(step.description).to.be.oneOf([
                            stepTemplateSeed.StepTemplate6.description,
                            stepTemplateSeed.StepTemplate7.description
                        ]);
                    }
                }
            });
        });
    });
});
