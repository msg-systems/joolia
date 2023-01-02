import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { describe } from 'mocha';
import * as request from 'supertest';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import { StepResponse } from '../../src/api/responses';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const stepSeed = seeds.steps;
const activitySeed = seeds.activities;
const phaseSeed = seeds.phases;
const teamSeed = seeds.teams;
const formatSeed = seeds.formats;
const userSeed = seeds.users;

describe('StepController', async () => {
    let lukeToken = null;
    const activitySevenSteps = [stepSeed.StepOne, stepSeed.StepTwo, stepSeed.StepThree, stepSeed.StepFour, stepSeed.StepFive];

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('/step', async () => {
        it('#GET Retrieve all the steps and the count from Activity Seven', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(StepResponse.attrs);
                        expect(entity.id).to.be.oneOf(activitySevenSteps.map((a) => a.id));
                    });

                    const stepTwo = res.body.entities.find((step) => step.id === stepSeed.StepTwo.id);
                    expect(stepTwo.checkedBy).to.have.members([teamSeed.Team1.id, teamSeed.Team2.id]);

                    // Steps should be order on position asc name by default
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('position');
                });
        });

        it('#GET Steps with a select on description', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step?select=description'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(['id', 'description']);
                        expect(entity.description).to.be.oneOf(activitySevenSteps.map((a) => a.description));
                    });
                });
        });

        it('#GET Steps with a select on description and position', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step?select[]=description&select[]=position'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(['id', 'description', 'position']);
                        expect(entity.description).to.be.oneOf(activitySevenSteps.map((a) => a.description));
                        expect(entity.position).to.be.oneOf(activitySevenSteps.map((a) => a.position));
                    });
                });
        });

        it('#GET Steps with a order on position', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step?order[position]=asc'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('position');
                });
        });

        it('#GET Steps error not found format', async () => {
            await request(server.application)
                .get(
                    '/format/notFormatId/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step?order=position'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(404);
        });

        it('#GET Activities error not found phase', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/notPhaseId/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step?order=position'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(404);
        });

        it('#GET Steps error not found activity', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/notActivityId/step?order=position'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(404);
        });

        it('#POST create new step of activity', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step'
                )
                .set('Authorization', lukeToken)
                .send({
                    description: 'This is an step description.'
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).to.have.keys(StepResponse.attrs);
                    expect(res.body.description).equal('This is an step description.');
                    expect(res.body.position).equal(5);
                    expect(res.body.checkedBy).to.be.an('array').that.is.empty;
                });
        });

        it('#POST create new step of activity fails because description is not provided', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    done: false
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#POST create new step of activity without done', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step'
                )
                .set('Authorization', lukeToken)
                .expect(201)
                .send({
                    description: 'This is an step description.'
                })
                .expect((res) => {
                    expect(res.body).to.have.keys(StepResponse.attrs);
                    expect(res.body.description).equal('This is an step description.');
                    expect(res.body.position).equal(6);
                    expect(res.body.checkedBy).to.be.an('array').that.is.empty;
                });
        });

        it('#POST create new step of activity fails because position is provided', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    description: 'This is an step description.',
                    position: 7
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#POST create new step of activity fails because user is no organizer', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySixteen.id +
                        '/step'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    description: 'This is an step description.'
                })
                .expect(403);
        });
    });

    describe('/step/:stepOneId', async () => {
        it('#PATCH update description of step ONE of activity', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step/' +
                        stepSeed.StepOne.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    description: 'This is a step one update'
                })
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'description']);
                    expect(res.body.description).equal('This is a step one update');
                })
                .expect(200);
        });

        it('#PATCH update step ONE of activity fails cause id is in body', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step/' +
                        stepSeed.StepOne.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    id: 'abababab-ababababab-abababa',
                    description: 'This is a step one update'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#PATCH update step ONE of activity fails cause position is in body', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step/' +
                        stepSeed.StepOne.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    position: 12,
                    description: 'This is a step one update'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#PATCH update step SIX of activity fails cause user is no organizer', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivityTwentyOne.id +
                        '/step/' +
                        stepSeed.StepSix.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    description: 'Updated desc'
                })
                .expect(403);
        });

        it('#DELETE step SIX of activity fails cause user is no organizer', async () => {
            await request(server.application)
                .delete(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivityTwentyOne.id +
                        '/step/' +
                        stepSeed.StepSix.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(403);
        });

        it('#DELETE step TWO of activity', async () => {
            await request(server.application)
                .delete(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step/' +
                        stepSeed.StepTwo.id
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(204);

            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.find((step) => step.id === stepSeed.StepOne.id).position).equal(0);
                    expect(res.body.entities.find((step) => step.id === stepSeed.StepThree.id).position).equal(1);
                    expect(res.body.entities.find((step) => step.id === stepSeed.StepFour.id).position).equal(2);
                    expect(res.body.entities.find((step) => step.id === stepSeed.StepFive.id).position).equal(3);
                });
        });
    });

    describe('/step/:stepOneId/_check', async () => {
        it('#POST step one as done by team 1', async () => {
            const body = {
                done: true,
                checkedById: teamSeed.Team1.id
            };

            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step/' +
                        stepSeed.StepOne.id +
                        '/_check'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send(body)
                .expect(201)
                .expect((res) => {
                    expect(res.body).contain(body);
                });

            // Check if the relation was added
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    const stepOne = res.body.entities.find((entity) => entity.id === stepSeed.StepOne.id);
                    expect(stepOne.checkedBy[0]).equal(teamSeed.Team1.id);
                });
        });

        it('#POST step one as undone by team 1', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step/' +
                        stepSeed.StepOne.id +
                        '/_check'
                )
                .set('Authorization', lukeToken)
                .send({
                    done: false,
                    checkedById: teamSeed.Team1.id
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body.done).equal(false);
                    expect(res.body.checkedById).equal(teamSeed.Team1.id);
                });

            // Check if the relation was added
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivitySeven.id +
                        '/step'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    const stepOne = res.body.entities.find((entity) => entity.id === stepSeed.StepOne.id);
                    expect(stepOne.checkedBy).lengthOf(0);
                });
        });

        it('#POST step six as done by luke member of format four', async () => {
            const body = {
                done: true,
                checkedById: userSeed.Luke.id
            };
            const response = await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivityTwentyOne.id +
                        '/step/' +
                        stepSeed.StepSix.id +
                        '/_check'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send(body);
            expect(response.statusCode).equal(201);
            expect(response.body).contain(body);

            // Check if the relation was added
            const getResponse = await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivityTwentyOne.id +
                        '/step/'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken);
            const stepSix = getResponse.body.entities.find((entity) => entity.id === stepSeed.StepSix.id);
            expect(stepSix.checkedBy[0]).equal(userSeed.Luke.id);
        });

        it('#POST step six as undone by luke member of format four', async () => {
            const body = {
                done: false,
                checkedById: userSeed.Luke.id
            };
            const response = await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivityTwentyOne.id +
                        '/step/' +
                        stepSeed.StepSix.id +
                        '/_check'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send(body);
            expect(response.statusCode).equal(201);
            expect(response.body).contain(body);

            // Check if the relation was deleted
            const getResponse = await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivityTwentyOne.id +
                        '/step/'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken);
            const stepSix = getResponse.body.entities.find((entity) => entity.id === stepSeed.StepSix.id);
            expect(stepSix.checkedBy).lengthOf(0);
        });

        it('#POST fail done not included', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivityTwentyOne.id +
                        '/step/' +
                        stepSeed.StepSix.id +
                        '/_check'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    checkedById: userSeed.Luke.id
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#POST fail checkedById not included', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivityTwentyOne.id +
                        '/step/' +
                        stepSeed.StepSix.id +
                        '/_check'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    done: true
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#POST fail not member of format', async () => {
            const body = {
                done: true,
                checkedById: userSeed.Luke.id
            };
            const response = await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatThree.id +
                        '/phase/' +
                        phaseSeed.PhaseFive.id +
                        '/activity/' +
                        activitySeed.ActivitySeventeen.id +
                        '/step/' +
                        stepSeed.StepNine.id +
                        '/_check'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send(body);
            expect(response.statusCode).equal(403);
        });

        it('#POST fail not member of the team', async () => {
            const body = {
                done: true,
                checkedById: teamSeed.Team7.id
            };
            const response = await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySeventeen.id +
                        '/step/' +
                        stepSeed.StepNine.id +
                        '/_check'
                )
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send(body);
            expect(response.statusCode).equal(403);
        });
    });
});
