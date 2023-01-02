import { expect, use } from 'chai';
import { describe } from 'mocha';
import * as request from 'supertest';
import { ActivityTemplateResponse, FileEntryResponse, stepTemplateResponseAttributes, UserResponse } from '../../src/api/responses';
import * as chaiSorted from 'chai-sorted';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import { TemplateCategory } from '../../src/api/models';

use(chaiSorted);

const librarySeed = seeds.libraries;
const userSeed = seeds.users;
const activityTmplSeed = seeds.templates.activities;
const stepTmplSeed = seeds.templates.steps;
const stepSeed = seeds.steps;
const keyVisualSeed = seeds.files.keyVisuals;
const activityTmplFileSeed = seeds.files.activityTemplates;
const activityFileSeed = seeds.files.activities;

describe('ActivityTemplateController', async () => {
    const activityTemplateOne = seeds.templates.activities.ActivityTemplate1;
    const activitySixteen = seeds.activities.ActivitySixteen;
    const activityOne = seeds.activities.ActivityOne;
    const activityTwo = seeds.activities.ActivityTwo;
    const activityConfigurationOne = seeds.configurations.ActivityConfigurationOne;
    const activityConfigurationTwentySeven = seeds.configurations.ActivityConfigurationTwentySeven;

    let lukeToken;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('/activity-template', async () => {
        it('GET should retrieve all the activityTemplates', async () => {
            await request(server.application)
                .get('/activity-template')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.entities.length).equals(1);
                    expect(res.body.count).equals(1);

                    // Activity templates should be order on name asc name by default
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');

                    const activityTemplate = res.body.entities[0];
                    // @ts-ignore
                    expect(activityTemplate.stepTemplates).sortedBy('position');
                    expect(activityTemplate).to.have.keys(ActivityTemplateResponse.attrs);
                    expect(activityTemplate.id).equals(activityTmplSeed.ActivityTemplate5.id);
                });
        });

        it('GET should retrieve all the activityTemplates select on name', async () => {
            await request(server.application)
                .get('/activity-template?select[]=name&select[]=createdBy&select[]=stepTemplates')
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.entities.length).equals(1);
                    expect(res.body.count).equals(1);

                    const activityTemplate = res.body.entities[0];
                    expect(activityTemplate.id).equals(activityTmplSeed.ActivityTemplate5.id);
                    expect(activityTemplate).to.have.keys(['id', 'name', 'createdBy', 'stepTemplates']);
                    expect(activityTemplate.createdBy).to.have.keys(UserResponse.attrs);
                });
        });

        it('GET should retrieve all the activityTemplates order on name', async () => {
            await request(server.application)
                .get('/activity-template?order[name]=asc')
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    //@ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });
    });

    describe('/library/:id/activity-template', async () => {
        let postedActivityTemplate;

        it('POST should not create a template because user is not organizer', async () => {
            // Luke is only participant in Activity Sixteen
            await request(server.application)
                .post('/library/' + librarySeed.library2.id + '/activity-template')
                .set('Authorization', lukeToken)
                .send({
                    activityId: activitySixteen.id,
                    category: 'explore'
                })
                .expect(403);
        });

        it('POST should not create a template because is not member of library', async () => {
            // Luke is only participant in Activity Sixteen
            await request(server.application)
                .post('/library/' + librarySeed.library3.id + '/activity-template')
                .set('Authorization', lukeToken)
                .send({
                    activityId: activityOne.id,
                    category: 'explore'
                })
                .expect(403);
        });

        it('POST should not create a template because activityId is not provided', async () => {
            // Luke is only participant in Activity Sixteen
            await request(server.application)
                .post('/library/' + librarySeed.library2.id + '/activity-template')
                .set('Authorization', lukeToken)
                .send({
                    notActivityId: activityOne.id
                })
                .expect(422);
        });

        it('POST should not create a template because activityId is not a uuid', async () => {
            // Luke is only participant in Activity Sixteen
            await request(server.application)
                .post('/library/' + librarySeed.library2.id + '/activity-template')
                .set('Authorization', lukeToken)
                .send({
                    activityId: '34d'
                })
                .expect(422);
        });

        it('POST should not create a template because category is not provided', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library2.id + '/activity-template')
                .set('Authorization', lukeToken)
                .send({
                    activityId: activityOne.id
                })
                .expect(422);
        });

        it('POST should not create a template because category is not valid', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library2.id + '/activity-template')
                .set('Authorization', lukeToken)
                .send({
                    activityId: activityOne.id,
                    category: 'NotAValidCategory'
                })
                .expect(422);
        });

        it('POST should create a template out of an activity', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library2.id + '/activity-template')
                .set('Authorization', lukeToken)
                .send({
                    activityId: activityOne.id,
                    category: 'ideate'
                })
                .expect(201)
                .expect((res) => {
                    postedActivityTemplate = res.body;
                    expect(res.body).to.have.keys(ActivityTemplateResponse.attrs);

                    Object.keys(activityOne).forEach((key) => {
                        if (key in res.body && !['id', 'configuration', 'keyVisual', 'createdBy'].includes(key)) {
                            expect(activityOne[key]).equal(res.body[key]);
                        }
                    });

                    res.body.stepTemplates.forEach((step) =>
                        expect(step.description).to.be.oneOf([stepSeed.StepSeven.description, stepSeed.StepEight.description])
                    );

                    expect(res.body.configuration.submissionViewSetting).equal(activityConfigurationOne.submissionViewSetting);
                    expect(res.body.configuration.submissionModifySetting).equal(activityConfigurationOne.submissionModifySetting);
                    expect(res.body.keyVisual).to.have.keys(FileEntryResponse.required);
                    expect(res.body.category).equals('ideate');
                });
        });

        it('POST should create a template out of an activity, including assigned canvas', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library2.id + '/activity-template')
                .set('Authorization', lukeToken)
                .send({
                    activityId: activityTwo.id,
                    category: 'ideate'
                })
                .expect(201)
                .expect((res) => {
                    expect(res.statusCode).equal(201);
                    expect(res.body).to.have.keys(ActivityTemplateResponse.attrs);
                    expect(res.body.canvases).to.have.length(1);
                    expect(res.body.canvases[0].slots).to.have.length(9);
                });
        });

        it('GET should retrieve the activityTemplates files transferred from activity one', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library2.id + '/activity-template/' + postedActivityTemplate.id + '/file')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body).lengthOf(1);
            expect(response.body[0].name).equal(activityFileSeed.ActivityOneFileWithoutData.name);
        });

        it('GET should retrieve the activityTemplates of specific library', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body.entities.length).equals(1);
            response.body.entities.forEach((activityTemplate) => {
                expect(activityTemplate).to.have.keys(ActivityTemplateResponse.attrs);
                expect(activityTemplate.id).to.be.oneOf([activityTmplSeed.ActivityTemplate5.id]);
            });
        });

        it('GET should retrieve the activityTemplates of specific library select on name', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template?select=name')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body.entities.length).equals(1);
            response.body.entities.forEach((activityTemplate) => {
                expect(activityTemplate).to.have.keys(['id', 'name']);
                expect(activityTemplate.name).to.be.oneOf([activityTmplSeed.ActivityTemplate5.name]);
            });
        });

        it('GET should retrieve the activityTemplates of specific library select on library', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template?select=library')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body.entities.length).equals(1);
            response.body.entities.forEach((activityTemplate) => {
                expect(activityTemplate).to.have.keys(['id', 'library']);
            });
        });

        it('GET should retrieve the activityTemplates of specific library select on category', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template?select=category')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body.entities.length).equals(1);
            response.body.entities.forEach((activityTemplate) => {
                expect(activityTemplate).to.have.keys(['id', 'category']);
            });
        });

        it('GET should retrieve the activityTemplates of specific library select on stepTemplates', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template?select=stepTemplates')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            response.body.entities.forEach((activityTemplate) => {
                expect(activityTemplate).to.have.keys(['id', 'stepTemplates']);
                activityTemplate.stepTemplates.forEach((step) => {
                    expect(step).to.have.keys(stepTemplateResponseAttributes);
                });
            });
        });

        it('GET should retrieve the activityTemplates of specific library select on createdBy', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template?select=createdBy')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body.entities.length).equals(1);
            response.body.entities.forEach((activityTemplate) => {
                expect(activityTemplate).to.have.keys(['id', 'createdBy']);
                expect(activityTemplate.createdBy.id).equal(userSeed.Luke.id);
            });
        });

        it('GET should retrieve the activityTemplates of specific library order on name', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template?order[name]=asc')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    //@ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });

        it('GET should fail user not member of library', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library3.id + '/activity-template')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(403);
        });

        it('GET should fail library not found', async () => {
            const response = await request(server.application)
                .get('/library/notAnId/activity-template')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(404);
        });

        it('GET should retrieve the activityTemplates by category filter', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template')
                .query({ 'in.category': ['ideate', 'test'] })
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body.entities.length).equals(1);
            response.body.entities.forEach((activityTemplate) => {
                expect(activityTemplate.library.id).equal(librarySeed.library1.id);
                expect(activityTemplate.id).equal(activityTmplSeed.ActivityTemplate5.id);
            });
        });
    });

    describe('/library/:id/activity-template/:id', async () => {
        it('GET activity-template of library', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template/' + activityTemplateOne.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(ActivityTemplateResponse.attrs);
                    Object.keys(activityTemplateOne).forEach((key) => {
                        if (key in res.body && !['createdBy', 'library', 'configuration', 'keyVisual'].includes(key)) {
                            expect(activityTemplateOne[key]).equal(res.body[key]);
                        }
                    });
                    expect(res.body.keyVisual.id).equal(keyVisualSeed.ActivityTemplateKeyVisualOne.id);
                    expect(res.body.keyVisual).to.have.keys(FileEntryResponse.required);
                    // @ts-ignore
                    expect(res.body.stepTemplates).sortedBy('position');
                    res.body.stepTemplates.forEach((step) =>
                        expect(step.id).to.be.oneOf([stepTmplSeed.StepTemplate1.id, stepTmplSeed.StepTemplate2.id])
                    );
                    expect(res.body.configuration.submissionViewSetting).equal(activityConfigurationTwentySeven.submissionViewSetting);
                    expect(res.body.configuration.submissionModifySetting).equal(activityConfigurationTwentySeven.submissionModifySetting);
                });
        });

        it('GET activity-template of library with select on name', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template/' + activityTemplateOne.id + '?select=name')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body).to.have.keys(['id', 'name']);
            expect(response.body.name).equal(activityTemplateOne.name);
        });

        it('GET activity-template of library with select on category', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template/' + activityTemplateOne.id + '?select=category')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body).to.have.keys(['id', 'category']);
            expect(response.body.category).equal(activityTemplateOne.category);
        });

        it('GET activity-template of library with select on keyVisual', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template/' + activityTemplateOne.id + '?select=keyVisual')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((response) => {
                    expect(response.body).to.have.keys(['id', 'keyVisual']);
                    expect(response.body.keyVisual.id).equal(keyVisualSeed.ActivityTemplateKeyVisualOne.id);
                    expect(response.body.keyVisual).to.have.keys(FileEntryResponse.required);
                });
        });

        it('GET activity-template of library with select on stepTemplates', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template/' + activityTemplateOne.id + '?select=stepTemplates')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body).to.have.keys(['id', 'stepTemplates']);
            // @ts-ignore
            expect(response.body.stepTemplates).sortedBy('position');
        });

        it('GET activity-template of library with select on createdBy', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template/' + activityTemplateOne.id + '?select=createdBy')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body).to.have.keys(['id', 'createdBy']);
            expect(response.body.createdBy.id).equal(userSeed.Luke.id);
        });

        it('GET activity template fails cause user is no member of library 3', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library3.id + '/activity-template/' + activityTmplSeed.ActivityTemplate4.id)
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(403);
        });

        it('GET activity template fails cause template is not part of library 1', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template/' + activityTmplSeed.ActivityTemplate4.id)
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(404);
        });

        it('PATCH activity-template should update category', async () => {
            await request(server.application)
                .patch('/library/' + librarySeed.library1.id + '/activity-template/' + activityTemplateOne.id)
                .set('Authorization', lukeToken)
                .send({
                    category: TemplateCategory.IDEATE
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.category).equal(TemplateCategory.IDEATE);
                });
        });

        it('PATCH activity-template should fail because of invalid category', async () => {
            await request(server.application)
                .patch('/library/' + librarySeed.library1.id + '/activity-template/' + activityTemplateOne.id)
                .set('Authorization', lukeToken)
                .send({
                    category: 'foo'
                })
                .expect(422);
        });

        it('PATCH activity-template should fail because of invalid field in body', async () => {
            await request(server.application)
                .patch('/library/' + librarySeed.library1.id + '/activity-template/' + activityTemplateOne.id)
                .set('Authorization', lukeToken)
                .send({
                    description: 'updating description is not allowed',
                    category: TemplateCategory.IDEATE
                })
                .expect(422);
        });
    });

    describe('/library/libraryOne/activity-template/activityTemplate1/keyvisual', async () => {
        it('#GET gets the activity key visual', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template/' + activityTmplSeed.ActivityTemplate1.id + '/keyvisual')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body).to.have.keys(FileEntryResponse.attrs);
        });

        it('#GET fails Luke not member of library3', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library3.id + '/activity-template/' + activityTmplSeed.ActivityTemplate4.id + '/keyvisual')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(403);
        });
    });

    describe('/library/:id/activity-template/:id/file...', async () => {
        it('Request all files of activityTemplate', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/activity-template/' + activityTmplSeed.ActivityTemplate1.id + '/file')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body)
                .to.be.an('array')
                .lengthOf(2);
            response.body.every((file) =>
                expect(file.id).to.be.oneOf([
                    activityTmplFileSeed.ActivityTemplateFileOne.id,
                    activityTmplFileSeed.ActivityTemplateFileWithoutData.id
                ])
            );
        });

        it('Request one file of activityTemplate', async () => {
            const response = await request(server.application)
                .get(
                    '/library/' +
                        librarySeed.library1.id +
                        '/activity-template/' +
                        activityTmplSeed.ActivityTemplate1.id +
                        '/file/' +
                        activityTmplFileSeed.ActivityTemplateFileOne.id
                )
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body).to.have.keys(FileEntryResponse.attrs);
            expect(response.body.id).equal(activityTmplFileSeed.ActivityTemplateFileOne.id);
        });

        it('#GET fails Luke not member of library3', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library3.id + '/activity-template/' + activityTmplSeed.ActivityTemplate2.id + '/file')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(403);
        });
    });
});
