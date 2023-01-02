import { assert, expect } from 'chai';
import { describe } from 'mocha';
import * as request from 'supertest';
import { ActivityResponse, ActivityTemplateResponse } from '../../src/api/responses';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import * as httpStatus from 'http-status';

/*
    Acceptance tests...
     - spanning several controllers
     - related to the template feature
 */
describe('Template workflows', async () => {
    const library2 = seeds.libraries.library2;
    const phaseTwo = seeds.phases.PhaseTwo;
    const formatOne = seeds.formats.FormatOne;
    const activityTwo = seeds.activities.ActivityTwo;
    const canvasOne = seeds.activityCanvas.CanvasOne;

    let lukeToken;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('Create and apply activity template with a canvas', async () => {
        it('Canvases should be saved in and restored from an activity template', async () => {
            let newTemplateId;
            let newActivityId;

            await request(server.application)
                .post('/library/' + library2.id + '/activity-template')
                .set('Authorization', lukeToken)
                .send({
                    activityId: activityTwo.id,
                    category: 'ideate'
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).to.have.keys(ActivityTemplateResponse.attrs);
                    expect(res.body.canvases).to.have.length(1);
                    expect(res.body.canvases[0].slots).to.have.length(9);
                    newTemplateId = res.body.id;
                });

            await request(server.application)
                .post('/format/' + formatOne.id + '/phase/' + phaseTwo.id + '/activity/_template')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    activityTemplateId: newTemplateId,
                    position: 1
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).to.have.keys(ActivityResponse.attrs);
                    newActivityId = res.body.id;
                });

            await request(server.application)
                .get(`/format/${formatOne.id}/phase/${phaseTwo.id}/activity/${newActivityId}/canvas`)
                .set('Authorization', lukeToken)
                .expect(httpStatus.OK)
                .expect((res) => {
                    expect(res.body).to.have.keys(['entities', 'count']);
                    expect(res.body.entities).to.have.length(1);
                    assert(res.body.entities.some((canvas) => canvas.name === canvasOne.name));
                });
        });
    });
});
