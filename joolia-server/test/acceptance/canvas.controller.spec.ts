import { assert, expect, use } from 'chai';
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
import { Canvas } from '../../src/api/models';
import { SlotType } from '../../src/api/models/CanvasSlotModel';
import { CanvasType } from '../../src/api/models/CanvasModel';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

let luke;
let mickey;
let leia;

const activities = seeds.activities;
const phases = seeds.phases;
const formats = seeds.formats;
const canvas = seeds.activityCanvas;

const activityTwo = `/format/${formats.FormatOne.id}/phase/${phases.PhaseTwo.id}/activity/${activities.ActivityTwo.id}`;

function canvasCreationTests(canvasType: CanvasType): void {
    let tempCanvas: Canvas;

    describe(`/canvas (${canvasType})`, async () => {
        it('#POST Creates a canvas for the activity', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas`)
                .set('Authorization', luke)
                .send({
                    name: 'New canvas',
                    rows: 1,
                    columns: 2,
                    canvasType: canvasType,
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
                        }
                    ]
                })
                .expect(httpStatus.CREATED)
                .expect((res) => {
                    expect(res.body).to.have.keys(CanvasResponse.attrs);
                    expect(res.body.slots).length(2);
                    res.body.slots.forEach((slot) => expect(slot).to.have.keys(CanvasSlotResponse.attrs));
                    tempCanvas = res.body;
                });
        });

        it('#POST Fails because Mickey is not organizer', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas`)
                .set('Authorization', mickey)
                .send({
                    name: 'New canvas',
                    rows: 1,
                    columns: 1,
                    canvasType: canvasType,
                    slots: [
                        {
                            row: 1,
                            column: 1,
                            columnSpan: 1,
                            rowSpan: 1,
                            sortOrder: 1,
                            slotType: SlotType.SUBMISSIONS_ONLY
                        }
                    ]
                })
                .expect(httpStatus.FORBIDDEN);
        });

        it('#POST Fails because name is not included', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas`)
                .set('Authorization', luke)
                .send({
                    rows: 3,
                    columns: 4,
                    canvasType: canvasType,
                    slots: []
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasValidationError.NAME_NOT_INCLUDED]));
        });

        it('#POST Fails because name is too long', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas`)
                .set('Authorization', luke)
                .send({
                    name: 'New canvas with a too long name to be accepted by the validations',
                    rows: 3,
                    columns: 4,
                    canvasType: canvasType,
                    slots: []
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasValidationError.NAME_TOO_LONG]));
        });

        it('#POST Fails because slot title is too long', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas`)
                .set('Authorization', luke)
                .send({
                    name: 'New canvas ',
                    rows: 1,
                    columns: 1,
                    canvasType: canvasType,
                    slots: [
                        {
                            title: 'New canvas with a too long slot title to be accepted by the validations',
                            row: 1,
                            column: 1,
                            rowSpan: 1,
                            columnSpan: 1,
                            slotType: SlotType.TITLE_AND_SUBMISSIONS
                        }
                    ]
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasValidationError.SLOTS_INVALID]));
        });

        it('#POST Fails because slots are not included', async () => {
            return request(server.application)
                .post(`${activityTwo}/canvas`)
                .set('Authorization', luke)
                .send({ name: 'New canvas', rows: 3, columns: 4, canvasType: canvasType })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasValidationError.SLOTS_NOT_INCLUDED]));
        });

        it('#GET Gets the canvases of the activity', async () => {
            return request(server.application)
                .get(`${activityTwo}/canvas`)
                .set('Authorization', luke)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['entities', 'count']);
                    expect(res.body.entities).to.have.length(2);
                    assert(res.body.entities.some((c) => c.id === tempCanvas.id));
                    assert(res.body.entities.some((c) => c.id === canvas.CanvasOne.id));
                    res.body.entities.forEach((c) => expect(c).to.have.keys(CanvasResponse.attrs));
                });
        });

        it('#GET Fails to get the canvases since Leia is not a format member', async () => {
            return request(server.application)
                .get(`${activityTwo}/canvas`)
                .set('Authorization', leia)
                .expect(httpStatus.FORBIDDEN);
        });

        it('#DELETE Deletes the created canvas', async () => {
            await request(server.application)
                .delete(`${activityTwo}/canvas/${tempCanvas.id}`)
                .set('Authorization', luke)
                .send()
                .expect(httpStatus.NO_CONTENT);
        });
    });
}

function canvasUpdateTests(fixture: any): void {
    describe(`/canvas/:canvasId (${fixture.name})`, async () => {
        it('#GET Gets the canvas one of the activity two', async () => {
            return request(server.application)
                .get(`${activityTwo}/canvas/${fixture.id}`)
                .set('Authorization', luke)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(CanvasResponse.attrs);
                    expect(res.body.id).eq(fixture.id);
                    expect(res.body.name).eq(fixture.name);
                });
        });

        it('#GET Fails to get the canvas since Leia is not a format member', async () => {
            return request(server.application)
                .get(`${activityTwo}/canvas/${fixture.id}`)
                .set('Authorization', leia)
                .expect(httpStatus.FORBIDDEN);
        });

        it('#PATCH Fails because Mickey is not Organizer', async () => {
            return request(server.application)
                .patch(`${activityTwo}/canvas/${fixture.id}`)
                .set('Authorization', mickey)
                .send({ name: 'NewCanvasName' })
                .expect(httpStatus.FORBIDDEN);
        });

        it('#PATCH Changes the name of canvas one', async () => {
            return request(server.application)
                .patch(`${activityTwo}/canvas/${fixture.id}`)
                .set('Authorization', luke)
                .send({ name: 'NewCanvasName' })
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['name', 'id']);
                    expect(res.body.id).eq(fixture.id);
                    expect(res.body.name).eq('NewCanvasName');
                });
        });

        it('#PATCH Changes the name of canvas fails because name is empty', async () => {
            return request(server.application)
                .patch(`${activityTwo}/canvas/${fixture.id}`)
                .set('Authorization', luke)
                .send({
                    name: ''
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasValidationError.CANVAS_NAME_EMPTY]));
        });

        it('#PATCH Changes the name of canvas fails name too long', async () => {
            return request(server.application)
                .patch(`${activityTwo}/canvas/${fixture.id}`)
                .set('Authorization', luke)
                .send({
                    name: 'New canvas with a to long name to be accepted by the validations'
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasValidationError.NAME_TOO_LONG]));
        });

        it('#PATCH Changes fails we try to update the rows', async () => {
            return request(server.application)
                .patch(`${activityTwo}/canvas/${fixture.id}`)
                .set('Authorization', luke)
                .send({ name: 'NewCanvas', rows: 4 })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => checkErrorMessages(res.body, [CanvasValidationError.CANVAS_NAME_OR_STATUS_PATCH]));
        });

        it('#DELETE Deletes the canvas', async () => {
            await request(server.application)
                .delete(`${activityTwo}/canvas/${fixture.id}`)
                .set('Authorization', luke)
                .send()
                .expect(httpStatus.NO_CONTENT);

            return request(server.application)
                .get(`${activityTwo}/canvas/${fixture.id}`)
                .set('Authorization', luke)
                .send()
                .expect(httpStatus.NOT_FOUND);
        });
    });
}

describe('Canvas Controller', async () => {
    before(async () => {
        await loadFixtures();
        luke = await getSignedIn(server);
        mickey = await getSignedIn(server, { email: 'mickey@disney.com', password: '12345678' });
        leia = await getSignedIn(server, { email: 'princess@alliance.com', password: '12345678' });
    });

    after(async () => {
        await clearDatabases();
    });

    /**
     * Nothing about the layout (row, cols, spans) are tested hence
     * the test set can be reused.
     */
    canvasCreationTests(CanvasType.BUSINESS_CANVAS);
    canvasCreationTests(CanvasType.QUESTIONNAIRE);
    canvasCreationTests(CanvasType.PROCESS);

    /**
     * Same test set but different type of Canvas (static: Business, Questionnaire & Process)
     */
    canvasUpdateTests(canvas.CanvasOne);
    canvasUpdateTests(canvas.CanvasFive);
    canvasUpdateTests(canvas.CanvasSix);
});
