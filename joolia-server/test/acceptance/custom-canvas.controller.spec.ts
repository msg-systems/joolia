import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import * as request from 'supertest';
import { checkErrorMessages, clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import { CanvasResponse, CanvasSlotResponse } from '../../src/api/responses';
import { describe } from 'mocha';
import { CanvasValidationError } from '../../src/api/validations';
import * as httpStatus from 'http-status';
import { ActivityCanvas } from '../../src/api/models';
import { SlotType } from '../../src/api/models/CanvasSlotModel';
import { CanvasStatus, CanvasType } from '../../src/api/models/CanvasModel';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

let luke;
let mickey;
let tempCanvas: ActivityCanvas;

const activities = seeds.activities;
const phases = seeds.phases;
const formats = seeds.formats;
const users = seeds.users;

const activityTwo = `/format/${formats.FormatOne.id}/phase/${phases.PhaseTwo.id}/activity/${activities.ActivityTwo.id}`;

describe('Canvas Controller (Custom/Dynamic)', async () => {
    let titleOnlySlot, submissionOnlySlot, titleAndSubmissionsSlot;

    before(async () => {
        await loadFixtures();
        luke = await getSignedIn(server);
        mickey = await getSignedIn(server, { email: 'mickey@disney.com', password: '12345678' });
    });

    after(async () => {
        await clearDatabases();
    });

    describe('/canvas', async () => {
        it('Creation of Canvas fail without name field', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas`)
                .set('Authorization', luke)
                .send({
                    rows: 3,
                    columns: 4,
                    canvasType: CanvasType.CUSTOM_CANVAS,
                    slots: []
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasValidationError.NAME_NOT_INCLUDED]));
        });

        it('Creation of a dynamic canvas without slots fails', async () => {
            await request(server.application)
                .post(`${activityTwo}/canvas`)
                .set('Authorization', luke)
                .send({
                    name: 'New Wrong canvas',
                    rows: 1,
                    columns: 1,
                    canvasType: CanvasType.CUSTOM_CANVAS,
                    slots: []
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY);
        });

        it('Deletion of last slot in a dynamic canvas fails', async () => {
            let simpleCanvas = undefined;

            await request(server.application)
                .post(`${activityTwo}/canvas`)
                .set('Authorization', luke)
                .send({
                    name: 'Simple Canvas',
                    rows: 1,
                    columns: 1,
                    canvasType: CanvasType.CUSTOM_CANVAS,
                    slots: [
                        {
                            title: 'Single Slot',
                            row: 1,
                            column: 1,
                            columnSpan: 1,
                            rowSpan: 1,
                            sortOrder: 1,
                            slotType: SlotType.TITLE_ONLY
                        }
                    ]
                })
                .expect(httpStatus.CREATED)
                .expect((res) => {
                    expect(res.body).to.have.keys(CanvasResponse.attrs);
                    expect(res.body.status).equals(CanvasStatus.DRAFT);
                    simpleCanvas = res.body;
                });

            await request(server.application)
                .delete(`${activityTwo}/canvas/${simpleCanvas.id}/slot/${simpleCanvas.slots[0].id}`)
                .set('Authorization', luke)
                .send()
                .expect(httpStatus.BAD_REQUEST);
        });

        it('Creates a dynamic canvas for the activity', async () => {
            await request(server.application)
                .post(`${activityTwo}/canvas`)
                .set('Authorization', luke)
                .send({
                    name: 'New Dynamic canvas',
                    rows: 1,
                    columns: 1,
                    canvasType: CanvasType.CUSTOM_CANVAS,
                    slots: [
                        {
                            title: 'r1c1',
                            row: 1,
                            column: 1,
                            columnSpan: 1,
                            rowSpan: 1,
                            sortOrder: 1,
                            slotType: SlotType.TITLE_ONLY
                        },
                        {
                            row: 1,
                            column: 2,
                            columnSpan: 1,
                            rowSpan: 1,
                            sortOrder: 2,
                            slotType: SlotType.SUBMISSIONS_ONLY
                        },
                        {
                            title: 'something is needed for this type',
                            row: 1,
                            column: 3,
                            columnSpan: 1,
                            rowSpan: 1,
                            sortOrder: 3,
                            slotType: SlotType.TITLE_AND_SUBMISSIONS
                        }
                    ]
                })
                .expect(httpStatus.CREATED)
                .expect((res) => {
                    expect(res.body).to.have.keys(CanvasResponse.attrs);
                    expect(res.body.status).equals(CanvasStatus.DRAFT);
                    expect(res.body.slots).length(3);
                    res.body.slots.forEach((slot) => expect(slot).to.have.keys(CanvasSlotResponse.attrs));
                    tempCanvas = res.body;
                    titleOnlySlot = tempCanvas.slots.find((s) => s.slotType === SlotType.TITLE_ONLY);
                    submissionOnlySlot = tempCanvas.slots.find((s) => s.slotType === SlotType.SUBMISSIONS_ONLY);
                    titleAndSubmissionsSlot = tempCanvas.slots.find((s) => s.slotType === SlotType.TITLE_AND_SUBMISSIONS);
                });
        });

        describe('Canvas Status', async () => {
            it('Organizer gets all Canvas', async () => {
                await request(server.application)
                    .get(`${activityTwo}/canvas`)
                    .set('Authorization', luke)
                    .expect(httpStatus.OK)
                    .expect((res) => {
                        expect(res.body.count).equals(3);
                        res.body.entities.forEach((e) => expect(e).to.have.keys(CanvasResponse.attrs));
                    });
            });

            it('Participant gets published only Canvas', async () => {
                await request(server.application)
                    .get(`${activityTwo}/canvas`)
                    .set('Authorization', mickey)
                    .expect(httpStatus.OK)
                    .expect((res) => {
                        res.body.entities.forEach((e) => {
                            expect(e).to.have.keys(CanvasResponse.attrs);
                            expect(e.status).equals(CanvasStatus.PUBLISHED);
                        });
                    });
            });
        });

        describe('Title Only Slot', async () => {
            it('Change title should succeed', async () => {
                await request(server.application)
                    .patch(`${activityTwo}/canvas/${tempCanvas.id}/slot/${titleOnlySlot.id}`)
                    .set('Authorization', luke)
                    .send({
                        title: 'modified'
                    })
                    .expect(httpStatus.OK)
                    .expect((res) => {
                        expect(res.body.title).equals('modified');
                    });
            });

            it('Change title to empty/null should fail', async () => {
                await request(server.application)
                    .patch(`${activityTwo}/canvas/${tempCanvas.id}/slot/${titleOnlySlot.id}`)
                    .set('Authorization', luke)
                    .send({
                        title: ''
                    })
                    .expect(httpStatus.UNPROCESSABLE_ENTITY);
            });

            it('Add submission should fail', async () => {
                await request(server.application)
                    .post(`${activityTwo}/canvas/${tempCanvas.id}/slot/${titleOnlySlot.id}/submission`)
                    .set('Authorization', luke)
                    .send({
                        content: 'this will fail',
                        submittedById: users.Luke.id
                    })
                    .expect(httpStatus.BAD_REQUEST);
            });

            it('Publish Canvas', async () => {
                await request(server.application)
                    .patch(`${activityTwo}/canvas/${tempCanvas.id}`)
                    .set('Authorization', luke)
                    .send({
                        status: CanvasStatus.PUBLISHED
                    })
                    .expect(httpStatus.OK);
            });

            it('Published Canvas cannot be changed by Organizer', async () => {
                await request(server.application)
                    .patch(`${activityTwo}/canvas/${tempCanvas.id}/slot/${titleOnlySlot.id}`)
                    .set('Authorization', luke)
                    .send({
                        title: 'modified'
                    })
                    .expect(httpStatus.BAD_REQUEST);
            });

            it('Published Canvas cannot be changed by Participant', async () => {
                await request(server.application)
                    .patch(`${activityTwo}/canvas/${tempCanvas.id}/slot/${titleOnlySlot.id}`)
                    .set('Authorization', mickey)
                    .send({
                        title: 'modified'
                    })
                    .expect(httpStatus.FORBIDDEN);
            });

            it('Add & Remove submission should succeed', async () => {
                let submission = undefined;

                await request(server.application)
                    .post(`${activityTwo}/canvas/${tempCanvas.id}/slot/${titleOnlySlot.id}/submission`)
                    .set('Authorization', luke)
                    .send({
                        content: 'new nice submission',
                        submittedById: users.Luke.id
                    })
                    .expect(httpStatus.CREATED)
                    .expect((res) => {
                        submission = res.body;
                    });

                await request(server.application)
                    .delete(`${activityTwo}/canvas/${tempCanvas.id}/slot/${titleOnlySlot.id}/submission/${submission.id}`)
                    .set('Authorization', luke)
                    .send()
                    .expect(httpStatus.NO_CONTENT);
            });

            it('Set Canvas back to DRAFT (affects tests below)', async () => {
                await request(server.application)
                    .patch(`${activityTwo}/canvas/${tempCanvas.id}`)
                    .set('Authorization', luke)
                    .send({
                        status: CanvasStatus.DRAFT
                    })
                    .expect(httpStatus.OK);
            });
        });

        describe('Submission Only Slot', async () => {
            it('Add or Change title should fail', async () => {
                await request(server.application)
                    .patch(`${activityTwo}/canvas/${tempCanvas.id}/slot/${submissionOnlySlot.id}`)
                    .set('Authorization', luke)
                    .send({
                        title: 'modified'
                    })
                    .expect(httpStatus.UNPROCESSABLE_ENTITY);
            });

            it('Add submission should fail', async () => {
                await request(server.application)
                    .post(`${activityTwo}/canvas/${tempCanvas.id}/slot/${submissionOnlySlot.id}/submission`)
                    .set('Authorization', luke)
                    .send({
                        content: 'will fail',
                        submittedById: users.Luke.id
                    })
                    .expect(httpStatus.BAD_REQUEST);
            });

            it('Publish Canvas', async () => {
                await request(server.application)
                    .patch(`${activityTwo}/canvas/${tempCanvas.id}`)
                    .set('Authorization', luke)
                    .send({
                        status: CanvasStatus.PUBLISHED
                    })
                    .expect(httpStatus.OK);
            });

            it('Add & Remove submission should succeed', async () => {
                let submission = undefined;

                await request(server.application)
                    .post(`${activityTwo}/canvas/${tempCanvas.id}/slot/${submissionOnlySlot.id}/submission`)
                    .set('Authorization', luke)
                    .send({
                        content: 'new nice submission',
                        submittedById: users.Luke.id
                    })
                    .expect(httpStatus.CREATED)
                    .expect((res) => {
                        submission = res.body;
                    });

                await request(server.application)
                    .delete(`${activityTwo}/canvas/${tempCanvas.id}/slot/${submissionOnlySlot.id}/submission/${submission.id}`)
                    .set('Authorization', luke)
                    .send()
                    .expect(httpStatus.NO_CONTENT);
            });

            it('Set Canvas back to DRAFT (affects tests below)', async () => {
                await request(server.application)
                    .patch(`${activityTwo}/canvas/${tempCanvas.id}`)
                    .set('Authorization', luke)
                    .send({
                        status: CanvasStatus.DRAFT
                    })
                    .expect(httpStatus.OK);
            });
        });

        describe('Title & Submissions Slot', async () => {
            it('Change title should succeed', async () => {
                await request(server.application)
                    .patch(`${activityTwo}/canvas/${tempCanvas.id}/slot/${titleAndSubmissionsSlot.id}`)
                    .set('Authorization', luke)
                    .send({
                        title: 'modified'
                    })
                    .expect(httpStatus.OK)
                    .expect((res) => {
                        expect(res.body.title).equals('modified');
                    });
            });

            it('Add submission should fail', async () => {
                await request(server.application)
                    .post(`${activityTwo}/canvas/${tempCanvas.id}/slot/${titleAndSubmissionsSlot.id}/submission`)
                    .set('Authorization', luke)
                    .send({
                        content: 'will fail',
                        submittedById: users.Luke.id
                    })
                    .expect(httpStatus.BAD_REQUEST);
            });

            it('Publish Canvas', async () => {
                await request(server.application)
                    .patch(`${activityTwo}/canvas/${tempCanvas.id}`)
                    .set('Authorization', luke)
                    .send({
                        status: CanvasStatus.PUBLISHED
                    })
                    .expect(httpStatus.OK);
            });

            it('Published Canvas cannot be changed by Organizer', async () => {
                await request(server.application)
                    .patch(`${activityTwo}/canvas/${tempCanvas.id}/slot/${titleAndSubmissionsSlot.id}`)
                    .set('Authorization', luke)
                    .send({
                        title: 'This is not a draft'
                    })
                    .expect(httpStatus.BAD_REQUEST);
            });

            it('Published Canvas cannot be changed by Participant', async () => {
                await request(server.application)
                    .patch(`${activityTwo}/canvas/${tempCanvas.id}/slot/${titleAndSubmissionsSlot.id}`)
                    .set('Authorization', mickey)
                    .send({
                        title: 'This is not a draft'
                    })
                    .expect(httpStatus.FORBIDDEN);
            });

            it('Add submission should succeed', async () => {
                await request(server.application)
                    .post(`${activityTwo}/canvas/${tempCanvas.id}/slot/${titleAndSubmissionsSlot.id}/submission`)
                    .set('Authorization', luke)
                    .send({
                        content: 'new nice submission',
                        submittedById: users.Luke.id
                    })
                    .expect(httpStatus.CREATED);
            });

            it('Set Canvas back to DRAFT fails because it has submissions', async () => {
                await request(server.application)
                    .patch(`${activityTwo}/canvas/${tempCanvas.id}`)
                    .set('Authorization', luke)
                    .send({
                        status: CanvasStatus.DRAFT
                    })
                    .expect(httpStatus.BAD_REQUEST);
            });
        });
    });
});
