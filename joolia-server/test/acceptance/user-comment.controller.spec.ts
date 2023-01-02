import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { describe } from 'mocha';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import * as request from 'supertest';
import { FileEntryResponse, UserCommentResponse } from '../../src/api/responses';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const activitySeed = seeds.activities;
const phaseSeed = seeds.phases;
const formatSeed = seeds.formats;
const commentSeed = seeds.userComments;
const userSeed = seeds.users;
const userSubmissionSeed = seeds.userSubmissions;
const teamSubmissionSeed = seeds.teamSubmissions;

describe('UserCommentController', async () => {
    let lukeToken = null;
    let mickeyToken = null;
    let createdUserSubmissionComment = null;
    let createdTeamSubmissionComment = null;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
        mickeyToken = await getSignedIn(server, { email: 'mickey@disney.com', password: '12345678' });
    });

    after(async () => {
        await clearDatabases();
    });

    it('GET all existing comments submission because luke is organizer', async () => {
        await request(server.application)
            .get(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseTwo.id +
                    '/activity/' +
                    activitySeed.ActivityTwo.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionOne.id +
                    '/comment'
            )
            .set('Authorization', lukeToken)
            .expect(200)
            .expect((res) => {
                expect(res.body.count).equal(2);
                res.body.entities.forEach((entity) => {
                    expect(entity).to.have.keys(UserCommentResponse.attrs);
                    expect(entity.id).to.be.oneOf([commentSeed.CommentOne.id, commentSeed.CommentEight.id]);
                });
            });
    });

    it('POST participant as team member should give comment for this activity', async () => {
        await request(server.application)
            .post(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionSix.id +
                    '/comment'
            )
            .set('Authorization', mickeyToken)
            .send({
                comment: 'This is a comment'
            })
            .expect(201);
    });

    it('POST participant is allowed because is creator of submission', async () => {
        await request(server.application)
            .post(
                '/format/' +
                    formatSeed.FormatFour.id +
                    '/phase/' +
                    phaseSeed.PhaseEight.id +
                    '/activity/' +
                    activitySeed.ActivityEighteen.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionTwo.id +
                    '/comment'
            )
            .set('Authorization', lukeToken)
            .send({
                comment: 'This is a comment'
            })
            .expect(201)
            .expect((res) => {
                expect(res.body)
                    .to.be.an('object')
                    .that.have.keys(UserCommentResponse.attrs);

                expect(res.body.createdBy.avatar).to.have.keys(FileEntryResponse.required);
            });
    });

    it('POST responds with the created comment for user submission', async () => {
        await request(server.application)
            .post(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseTwo.id +
                    '/activity/' +
                    activitySeed.ActivityTwo.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionOne.id +
                    '/comment'
            )
            .set('Authorization', lukeToken)
            .send({
                comment: 'I am a comment that will not last long :/'
            })
            .expect((res) => {
                expect(res.body).to.have.keys(UserCommentResponse.attrs);
                expect(res.body.createdBy.id).equals(userSeed.Luke.id);
                expect(res.body.comment).equals('I am a comment that will not last long :/');
                createdUserSubmissionComment = res.body;
            })
            .expect(201);
    });

    it('POST should fail for empty comments', async () => {
        await request(server.application)
            .post(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseTwo.id +
                    '/activity/' +
                    activitySeed.ActivityTwo.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionOne.id +
                    '/comment'
            )
            .set('Authorization', lukeToken)
            .send({
                comment: ''
            })
            .expect(422);
    });

    it('POST create comment should fail because user is not formatMember', async () => {
        await request(server.application)
            .post(
                '/format/' +
                    formatSeed.FormatThree.id +
                    '/phase/' +
                    phaseSeed.PhaseFive.id +
                    '/activity/' +
                    activitySeed.ActivityNineteen.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionTwo.id +
                    '/comment'
            )
            .set('Authorization', lukeToken)
            .send({
                comment: 'I`m not allowed to do this'
            })
            .expect(403);
    });

    it('POST responds with the created comment for team submission', async () => {
        await request(server.application)
            .post(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionOne.id +
                    '/comment'
            )
            .set('Authorization', lukeToken)
            .send({
                comment: 'It`s working!'
            })
            .expect((res) => {
                expect(res.body).to.have.keys(UserCommentResponse.attrs);
                expect(res.body.comment).equals('It`s working!');
                expect(res.body.createdBy.id).equals(userSeed.Luke.id);
                createdTeamSubmissionComment = res.body;
            })
            .expect(201);
    });

    it('POST created comment fails because comment text is missing', async () => {
        await request(server.application)
            .post(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionOne.id +
                    '/comment'
            )
            .set('Authorization', lukeToken)
            .send({})
            .expect((res) => {
                expect(res.body).to.have.keys(['errors']);
            })
            .expect(422);
    });

    it('GET all comments of submission because luke is organizer', async () => {
        await request(server.application)
            .get(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseTwo.id +
                    '/activity/' +
                    activitySeed.ActivityTwo.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionOne.id +
                    '/comment'
            )
            .set('Authorization', lukeToken)
            .expect((res) => {
                expect(res.body.count).equal(3); // fixtures + the one created before
                res.body.entities.forEach((entity) => {
                    expect(entity).to.have.keys(UserCommentResponse.attrs);
                    expect(entity.id).to.be.oneOf([
                        createdUserSubmissionComment.id,
                        commentSeed.CommentOne.id,
                        commentSeed.CommentEight.id
                    ]);
                });
            })
            .expect(200);
    });

    it('GET unknown comment of submission should fail', async () => {
        await request(server.application)
            .get(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseTwo.id +
                    '/activity/' +
                    activitySeed.ActivityTwo.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionOne.id +
                    '/comment/unknown-id'
            )
            .set('Authorization', lukeToken)
            .expect((res) => {
                expect(res.body).to.have.keys(['error']);
            })
            .expect(404);
    });

    it('PATCH created comment because luke is creator', async () => {
        await request(server.application)
            .patch(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseTwo.id +
                    '/activity/' +
                    activitySeed.ActivityTwo.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionOne.id +
                    '/comment/' +
                    createdUserSubmissionComment.id
            )
            .set('Authorization', lukeToken)
            .send({
                comment: 'Updated comment text'
            })
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(['id', 'comment']);
                expect(res.body.comment).equal('Updated comment text');
            });
    });

    it('PATCH comment should fail because luke is submitter', async () => {
        await request(server.application)
            .patch(
                '/format/' +
                    formatSeed.FormatFour.id +
                    '/phase/' +
                    phaseSeed.PhaseEight.id +
                    '/activity/' +
                    activitySeed.ActivitySeventeen.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionThree.id +
                    '/comment/' +
                    commentSeed.CommentTwo.id // Luke is participant but not in team6 of teamsubmission3
            )
            .set('Authorization', lukeToken)
            .send({
                comment: 'I`m not allowed to do this'
            })
            .expect(403);
    });

    it('DELETE created comment (same user) should succeed', async () => {
        await request(server.application)
            .delete(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseTwo.id +
                    '/activity/' +
                    activitySeed.ActivityTwo.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionOne.id +
                    '/comment/' +
                    createdUserSubmissionComment.id
            )
            .set('Authorization', lukeToken)
            .send()
            .expect((res) => res.body === null)
            .expect(204);
    });

    it('DELETE comment from team submission should succeed because user is organizer', async () => {
        await request(server.application)
            .delete(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionOne.id +
                    '/comment/' +
                    createdTeamSubmissionComment.id
            )
            .set('Authorization', lukeToken)
            .send()
            .expect((res) => res.body === null)
            .expect(204);
    });

    it('DELETE comment from another user should fail', async () => {
        await request(server.application)
            .delete(
                '/format/' +
                    formatSeed.FormatSix.id +
                    '/phase/' +
                    phaseSeed.PhaseEleven.id +
                    '/activity/' +
                    activitySeed.ActivityTwentySix.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionTen.id +
                    '/comment/' +
                    commentSeed.CommentTwelve.id
            )
            .set('Authorization', lukeToken)
            .send()
            .expect(403);
    });
});
