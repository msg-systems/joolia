import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import * as request from 'supertest';
import { checkErrorMessages, clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import { describe } from 'mocha';
import * as httpStatus from 'http-status';
import { CanvasSubmissionResponse } from '../../src/api/responses';
import { CanvasSubmissionValidationError, submissionColorRegEx } from '../../src/api/validations';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const activities = seeds.activities;
const phases = seeds.phases;
const formats = seeds.formats;
const canvas = seeds.activityCanvas;
const teams = seeds.teams;
const users = seeds.users;
const canvasSlots = seeds.canvasSlots;
const userCanvasSubmissions = seeds.userCanvasSubmissions;
const teamCanvasSubmissions = seeds.teamCanvasSubmissions;

const activityTwo = `/format/${formats.FormatOne.id}/phase/${phases.PhaseTwo.id}/activity/${activities.ActivityTwo.id}`;
const activitySix = `/format/${formats.FormatOne.id}/phase/${phases.PhaseTwo.id}/activity/${activities.ActivitySix.id}`;
const activitySeven = `/format/${formats.FormatOne.id}/phase/${phases.PhaseThree.id}/activity/${activities.ActivitySeven.id}`;

describe('Canvas Submission Controller', async () => {
    let luke;
    let mickeyToken;
    let leiaToken;

    before(async () => {
        await loadFixtures();
        luke = await getSignedIn(server);
        mickeyToken = await getSignedIn(server, { email: 'mickey@disney.com', password: '12345678' });
        leiaToken = await getSignedIn(server, { email: 'princess@alliance.com', password: '12345678' });
    });

    after(async () => {
        await clearDatabases();
    });

    describe('/:canvasId/submission', async () => {
        it('#GET Gets the submissions of canvas one Activity two configuration View: Member', async () => {
            return request(server.application)
                .get(`${activityTwo}/canvas/${canvas.CanvasOne.id}/submission`)
                .set('Authorization', luke)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['entities', 'count']);
                    expect(res.body.entities).to.have.length(2);
                    res.body.entities.forEach((canvasSubmission) => {
                        expect(canvasSubmission).to.have.keys(CanvasSubmissionResponse.attrs);
                        expect(canvasSubmission.id).to.be.oneOf([
                            userCanvasSubmissions.UserCanvasSubmissionOne.id,
                            userCanvasSubmissions.UserCanvasSubmissionTwo.id
                        ]);
                        expect(canvasSubmission.color).to.match(submissionColorRegEx);
                        expect(canvasSubmission.voteCount).eq(0);
                        expect(canvasSubmission.me.isVotedByMe).eq(false);
                    });
                });
        });

        it('#GET Gets the submissions of canvas one filtered by user luke', async () => {
            return request(server.application)
                .get(`${activityTwo}/canvas/${canvas.CanvasOne.id}/submission?filter.submittedBy=${users.Luke.id}`)
                .set('Authorization', luke)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['entities', 'count']);
                    expect(res.body.entities).to.have.length(1);
                    expect(res.body.entities[0].id).eq(userCanvasSubmissions.UserCanvasSubmissionOne.id);
                });
        });

        it('#GET Gets the submissions of canvas two Activity Six configuration View: Submitter', async () => {
            return request(server.application)
                .get(`${activityTwo}/canvas/${canvas.CanvasTwo.id}/submission`)
                .set('Authorization', mickeyToken)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['entities', 'count']);
                    expect(res.body.entities).to.have.length(3);
                    res.body.entities.forEach((canvasSubmission) => {
                        expect(canvasSubmission).to.have.keys(CanvasSubmissionResponse.attrs);
                        expect(canvasSubmission.id).to.be.oneOf([
                            userCanvasSubmissions.UserCanvasSubmissionThree.id,
                            userCanvasSubmissions.UserCanvasSubmissionFour.id,
                            userCanvasSubmissions.UserCanvasSubmissionFive.id
                        ]);
                        expect(canvasSubmission.color).to.match(submissionColorRegEx);
                        expect(canvasSubmission.voteCount).eq(0);
                        expect(canvasSubmission.me.isVotedByMe).eq(false);
                    });
                });
        });

        it('#GET Gets the submissions of canvas three Activity Seven configuration modify team', async () => {
            return request(server.application)
                .get(`${activitySeven}/canvas/${canvas.CanvasThree.id}/submission`)
                .set('Authorization', luke)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['entities', 'count']);
                    expect(res.body.entities).to.have.length(5);
                    res.body.entities.forEach((canvasSubmission) => {
                        expect(canvasSubmission).to.have.keys(CanvasSubmissionResponse.attrs);
                        expect(canvasSubmission.id).to.be.oneOf([
                            teamCanvasSubmissions.TeamCanvasSubmissionOne.id,
                            teamCanvasSubmissions.TeamCanvasSubmissionTwo.id,
                            teamCanvasSubmissions.TeamCanvasSubmissionThree.id,
                            teamCanvasSubmissions.TeamCanvasSubmissionFour.id,
                            teamCanvasSubmissions.TeamCanvasSubmissionFive.id
                        ]);
                        expect(canvasSubmission.color).to.match(submissionColorRegEx);
                        expect(canvasSubmission.voteCount).eq(0);
                        expect(canvasSubmission.me.isVotedByMe).eq(false);
                    });
                });
        });

        it('#GET Gets the submissions of canvas three filtered by team 2', async () => {
            return request(server.application)
                .get(`${activitySeven}/canvas/${canvas.CanvasThree.id}/submission?filter.submittedBy=${teams.Team1.id}`)
                .set('Authorization', luke)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['entities', 'count']);
                    expect(res.body.entities).to.have.length(2);
                    res.body.entities.forEach((canvasSubmission) => {
                        expect(canvasSubmission).to.have.keys(CanvasSubmissionResponse.attrs);
                        expect(canvasSubmission.id).to.be.oneOf([
                            teamCanvasSubmissions.TeamCanvasSubmissionOne.id,
                            teamCanvasSubmissions.TeamCanvasSubmissionTwo.id
                        ]);
                        expect(canvasSubmission.color).to.match(submissionColorRegEx);
                        expect(canvasSubmission.voteCount).eq(0);
                        expect(canvasSubmission.me.isVotedByMe).eq(false);
                    });
                });
        });

        it('#GET Gets Fails to get Leia is not a format member', async () => {
            return request(server.application)
                .get(`${activityTwo}/canvas/${canvas.CanvasOne.id}/submission`)
                .set('Authorization', leiaToken)
                .expect(httpStatus.FORBIDDEN);
        });
    });

    describe('/:canvasId/slot/:slotId/submission', async () => {
        it('#POST a new canvas submission as a user in canvas one', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas/${canvas.CanvasOne.id}/slot/${canvasSlots.Slot1.id}/submission`)
                .set('Authorization', mickeyToken)
                .send({
                    content: 'new nice submission',
                    submittedById: users.Mickey.id
                })
                .expect(httpStatus.CREATED)
                .expect((res) => {
                    expect(res.body).to.have.keys(CanvasSubmissionResponse.attrs);
                    expect(res.body.content).eq('new nice submission');
                    expect(res.body.submittedBy.user.id).eq(users.Mickey.id);
                    expect(res.body.voteCount).eq(0);
                    expect(res.body.me.isVotedByMe).eq(false);
                });
        });

        it('#POST a new canvas submission as a user in canvas one (with color)', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas/${canvas.CanvasOne.id}/slot/${canvasSlots.Slot1.id}/submission`)
                .set('Authorization', mickeyToken)
                .send({
                    content: 'new nice submission',
                    color: 'rgba(255, 255, 255, 0.9)',
                    submittedById: users.Mickey.id
                })
                .expect(httpStatus.CREATED)
                .expect((res) => {
                    expect(res.body).to.have.keys(CanvasSubmissionResponse.attrs);
                    expect(res.body.content).eq('new nice submission');
                    expect(res.body.color).eq('rgba(255, 255, 255, 0.9)');
                    expect(res.body.submittedBy.user.id).eq(users.Mickey.id);
                    expect(res.body.voteCount).eq(0);
                    expect(res.body.me.isVotedByMe).eq(false);
                });
        });

        it('#POST a new canvas submission fails submittedById id is not a uuid', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas/${canvas.CanvasOne.id}/slot/${canvasSlots.Slot1.id}/submission`)
                .set('Authorization', mickeyToken)
                .send({
                    content: 'new nice submission',
                    color: 'rgba(255, 255, 255, 0.9)',
                    submittedById: 'Not a UUID'
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasSubmissionValidationError.SUBMITTER_NOT_UUID]));
        });

        it('#POST a new canvas submission fails submitter not included', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas/${canvas.CanvasOne.id}/slot/${canvasSlots.Slot1.id}/submission`)
                .set('Authorization', mickeyToken)
                .send({
                    content: 'new nice submission'
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasSubmissionValidationError.SUBMITTER_NOT_INCLUDED]));
        });

        it('#POST a new canvas submission fails content not included', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas/${canvas.CanvasOne.id}/slot/${canvasSlots.Slot1.id}/submission`)
                .set('Authorization', mickeyToken)
                .send({
                    submittedById: 'Not a UUID'
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasSubmissionValidationError.CONTENT_NOT_INCLUDED]));
        });

        it('#POST a new canvas submission fails content too long', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas/${canvas.CanvasOne.id}/slot/${canvasSlots.Slot1.id}/submission`)
                .set('Authorization', mickeyToken)
                .send({
                    content: 'new nice submission'.repeat(100),
                    submittedById: 'Not a UUID'
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasSubmissionValidationError.CONTENT_TOO_LONG]));
        });

        it('#POST fails leia is not a member of the format', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas/${canvas.CanvasOne.id}/slot/${canvasSlots.Slot1.id}/submission`)
                .set('Authorization', leiaToken)
                .send({
                    content: 'new nice submission',
                    submittedById: users.Mickey.id
                })
                .expect(httpStatus.FORBIDDEN);
        });

        it('#POST a new canvas submission as a team in canvas three', async () => {
            return request(server.application)
                .post(`${activitySeven}/canvas/${canvas.CanvasThree.id}/slot/${canvasSlots.Slot21.id}/submission`)
                .set('Authorization', mickeyToken)
                .send({
                    content: 'new nice submission',
                    submittedById: teams.Team2.id
                })
                .expect(httpStatus.CREATED)
                .expect((res) => {
                    expect(res.body).to.have.keys(CanvasSubmissionResponse.attrs);
                    expect(res.body.content).eq('new nice submission');
                    expect(res.body.submittedBy.team.id).eq(teams.Team2.id);
                });
        });

        it('#POST a new canvas submission as a team in canvas three (with color)', async () => {
            return request(server.application)
                .post(`${activitySeven}/canvas/${canvas.CanvasThree.id}/slot/${canvasSlots.Slot21.id}/submission`)
                .set('Authorization', mickeyToken)
                .send({
                    content: 'new nice submission',
                    color: 'rgba(255, 255, 255, 0.9)',
                    submittedById: teams.Team2.id
                })
                .expect(httpStatus.CREATED)
                .expect((res) => {
                    expect(res.body).to.have.keys(CanvasSubmissionResponse.attrs);
                    expect(res.body.content).eq('new nice submission');
                    expect(res.body.color).eq('rgba(255, 255, 255, 0.9)');
                    expect(res.body.submittedBy.team.id).eq(teams.Team2.id);
                    expect(res.body.voteCount).eq(0);
                    expect(res.body.me.isVotedByMe).eq(false);
                });
        });

        it('#POST should fail Team 8 is not in format', async () => {
            return request(server.application)
                .post(`${activitySeven}/canvas/${canvas.CanvasThree.id}/slot/${canvasSlots.Slot21.id}/submission`)
                .set('Authorization', mickeyToken)
                .send({
                    content: 'new nice submission',
                    submittedById: teams.Team8.id
                })
                .expect(httpStatus.BAD_REQUEST);
        });

        it('#POST should fail member submitting as other user', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas/${canvas.CanvasOne.id}/slot/${canvasSlots.Slot1.id}/submission`)
                .set('Authorization', mickeyToken)
                .send({
                    content: 'new nice submission',
                    submittedById: users.Luke.id
                })
                .expect(httpStatus.FORBIDDEN);
        });
    });

    describe('/:canvasId/slot/:slotId/submission/:submissionId', async () => {
        const slot1 = `${activityTwo}/canvas/${canvas.CanvasOne.id}/slot/${canvasSlots.Slot1.id}`;
        const slot13 = `${activitySix}/canvas/${canvas.CanvasTwo.id}/slot/${canvasSlots.Slot13.id}`;
        const slot20 = `${activitySeven}/canvas/${canvas.CanvasThree.id}/slot/${canvasSlots.Slot20.id}`;

        it('#PATCH the user submission one (content)', async () => {
            return request(server.application)
                .patch(`${slot1}/submission/${userCanvasSubmissions.UserCanvasSubmissionOne.id}`)
                .set('Authorization', luke)
                .send({
                    content: 'nice updated content'
                })
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['content', 'id']);
                    expect(res.body.content).eq('nice updated content');
                });
        });

        it('#PATCH the user submission one (color)', async () => {
            return request(server.application)
                .patch(`${slot1}/submission/${userCanvasSubmissions.UserCanvasSubmissionOne.id}`)
                .set('Authorization', luke)
                .send({
                    color: 'rgba(255, 255, 255, 0.9)'
                })
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['color', 'id']);
                    expect(res.body.color).eq('rgba(255, 255, 255, 0.9)');
                });
        });

        it('#PATCH the user submission five created by organizer Luke with Mickey as submitter (content)', async () => {
            return request(server.application)
                .patch(`${slot13}/submission/${userCanvasSubmissions.UserCanvasSubmissionFive.id}`)
                .set('Authorization', mickeyToken)
                .send({
                    content: 'nice updated content'
                })
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['content', 'id']);
                    expect(res.body.content).eq('nice updated content');
                });
        });

        it('#PATCH the user submission five created by organizer Luke with Mickey as submitter (color)', async () => {
            return request(server.application)
                .patch(`${slot13}/submission/${userCanvasSubmissions.UserCanvasSubmissionFive.id}`)
                .set('Authorization', mickeyToken)
                .send({
                    color: 'rgba(255, 255, 255, 0.9)'
                })
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['color', 'id']);
                    expect(res.body.color).eq('rgba(255, 255, 255, 0.9)');
                });
        });

        it('#PATCH the user submission one fails content too long ', async () => {
            return request(server.application)
                .patch(`${slot1}/submission/${userCanvasSubmissions.UserCanvasSubmissionOne.id}`)

                .set('Authorization', luke)
                .send({
                    content: 'nice updated content'.repeat(100)
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasSubmissionValidationError.CONTENT_TOO_LONG]));
        });

        it('#PATCH the user submission one fails content not string', async () => {
            return request(server.application)
                .patch(`${slot1}/submission/${userCanvasSubmissions.UserCanvasSubmissionOne.id}`)
                .set('Authorization', luke)
                .send({
                    content: 10
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasSubmissionValidationError.CONTENT_NOT_STRING]));
        });

        it('#PATCH the user submission one fails - color does not match pattern', async () => {
            return request(server.application)
                .patch(`${slot1}/submission/${userCanvasSubmissions.UserCanvasSubmissionOne.id}`)
                .set('Authorization', luke)
                .send({
                    color: 'This is not a color'
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasSubmissionValidationError.COLOR_NOT_MATCHING_PATTERN]));
        });

        it('#PATCH the user submission one fails - content or color not included ', async () => {
            return request(server.application)
                .patch(`${slot1}/submission/${userCanvasSubmissions.UserCanvasSubmissionOne.id}`)

                .set('Authorization', luke)
                .send({
                    noContent: 'nice updated content'.repeat(100)
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) =>
                    checkErrorMessages(res.body, [
                        CanvasSubmissionValidationError.CONTENT_NOT_STRING,
                        CanvasSubmissionValidationError.COLOR_NOT_STRING
                    ])
                );
        });

        it('#PATCH the user submission one fails - content and color are both included ', async () => {
            return request(server.application)
                .patch(`${slot1}/submission/${userCanvasSubmissions.UserCanvasSubmissionOne.id}`)
                .set('Authorization', luke)
                .send({
                    content: 'nice updated content',
                    color: 'rgba(255, 255, 255, 0.9)'
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasSubmissionValidationError.CONTENT_OR_COLOR_PATCH]));
        });

        it('#PATCH the user submission one fails trying to patch the id ', async () => {
            return request(server.application)
                .patch(`${slot1}/submission/${userCanvasSubmissions.UserCanvasSubmissionOne.id}`)

                .set('Authorization', luke)
                .send({
                    id: users.Luke.id,
                    content: 'new content'
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasSubmissionValidationError.CONTENT_OR_COLOR_PATCH]));
        });

        it('#PATCH fails Mickey is not the creator of the submission ', async () => {
            return request(server.application)
                .patch(`${slot1}/submission/${userCanvasSubmissions.UserCanvasSubmissionOne.id}`)
                .set('Authorization', mickeyToken)
                .send({
                    content: 'nice updated content'
                })
                .expect(httpStatus.FORBIDDEN);
        });

        it('#PATCH should work Mickey is not the creator of the submission but is member of the team ', async () => {
            return request(server.application)
                .patch(`${slot20}/submission/${teamCanvasSubmissions.TeamCanvasSubmissionFive.id}`)
                .set('Authorization', mickeyToken)
                .send({
                    content: 'nice updated content'
                })
                .expect(httpStatus.OK);
        });

        it('#PATCH fails Leia not member of the format ', async () => {
            return request(server.application)
                .patch(`${slot1}/submission/${userCanvasSubmissions.UserCanvasSubmissionOne.id}`)
                .set('Authorization', leiaToken)
                .send({
                    content: 'nice updated content'
                })
                .expect(httpStatus.FORBIDDEN);
        });

        it('#DELETE fails Mickey is not the creator of the submission ', async () => {
            return request(server.application)
                .delete(`${slot1}/submission/${userCanvasSubmissions.UserCanvasSubmissionOne.id}`)
                .set('Authorization', mickeyToken)
                .expect(httpStatus.FORBIDDEN);
        });

        it('#DELETE the user submission one ', async () => {
            return request(server.application)
                .delete(`${slot1}/submission/${userCanvasSubmissions.UserCanvasSubmissionOne.id}`)
                .set('Authorization', luke)
                .expect(httpStatus.NO_CONTENT);
        });

        it('#DELETE fails Leia not member of the format', async () => {
            return request(server.application)
                .delete(`${slot1}/submission/${userCanvasSubmissions.UserCanvasSubmissionOne.id}`)
                .set('Authorization', leiaToken)
                .expect(httpStatus.FORBIDDEN);
        });
    });

    describe('/:canvasId/slot/:slotId/:submissionId/vote', async () => {
        const userSubmission2 = `${activityTwo}/canvas/${canvas.CanvasOne.id}/slot/${canvasSlots.Slot2.id}/submission/${
            userCanvasSubmissions.UserCanvasSubmissionTwo.id
        }`;
        const teamSubmission3 = `${activitySeven}/canvas/${canvas.CanvasThree.id}/slot/${canvasSlots.Slot21.id}/submission/${
            teamCanvasSubmissions.TeamCanvasSubmissionThree.id
        }`;

        it('#POST/DELETE vote - user submission', async () => {
            await request(server.application)
                .post(`${userSubmission2}/vote`)
                .set('Authorization', luke)
                .expect(httpStatus.NO_CONTENT);

            await request(server.application)
                .get(`${activityTwo}/canvas/${canvas.CanvasOne.id}/submission`)
                .set('Authorization', luke)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['entities', 'count']);
                    res.body.entities.forEach((canvasSubmission) => {
                        if (canvasSubmission.id === userCanvasSubmissions.UserCanvasSubmissionTwo.id) {
                            expect(canvasSubmission.voteCount).eq(1);
                            expect(canvasSubmission.me.isVotedByMe).eq(true);
                        } else {
                            expect(canvasSubmission.voteCount).eq(0);
                            expect(canvasSubmission.me.isVotedByMe).eq(false);
                        }
                    });
                });

            await request(server.application)
                .delete(`${userSubmission2}/vote`)
                .set('Authorization', luke)
                .expect(httpStatus.NO_CONTENT);

            await request(server.application)
                .get(`${activityTwo}/canvas/${canvas.CanvasOne.id}/submission`)
                .set('Authorization', luke)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['entities', 'count']);
                    res.body.entities.forEach((canvasSubmission) => {
                        expect(canvasSubmission.voteCount).eq(0);
                        expect(canvasSubmission.me.isVotedByMe).eq(false);
                    });
                });
        });

        it('#POST/DELETE vote - same user submission, different users', async () => {
            await request(server.application)
                .post(`${userSubmission2}/vote`)
                .set('Authorization', luke)
                .expect(httpStatus.NO_CONTENT);

            await request(server.application)
                .post(`${userSubmission2}/vote`)
                .set('Authorization', mickeyToken)
                .expect(httpStatus.NO_CONTENT);

            await request(server.application)
                .get(`${activityTwo}/canvas/${canvas.CanvasOne.id}/submission`)
                .set('Authorization', luke)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['entities', 'count']);
                    res.body.entities.forEach((canvasSubmission) => {
                        if (canvasSubmission.id === userCanvasSubmissions.UserCanvasSubmissionTwo.id) {
                            expect(canvasSubmission.voteCount).eq(2);
                            expect(canvasSubmission.me.isVotedByMe).eq(true);
                        } else {
                            expect(canvasSubmission.voteCount).eq(0);
                            expect(canvasSubmission.me.isVotedByMe).eq(false);
                        }
                    });
                });

            await request(server.application)
                .delete(`${userSubmission2}/vote`)
                .set('Authorization', luke)
                .expect(httpStatus.NO_CONTENT);

            await request(server.application)
                .delete(`${userSubmission2}/vote`)
                .set('Authorization', mickeyToken)
                .expect(httpStatus.NO_CONTENT);

            await request(server.application)
                .get(`${activityTwo}/canvas/${canvas.CanvasOne.id}/submission`)
                .set('Authorization', mickeyToken)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['entities', 'count']);
                    res.body.entities.forEach((canvasSubmission) => {
                        expect(canvasSubmission.voteCount).eq(0);
                        expect(canvasSubmission.me.isVotedByMe).eq(false);
                    });
                });
        });

        it('#POST vote - user submission, isVotedByMe: false', async () => {
            await request(server.application)
                .post(`${userSubmission2}/vote`)
                .set('Authorization', luke)
                .expect(httpStatus.NO_CONTENT);

            await request(server.application)
                .get(`${activityTwo}/canvas/${canvas.CanvasOne.id}/submission`)
                .set('Authorization', mickeyToken)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['entities', 'count']);
                    res.body.entities.forEach((canvasSubmission) => {
                        if (canvasSubmission.id === userCanvasSubmissions.UserCanvasSubmissionTwo.id) {
                            expect(canvasSubmission.voteCount).eq(1);
                        } else {
                            expect(canvasSubmission.voteCount).eq(0);
                        }
                        expect(canvasSubmission.me.isVotedByMe).eq(false);
                    });
                });

            await request(server.application)
                .delete(`${userSubmission2}/vote`)
                .set('Authorization', luke)
                .expect(httpStatus.NO_CONTENT);
        });

        it('#POST vote fails (body included)', async () => {
            await request(server.application)
                .post(`${userSubmission2}/vote`)
                .send({
                    content: 'nice updated content'
                })
                .set('Authorization', luke)
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasSubmissionValidationError.VOTE_NO_BODY_EXPECTED]));
        });

        it('#POST/DELETE vote - team submission', async () => {
            await request(server.application)
                .post(`${teamSubmission3}/vote`)
                .set('Authorization', luke)
                .expect(httpStatus.NO_CONTENT);

            await request(server.application)
                .get(`${activitySeven}/canvas/${canvas.CanvasThree.id}/submission`)
                .set('Authorization', luke)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['entities', 'count']);
                    res.body.entities.forEach((canvasSubmission) => {
                        if (canvasSubmission.id === teamCanvasSubmissions.TeamCanvasSubmissionThree.id) {
                            expect(canvasSubmission.voteCount).eq(1);
                            expect(canvasSubmission.me.isVotedByMe).eq(true);
                        } else {
                            expect(canvasSubmission.voteCount).eq(0);
                            expect(canvasSubmission.me.isVotedByMe).eq(false);
                        }
                    });
                });

            await request(server.application)
                .delete(`${teamSubmission3}/vote`)
                .set('Authorization', luke)
                .expect(httpStatus.NO_CONTENT);

            await request(server.application)
                .get(`${activitySeven}/canvas/${canvas.CanvasThree.id}/submission`)
                .set('Authorization', mickeyToken)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['entities', 'count']);
                    res.body.entities.forEach((canvasSubmission) => {
                        expect(canvasSubmission.voteCount).eq(0);
                        expect(canvasSubmission.me.isVotedByMe).eq(false);
                    });
                });
        });
    });
});
