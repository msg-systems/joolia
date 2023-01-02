import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { describe } from 'mocha';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import * as request from 'supertest';
import { SubmissionResponse } from '../../src/api/responses';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const activitySeed = seeds.activities;
const phaseSeed = seeds.phases;
const formatSeed = seeds.formats;
const teamSeed = seeds.teams;
const userSeed = seeds.users;
const userSubmissionSeed = seeds.userSubmissions;
const teamSubmissionSeed = seeds.teamSubmissions;

describe('SubmissionController', async () => {
    let lukeToken = null;
    let mickeyToken = null;
    let postResponseOne = null;
    let postResponseTwo = null;
    const postNameOne = 'TeamSubmission Post';
    const postNameTwo = 'UserSubmission Post';

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
        mickeyToken = await getSignedIn(server, userSeed.Mickey);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('POST /format/formatId/activity/activityId/submission', async () => {
        it('POST Responds with the created teamSubmission', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .send({
                    name: postNameOne,
                    description: "<b>Desc</b> for<script>alert('Owned')</script> a submission",
                    submittedById: teamSeed.Team1.id // TeamSubmission
                })
                .expect(201)
                .expect((res) => {
                    postResponseOne = res.body;
                    expect(res.body).to.have.keys(SubmissionResponse.required);
                    expect(res.body.createdBy.id).equals(userSeed.Luke.id);
                    expect(res.body.description).equals('<b>Desc</b> for a submission');
                    expect(res.body.name).equals(postNameOne);
                    expect(res.body.submittedBy.team.id).equals(teamSeed.Team1.id);
                });
        });

        it('POST fails because submitter not part of team', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .send({
                    name: postNameOne,
                    description: "<b>Desc</b> for<script>alert('Owned')</script> a submission",
                    submittedById: teamSeed.Team4.id
                })
                .expect(400);
        });

        it('POST create teamSubmission fails cause team is not in format', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySixteen.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .send({
                    name: 'Submission Post',
                    description: 'Desc for a submission',
                    submittedById: teamSeed.Team3.id // TeamSubmission of format 3
                })
                .expect(400);
        });

        it('POST create teamSubmission fails cause submittedById is a userId', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .send({
                    name: 'Submission Post',
                    description: 'Desc for a submission',
                    submittedById: userSeed.Luke.id
                })
                .expect(400);
        });

        it('POST Responds with the created userSubmission', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityThree.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .send({
                    name: postNameTwo,
                    description: 'Desc for a submission',
                    submittedById: userSeed.Luke.id // UserSubmission
                })
                .expect(201)
                .expect((res) => {
                    postResponseTwo = res.body;
                    expect(res.body).to.have.keys(SubmissionResponse.required);
                    expect(res.body.createdBy.id).equals(userSeed.Luke.id);
                    expect(res.body.description).equals('Desc for a submission');
                    expect(res.body.name).equals(postNameTwo);
                    expect(res.body.submittedBy.user.id).equals(userSeed.Luke.id);
                    expect(res.body.commentCount).equals(0);
                    expect(res.body.fileCount).equals(0);
                });
        });

        it('POST Should fail because participant posting as another member', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityThree.id +
                        '/submission'
                )
                .set('Authorization', mickeyToken)
                .send({
                    name: postNameTwo,
                    description: 'Desc for a submission',
                    submittedById: userSeed.Luke.id // UserSubmission
                })
                .expect(403);
        });

        it('POST Responds should fail, cause commentCount is in body', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityThree.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .send({
                    name: postNameTwo,
                    description: 'Desc for a submission',
                    submittedById: userSeed.Luke.id, // UserSubmission
                    commentCount: 3
                })
                .expect(422);
        });

        it('POST create userSubmission fails because submittedById is no user of format', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityThree.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .send({
                    name: 'UserSubmission Post',
                    description: 'Desc for a submission',
                    submittedById: userSeed.Leia.id
                })
                .expect(403);
        });

        it('POST create userSubmission fails because submittedById is a teamId', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityThree.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .send({
                    name: 'UserSubmission Post',
                    description: 'Desc for a submission',
                    submittedById: teamSeed.Team3.id
                })
                .expect(400);
        });

        it('POST created submission fails because submittedId is missing', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .send({
                    name: 'Submission Post',
                    description: 'Desc for a submission'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('POST created submission fails because name is missing', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .send({
                    description: 'Desc for a submission',
                    submittedById: userSeed.Leia.id
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('POST created submission fails because description is missing', async () => {
            await request(server.application)
                .post(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .send({
                    name: 'Name for a submission',
                    submittedById: userSeed.Leia.id
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });
    });

    describe('GET /format/formatId/activity/activityId/submission', async () => {
        it('GET all submissions of activity because luke is organizer', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(3);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.name).to.be.oneOf([
                            postNameOne,
                            teamSubmissionSeed.TeamSubmissionOne.name,
                            teamSubmissionSeed.TeamSubmissionSix.name
                        ]);
                    });
                    // Submissions should be order on name asc name by default
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });

        it('GET all submissions of activity because luke is organizer and take one', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission?take=1'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities).to.be.lengthOf(1);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.name).to.be.oneOf([
                            postNameOne,
                            teamSubmissionSeed.TeamSubmissionOne.name,
                            teamSubmissionSeed.TeamSubmissionSix.name
                        ]);
                    });
                });
        });

        it('GET all submissions of activity because luke is organizer and take 2 and skip first', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission?skip=1&take=3'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities).to.be.lengthOf(2);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.name).to.be.oneOf([
                            postNameOne,
                            teamSubmissionSeed.TeamSubmissionOne.name,
                            teamSubmissionSeed.TeamSubmissionSix.name
                        ]);
                    });
                });
        });

        it('GET all submissions of activity because luke is organizer and select name', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission?select[]=name'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .to.have.keys(['count', 'entities']);

                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(['id', 'name']);
                        expect(entity.name).to.be.oneOf([
                            postNameOne,
                            teamSubmissionSeed.TeamSubmissionOne.name,
                            teamSubmissionSeed.TeamSubmissionSix.name
                        ]);
                    });
                });
        });

        it('GET all submissions of activity because luke is organizer and select commentCount, averageRating and fileCount', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission?select[]=commentCount&select[]=averageRating&select[]=fileCount'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .to.have.keys(['count', 'entities']);

                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(['id', 'commentCount', 'averageRating', 'fileCount']);
                        expect(entity.id).to.be.oneOf([
                            postResponseOne.id,
                            teamSubmissionSeed.TeamSubmissionOne.id,
                            teamSubmissionSeed.TeamSubmissionSix.id
                        ]);
                    });
                    expect(res.body.entities.find((e) => e.id === postResponseOne.id).commentCount).equals(0);
                    expect(res.body.entities.find((e) => e.id === teamSubmissionSeed.TeamSubmissionOne.id).commentCount).equals(0);
                    expect(res.body.entities.find((e) => e.id === teamSubmissionSeed.TeamSubmissionOne.id).fileCount).equals(1);
                    expect(res.body.entities.find((e) => e.id === teamSubmissionSeed.TeamSubmissionSix.id).commentCount).equals(1);
                    expect(res.body.entities.find((e) => e.id === teamSubmissionSeed.TeamSubmissionSix.id).averageRating).equals(1.5);
                    expect(res.body.entities.find((e) => e.id === teamSubmissionSeed.TeamSubmissionSix.id).fileCount).equals(0);
                });
        });

        it('GET all user submissions of activity because luke is organizer and select name', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseTwo.id +
                        '/activity/' +
                        activitySeed.ActivityTwo.id +
                        '/submission?select[]=name&select[]=submittedBy'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .to.have.keys(['count', 'entities']);

                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(['id', 'name', 'submittedBy']);
                        expect(entity.name).to.be.oneOf([
                            userSubmissionSeed.UserSubmissionOne.name,
                            userSubmissionSeed.UserSubmissionFour.name
                        ]);
                    });
                });
        });

        it('GET all submissions of an activity where luke is team member and activity view permission is submitter', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySixteen.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .to.have.keys(['count', 'entities']);

                    expect(res.body.count).equal(1);
                    expect(res.body.entities[0]).to.have.keys(SubmissionResponse.attrs);
                    expect(res.body.entities[0].id).equals(teamSubmissionSeed.TeamSubmissionTwo.id);
                    expect(res.body.entities[0].name).equals(teamSubmissionSeed.TeamSubmissionTwo.name);
                    expect(res.body.entities[0].description).equals(teamSubmissionSeed.TeamSubmissionTwo.description);
                    expect(res.body.entities[0].submittedBy.team.id).equals(teamSeed.Team5.id);
                });
        });

        it('GET all submissions of an activity where luke is team member and activity view permission is submitter and select name', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySixteen.id +
                        '/submission?select[]=name'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(1);
                    expect(res.body.entities[0]).to.have.keys(['id', 'name']);
                    expect(res.body.entities[0].id).equals(teamSubmissionSeed.TeamSubmissionTwo.id);
                    expect(res.body.entities[0].name).equals(teamSubmissionSeed.TeamSubmissionTwo.name);
                });
        });

        it('GET all submissions of activity where luke is format member and activity view permission is member', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySeventeen.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(2);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).to.be.oneOf([
                            teamSubmissionSeed.TeamSubmissionThree.id,
                            teamSubmissionSeed.TeamSubmissionFive.id
                        ]);
                        expect(entity.name).to.be.oneOf([
                            teamSubmissionSeed.TeamSubmissionThree.name,
                            teamSubmissionSeed.TeamSubmissionFive.name
                        ]);
                        expect(entity.description).to.be.oneOf([
                            teamSubmissionSeed.TeamSubmissionThree.description,
                            teamSubmissionSeed.TeamSubmissionFive.description
                        ]);
                        expect(entity.submittedBy.team.id).to.be.oneOf([teamSeed.Team6.id, teamSeed.Team5.id]);
                    });
                });
        });

        it('GET all  submissions of activity is empty, because luke is format member, but activty view permission is submitter', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivityTwenty.id +
                        '/submission'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(0);
                });
        });

        it('GET all submissions of an activity where luke is submitter and select submittedBy', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivityEighteen.id +
                        '/submission?select[]=submittedBy'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(1);
                    const submission = res.body.entities[0];
                    expect(submission.id).equal(userSubmissionSeed.UserSubmissionTwo.id);
                    expect(submission.submittedBy.user.id).equal(userSeed.Luke.id);
                });
        });
    });

    describe('PATCH /format/formatId/activity/activityId/submission/submissionId', async () => {
        it('PATCH teamSubmission One because luke is organizer', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission/' +
                        teamSubmissionSeed.TeamSubmissionOne.id
                )
                .set('Authorization', lukeToken)
                .send({
                    name: 'Updated teamSubmissionOne name'
                })
                .expect((res) => {
                    expect(res.body.name).equal('Updated teamSubmissionOne name');
                })
                .expect(200);
        });

        it('PATCH teamSubmission One should fail because commentCount is not allowed', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission/' +
                        teamSubmissionSeed.TeamSubmissionOne.id
                )
                .set('Authorization', lukeToken)
                .send({
                    commentCount: 3,
                    name: 'Updated teamSubmissionOne name'
                })
                .expect(422);
        });

        it('PATCH userSubmission One because luke is organizer', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseTwo.id +
                        '/activity/' +
                        activitySeed.ActivityTwo.id +
                        '/submission/' +
                        userSubmissionSeed.UserSubmissionFour.id
                )
                .set('Authorization', lukeToken)
                .send({
                    name: 'Updated userSubmissionOne name'
                })
                .expect((res) => {
                    expect(res.body.name).equal('Updated userSubmissionOne name');
                })
                .expect(200);
        });

        it('PATCH userSubmission two because luke is submitter', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivityEighteen.id +
                        '/submission/' +
                        userSubmissionSeed.UserSubmissionTwo.id
                )
                .set('Authorization', lukeToken)
                .send({
                    name: 'Updated userSubmissionTwo name'
                })
                .expect((res) => {
                    expect(res.body.name).equal('Updated userSubmissionTwo name');
                })
                .expect(200);
        });

        it('PATCH teamSubmission two because luke is teammember', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySixteen.id +
                        '/submission/' +
                        teamSubmissionSeed.TeamSubmissionTwo.id
                )
                .set('Authorization', lukeToken)
                .send({
                    description: "Updated <i>description</i><script>alert('Owned')</script>"
                })
                .expect((res) => {
                    expect(res.body.description).equal('Updated <i>description</i>');
                })
                .expect(200);
        });

        it('PATCH teamSubmission two fails because submittedId is in postbody', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySixteen.id +
                        '/submission/' +
                        teamSubmissionSeed.TeamSubmissionTwo.id
                )
                .set('Authorization', lukeToken)
                .send({
                    name: 'Updated teamSubmissionTwo name',
                    submittedBy: '1234'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('PATCH teamSubmission two fails because id is in postbody', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySixteen.id +
                        '/submission/' +
                        teamSubmissionSeed.TeamSubmissionTwo.id
                )
                .set('Authorization', lukeToken)
                .send({
                    description: 'Updated teamSubmissionTwo name',
                    id: '00001'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('PATCH teamSubmission fails because luke is no teammember', async () => {
            await request(server.application)
                .patch(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySeventeen.id +
                        '/submission/' +
                        teamSubmissionSeed.TeamSubmissionThree.id
                )
                .set('Authorization', lukeToken)
                .send({
                    description: 'Updated teamSubmissionTwo desc'
                })
                .expect(403);
        });
    });

    describe('GET /format/formatId/activity/activityId/submission/submissionId', async () => {
        it('GET teamSubmission because luke is organizer', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission/' +
                        teamSubmissionSeed.TeamSubmissionOne.id
                )
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body).to.have.keys(SubmissionResponse.attrs);
                    expect(res.body.id).equals(teamSubmissionSeed.TeamSubmissionOne.id);
                    expect(res.body.description).equals(teamSubmissionSeed.TeamSubmissionOne.description);
                    expect(res.body.submittedBy.team.id).equals(teamSeed.Team4.id);
                    expect(res.body.commentCount).equals(0);
                })
                .expect(200);
        });

        it('GET teamSubmission6 with commentCount 1 and averageRating 1.5', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission/' +
                        teamSubmissionSeed.TeamSubmissionSix.id
                )
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body).to.have.keys(SubmissionResponse.attrs);
                    expect(res.body.id).equals(teamSubmissionSeed.TeamSubmissionSix.id);
                    expect(res.body.description).equals(teamSubmissionSeed.TeamSubmissionSix.description);
                    expect(res.body.submittedBy.team.id).equals(teamSeed.Team2.id);
                    expect(res.body.commentCount).equals(1);
                    expect(res.body.averageRating).equals(1.5);
                    expect(res.body.fileCount).equals(0);
                })
                .expect(200);
        });

        it('GET teamSubmission because luke is team member', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySixteen.id +
                        '/submission/' +
                        teamSubmissionSeed.TeamSubmissionTwo.id
                )
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body).to.have.keys(SubmissionResponse.attrs);
                    expect(res.body.id).equals(teamSubmissionSeed.TeamSubmissionTwo.id);
                    expect(res.body.name).equals(teamSubmissionSeed.TeamSubmissionTwo.name);
                    expect(res.body.submittedBy.team.id).equals(teamSeed.Team5.id);
                })
                .expect(200);
        });

        it('GET teamSubmission because luke is format member and submission view permission is member', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySeventeen.id +
                        '/submission/' +
                        teamSubmissionSeed.TeamSubmissionThree.id
                )
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body).to.have.keys(SubmissionResponse.attrs);
                    expect(res.body.id).equals(teamSubmissionSeed.TeamSubmissionThree.id);
                    expect(res.body.name).equals(teamSubmissionSeed.TeamSubmissionThree.name);
                    expect(res.body.description).equals(teamSubmissionSeed.TeamSubmissionThree.description);
                    expect(res.body.submittedBy.team.id).equals(teamSeed.Team6.id);
                })
                .expect(200);
        });

        it('GET teamSubmission fails because luke no team member and submission view permission is submitter', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySixteen.id +
                        '/submission/' +
                        teamSubmissionSeed.TeamSubmissionFour.id
                )
                .set('Authorization', lukeToken)
                .expect(403);
        });

        it('GET User Submission fails because luke is not a format member', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatThree.id +
                        '/phase/' +
                        phaseSeed.PhaseFive.id +
                        '/activity/' +
                        activitySeed.ActivityNineteen.id +
                        '/submission/' +
                        userSubmissionSeed.UserSubmissionFive.id
                )
                .set('Authorization', lukeToken)
                .expect(403);
        });

        it('GET userSubmission where luke is submitter and submission view permission is submitter', async () => {
            await request(server.application)
                .get(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivityEighteen.id +
                        '/submission/' +
                        userSubmissionSeed.UserSubmissionTwo.id
                )
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body).to.have.keys(SubmissionResponse.attrs);
                    expect(res.body.id).equals(userSubmissionSeed.UserSubmissionTwo.id);
                    expect(res.body.description).equals(userSubmissionSeed.UserSubmissionTwo.description);
                    expect(res.body.submittedBy.user.id).equals(userSeed.Luke.id);
                })
                .expect(200);
        });
    });

    describe('GET /format/submission', async () => {
        it('GET submissions of format one', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/submission/')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(6);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).to.be.oneOf([
                            teamSubmissionSeed.TeamSubmissionOne.id,
                            teamSubmissionSeed.TeamSubmissionSix.id,
                            userSubmissionSeed.UserSubmissionOne.id,
                            userSubmissionSeed.UserSubmissionFour.id,
                            postResponseOne.id,
                            postResponseTwo.id
                        ]);
                    });
                });
        });

        it('GET submission submitted by user', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/submission?filter.submittedBy=${userSeed.Luke.name}`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.length).greaterThan(0);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).equal(postResponseTwo.id);
                    });
                });
        });

        it('GET submissions ordered by submitted by', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/submission?order[submittedBy]=asc`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.length).equal(6);
                    expect(res.body.entities[0].name).equal('UserSubmission Post');
                    expect(res.body.entities[1].id).equal(userSubmissionSeed.UserSubmissionFour.id);
                    expect(res.body.entities[2].id).equal(userSubmissionSeed.UserSubmissionOne.id);
                    expect(res.body.entities[3].name).equal('TeamSubmission Post');
                    expect(res.body.entities[4].id).equal(teamSubmissionSeed.TeamSubmissionSix.id);
                    expect(res.body.entities[5].id).equal(teamSubmissionSeed.TeamSubmissionOne.id);
                });
        });

        it('GET submission submitted by team', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/submission?filter.submittedBy=${teamSeed.Team4.name}`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.length).greaterThan(0);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).equal(teamSubmissionSeed.TeamSubmissionOne.id);
                    });
                });
        });

        it('GET submission with name', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/submission?filter.name=user`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.length).greaterThan(0);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).to.be.oneOf([
                            userSubmissionSeed.UserSubmissionOne.id,
                            userSubmissionSeed.UserSubmissionFour.id,
                            postResponseOne.id,
                            postResponseTwo.id
                        ]);
                    });
                });
        });

        it('GET submission with one of two names', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/submission?filter.name[]=user&filter.name[]=team`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.length).greaterThan(0);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).to.be.oneOf([
                            teamSubmissionSeed.TeamSubmissionOne.id,
                            teamSubmissionSeed.TeamSubmissionSix.id,
                            userSubmissionSeed.UserSubmissionOne.id,
                            userSubmissionSeed.UserSubmissionFour.id,
                            postResponseOne.id,
                            postResponseTwo.id
                        ]);
                    });
                });
        });

        it('GET submission with activity name', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/submission?filter.activity=duis`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.length).greaterThan(0);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).to.be.oneOf([userSubmissionSeed.UserSubmissionOne.id, userSubmissionSeed.UserSubmissionFour.id]);
                    });
                });
        });

        it('GET submission of phase by phase name', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/submission?filter.phase=Phase b`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.length).greaterThan(0);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).to.be.oneOf([userSubmissionSeed.UserSubmissionOne.id, userSubmissionSeed.UserSubmissionFour.id]);
                    });
                });
        });

        it('GET submission of phase by phase name and submittedBy', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/submission?filter.phase=Phase b&filter.submittedBy=${userSeed.Mickey.name}`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.length).greaterThan(0);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).equal(userSubmissionSeed.UserSubmissionFour.id);
                    });
                });
        });

        it('GET submissions of format one with activity selected', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/submission?select=activity')
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body.count).equal(6);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(['id', 'activity']);
                        expect(entity.id).to.be.oneOf([
                            teamSubmissionSeed.TeamSubmissionOne.id,
                            teamSubmissionSeed.TeamSubmissionSix.id,
                            userSubmissionSeed.UserSubmissionOne.id,
                            userSubmissionSeed.UserSubmissionFour.id,
                            postResponseOne.id,
                            postResponseTwo.id
                        ]);
                    });
                })
                .expect(200);
        });

        it('GET submissions of format one and select name', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/submission?select=name')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(6);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(['id', 'name']);
                        expect(entity.id).to.be.oneOf([
                            teamSubmissionSeed.TeamSubmissionOne.id,
                            teamSubmissionSeed.TeamSubmissionSix.id,
                            userSubmissionSeed.UserSubmissionOne.id,
                            userSubmissionSeed.UserSubmissionFour.id,
                            postResponseOne.id,
                            postResponseTwo.id
                        ]);
                    });
                });
        });

        it('GET submissions of format one and take 3', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/submission?take=3')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(6);
                    expect(res.body.entities).to.be.lengthOf(3);
                });
        });

        it('GET submissions of format one and take 3 and skip 1', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '/submission?take=3&skip=1')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(6);
                    expect(res.body.entities).to.be.lengthOf(3);
                });
        });

        it('GET submissions of format four fails as luke is not an organizer', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatFour.id + '/submission')
                .set('Authorization', lukeToken)
                .expect(403);
        });
    });

    describe('GET /team/submission', async () => {
        it('GET submissions of team5', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatFour.id + '/team/' + teamSeed.Team5.id + '/submission/')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(2);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).to.be.oneOf([teamSubmissionSeed.TeamSubmissionTwo.id, teamSubmissionSeed.TeamSubmissionFive.id]);
                    });
                });
        });

        it('GET team5 submissions by submittedBy', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatFour.id}/team/${teamSeed.Team5.id}/submission?filter.submittedBy=${teamSeed.Team5.name}`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.length).greaterThan(0);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).to.be.oneOf([teamSubmissionSeed.TeamSubmissionTwo.id, teamSubmissionSeed.TeamSubmissionFive.id]);
                    });
                });
        });

        it('GET team5 submissions by name', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatFour.id}/team/${teamSeed.Team5.id}/submission?filter.name=Due`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.length).greaterThan(0);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).to.be.oneOf([teamSubmissionSeed.TeamSubmissionTwo.id]);
                    });
                });
        });

        it('GET team 5 submissions by two names', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatFour.id}/team/${teamSeed.Team5.id}/submission?filter.name[]=Due&filter.name[]=cinque`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.length).greaterThan(0);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).to.be.oneOf([teamSubmissionSeed.TeamSubmissionTwo.id, teamSubmissionSeed.TeamSubmissionFive.id]);
                    });
                });
        });

        it('GET team5 submissions by activity name', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatFour.id}/team/${teamSeed.Team5.id}/submission?filter.activity=17`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.length).greaterThan(0);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).to.be.oneOf([teamSubmissionSeed.TeamSubmissionFive.id]);
                    });
                });
        });

        it('GET team5 submissions filtered by phase name', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatFour.id}/team/${teamSeed.Team5.id}/submission?filter.phase=Phase 8`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.entities.length).greaterThan(0);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(SubmissionResponse.attrs);
                        expect(entity.id).to.be.oneOf([teamSubmissionSeed.TeamSubmissionFive.id, teamSubmissionSeed.TeamSubmissionTwo.id]);
                    });
                });
        });

        it('GET submissions of team5 with activity selected', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatFour.id}/team/${teamSeed.Team5.id}/submission?select=activity`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.status).equal(200);
                    expect(res.body.count).equal(2);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(['id', 'activity']);
                        expect(entity.id).to.be.oneOf([teamSubmissionSeed.TeamSubmissionTwo.id, teamSubmissionSeed.TeamSubmissionFive.id]);
                    });
                });
        });

        it('GET submissions of team5 and select name', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatFour.id}/team/${teamSeed.Team5.id}/submission?select=name`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(2);
                    res.body.entities.forEach((entity) => {
                        expect(entity).to.have.keys(['id', 'name']);
                        expect(entity.id).to.be.oneOf([teamSubmissionSeed.TeamSubmissionTwo.id, teamSubmissionSeed.TeamSubmissionFive.id]);
                    });
                });
        });

        it('GET submissions of team5 and take 3', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatFour.id}/team/${teamSeed.Team5.id}/submission?take=1`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(2);
                    expect(res.body.entities).to.be.lengthOf(1);
                });
        });

        it('GET submissions of team5 and take 3 and skip 1', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatFour.id}/team/${teamSeed.Team5.id}/submission?take=2&skip=1`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equal(2);
                    expect(res.body.entities).to.be.lengthOf(1);
                });
        });
    });

    describe('DELETE /format/formatId/activity/activityId/submission/submissionId', async () => {
        it('DELETE teamSubmission because luke is organizer', async () => {
            await request(server.application)
                .delete(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission/' +
                        teamSubmissionSeed.TeamSubmissionOne.id
                )
                .set('Authorization', lukeToken)
                .expect(204);
        });

        it('DELETE teamSubmission fails cause submission not found!', async () => {
            await request(server.application)
                .delete(
                    '/format/' +
                        formatSeed.FormatOne.id +
                        '/phase/' +
                        phaseSeed.PhaseThree.id +
                        '/activity/' +
                        activitySeed.ActivityOne.id +
                        '/submission/unknownId'
                )
                .set('Authorization', lukeToken)
                .expect(404);
        });

        it('DELETE teamSubmission because luke is member of submitted team', async () => {
            await request(server.application)
                .delete(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySixteen.id +
                        '/submission/' +
                        teamSubmissionSeed.TeamSubmissionTwo.id
                )
                .set('Authorization', lukeToken)
                .expect(204);
        });

        it('DELETE teamSubmission fails because luke is neither team member nor organizer', async () => {
            await request(server.application)
                .delete(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivitySixteen.id +
                        '/submission/' +
                        teamSubmissionSeed.TeamSubmissionFour.id
                )
                .set('Authorization', lukeToken)
                .expect(403);
        });

        it('DELETE userSubmission because luke is submitter', async () => {
            await request(server.application)
                .delete(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivityEighteen.id +
                        '/submission/' +
                        userSubmissionSeed.UserSubmissionTwo.id
                )
                .set('Authorization', lukeToken)
                .expect(204);
        });

        it('DELETE userSubmission because luke is neither submitter nor organizer', async () => {
            await request(server.application)
                .delete(
                    '/format/' +
                        formatSeed.FormatFour.id +
                        '/phase/' +
                        phaseSeed.PhaseEight.id +
                        '/activity/' +
                        activitySeed.ActivityEighteen.id +
                        '/submission/' +
                        userSubmissionSeed.UserSubmissionThree.id
                )
                .set('Authorization', lukeToken)
                .expect(403);
        });
    });

    describe('GET /format/formatId/submission/_filterValues', async () => {
        it('GET filter values for FormatOne', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/submission/_filterValues`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['users', 'teams', 'phases']);
                    expect(res.body.users).to.be.lengthOf(3);
                    expect(res.body.teams).to.be.lengthOf(2);
                    expect(res.body.phases).to.be.lengthOf(2);
                    res.body.users.forEach((userName) => {
                        expect(userName).to.be.oneOf(['Mickey', 'Obi-Wan', 'Luke']);
                    });
                    res.body.teams.forEach((teamName) => {
                        expect(teamName).to.be.oneOf(['Team1', 'Team2']);
                    });
                    res.body.phases.forEach((phaseName) => {
                        expect(phaseName).to.be.oneOf(['Phase c', 'Phase b']);
                    });
                });
        });

        it('GET filter values fails because Mickey is not organizer', async () => {
            await request(server.application)
                .get(`/format/${formatSeed.FormatOne.id}/submission/_filterValues`)
                .set('Authorization', mickeyToken)
                .expect(403);
        });
    });
});
