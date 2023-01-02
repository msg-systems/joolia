import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import * as request from 'supertest';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import { describe } from 'mocha';
import { CanvasValidationError } from '../../src/api/validations';
import * as httpStatus from 'http-status';
import { SlotType } from '../../src/api/models/CanvasSlotModel';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const activities = seeds.activities;
const phases = seeds.phases;
const formats = seeds.formats;
const canvas = seeds.activityCanvas;
const slots = seeds.canvasSlots;

describe('Canvas Slot Controller', async () => {
    let luke;
    let mickeyToken;

    before(async () => {
        await loadFixtures();
        luke = await getSignedIn(server);
        mickeyToken = await getSignedIn(server, { email: 'mickey@disney.com', password: '12345678' });
    });

    after(async () => {
        await clearDatabases();
    });

    describe('Business Canvas - CanvasOne', async () => {
        const canvasOne = `/format/${formats.FormatOne.id}/phase/${phases.PhaseTwo.id}/activity/${activities.ActivityTwo.id}/canvas/${
            canvas.CanvasOne.id
        }`;

        it('#PATCH Changes the slot 1 title of canvas one', async () => {
            return request(server.application)
                .patch(`${canvasOne}/slot/${slots.Slot1.id}`)
                .set('Authorization', luke)
                .send({ title: 'NewTitle' })
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body.title === 'NewTitle');
                });
        });

        it('#PATCH Changes the slot 1 title fails because title is empty', async () => {
            return request(server.application)
                .patch(`${canvasOne}/slot/${slots.Slot1.id}`)
                .set('Authorization', luke)
                .send({ title: '' })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => {
                    expect(res.body.error).equals(CanvasValidationError.SLOT_TITLE_EMPTY);
                });
        });

        it('#PATCH Changes the slot 1 title fails because title too long', async () => {
            return request(server.application)
                .patch(`${canvasOne}/slot/${slots.Slot1.id}`)
                .set('Authorization', luke)
                .send({ title: 'New slot title that is too long to be accepted by the validations' })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => {
                    expect(res.body.error).equals(CanvasValidationError.SLOT_TITLE_TOO_LONG);
                });
        });

        it('#PATCH Changes the slot type fails because only title updates are allowed', async () => {
            return request(server.application)
                .patch(`${canvasOne}/slot/${slots.Slot1.id}`)
                .set('Authorization', luke)
                .send({
                    title: 'Title',
                    slotType: SlotType.TITLE_AND_SUBMISSIONS
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .expect((res) => {
                    expect(res.body.error).equals(CanvasValidationError.ONLY_TITLE_PATCH);
                });
        });

        it('#PATCH Changes fails because Mickey is not organizer', async () => {
            return request(server.application)
                .patch(`${canvasOne}/slot/${slots.Slot1.id}`)
                .set('Authorization', mickeyToken)
                .send({ title: 'NewTitle' })
                .expect(httpStatus.FORBIDDEN);
        });

        it('#PATCH Fails the slot id is not in the canvas of canvas one', async () => {
            return request(server.application)
                .patch(`${canvasOne}/slot/12345678`)
                .set('Authorization', luke)
                .send({ title: 'NewTitle' })
                .expect(httpStatus.NOT_FOUND);
        });
    });
});
