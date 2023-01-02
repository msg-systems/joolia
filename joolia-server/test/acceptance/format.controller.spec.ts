import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { describe } from 'mocha';
import * as request from 'supertest';
import { FileEntryResponse, GetFormatResponse, PostFormatResponse } from '../../src/api/responses';
import { Activity, Format, FormatMemberRoles, Phase } from '../../src/api/models';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import * as moment from 'moment';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const userSeed = seeds.users;
const formatSeed = seeds.formats;
const phaseSeed = seeds.phases;
const fileSeed = seeds.files.keyVisuals;
const workspaceSeed = seeds.workspaces;
const formatTemplateSeed = seeds.templates.formats;
const phaseTemplateSeed = seeds.templates.phases;
const activityTemplateSeed = seeds.templates.activities;
const stepTemplateSeed = seeds.templates.steps;
const activityConfigurationSeed = seeds.configurations;

describe('FormatController', async () => {
    let lukeToken;
    const formatOne = formatSeed.FormatOne;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('/format', async () => {
        it('#GET All formats of current user descending by startDate (default ordering)', async () => {
            await request(server.application)
                .get('/format')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.count).equals(108);

                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(GetFormatResponse.attrs);
                    }

                    // Null values fail the sorting test below - The db will always return them at the end
                    const startDates = res.body.entities.map((e) => (e.startDate ? e.startDate : 'zzz'));

                    // Formats should be order on startDate desc by default
                    // @ts-ignore
                    expect(startDates).to.be.sorted({ descending: true });
                });
        });

        it('#POST Responds with the created format', async () => {
            await request(server.application)
                .post('/format')
                .set('Authorization', lukeToken)
                .send({
                    name: 'Testformat4',
                    description: "<b>Beschreibung</b> für<script>alert('Owned')</script> Testformat",
                    shortDescription: "<b>Kurze Beschreibung</b> für<script>alert('Owned')</script> Testformat",
                    workspace: workspaceSeed.Workspace1.id
                })
                .expect(201)
                .expect((res) => {
                    expect(res.statusCode).equal(201);
                    expect(res.body).to.have.keys(PostFormatResponse.required);
                    expect(res.body.name).equal('Testformat4');
                    expect(res.body.description).equal('<b>Beschreibung</b> für Testformat');
                    expect(res.body.shortDescription).equal('<b>Kurze Beschreibung</b> für Testformat');
                    expect(res.body.me.userRole).equal(FormatMemberRoles.ORGANIZER);
                });
        });

        it('#POST Responds with an error workspace not included', async () => {
            await request(server.application)
                .post('/format')
                .set('Authorization', lukeToken)
                .send({
                    name: 'Testformat4',
                    description: 'Beschreibung für Testformat'
                })
                .expect((res) => {
                    expect(res.body.errors[0].msg).equal('The workspace id should be included in the body');
                })
                .expect(422);
        });

        it('#POST create format fails because user is not a workspace member', async () => {
            await request(server.application)
                .post('/format')
                .set('Authorization', lukeToken)
                .send({
                    name: 'Testformat4',
                    description: 'Beschreibung für Testformat',
                    workspace: workspaceSeed.Workspace4.id
                })
                .expect(403);
        });

        it('#GET Responds with the list of existing formats of current user', async () => {
            await request(server.application)
                .get('/format')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.count).equals(109);

                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(GetFormatResponse.attrs);
                    }
                });
        });

        it('#GET Responds with the list of existing formats of current user, with a select ', async () => {
            await request(server.application)
                .get('/format?select[]=id&select[]=name')
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body.entities[0]).to.have.keys(['id', 'name']);
                })
                .expect(200);
        });

        it('#GET Responds with the list of existing formats of current user, with a select on several counts ', async () => {
            await request(server.application)
                .get(
                    '/format?select[]=id&select[]=memberCount&select[]=teamCount&select[]=submissionCount&select[]=phaseCount&select[]=activityCount&select[]=commentCount'
                )
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body.entities[0]).to.have.keys([
                        'id',
                        'memberCount',
                        'teamCount',
                        'submissionCount',
                        'phaseCount',
                        'activityCount',
                        'commentCount'
                    ]);
                })
                .expect(200);
        });

        it('#GET Responds with the list of existing formats of current user, with a select dynamic field ', async () => {
            await request(server.application)
                .get('/format?select=startDate')
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body.entities[0]).to.have.keys(['id', 'startDate']);
                })
                .expect(200);
        });

        it('#GET Responds with the list of existing formats of current user, with a select on me object ', async () => {
            await request(server.application)
                .get('/format?select=me')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    res.body.entities.every((i) => expect(i).to.have.keys('id', 'me'));
                });
        });

        it('#GET Responds with the list of existing formats of current user ordered by name', async () => {
            await request(server.application)
                .get('/format?order[name]=asc&skip=0&take=5')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });

        it('#GET Responds with the list of existing formats of current user ordered by startDate', async () => {
            await request(server.application)
                .get('/format?order[startDate]=asc')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    // Null values fail the sorting test below - The db will always return them at the end
                    const startDates = res.body.entities.map((e) => (e.startDate ? e.startDate : 'zzz'));
                    // @ts-ignore
                    expect(startDates).to.be.sorted({ descending: false });
                });
        });
    });

    describe('/format/:formatId', async () => {
        it('Get the format', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(GetFormatResponse.attrs);

                    expect(res.body.id).equal(formatSeed.FormatOne.id);
                    expect(res.body.memberCount).equal(3);
                    expect(res.body.startDate).equals('1973-10-31T05:00:00.000Z');
                    expect(res.body.endDate).equals('2024-11-13T18:00:00.000Z');
                    expect(res.body.me.userRole).equal(FormatMemberRoles.ORGANIZER);
                    expect(res.body.keyVisual).to.have.keys('id');
                    expect(res.body.keyVisual.id).equal(fileSeed.FormatKeyVisual.id);
                    expect(res.body.containsTechnicalUser).equals(false);
                });
        });

        it('Get a format where createdBy has Avatar', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatFour.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(GetFormatResponse.attrs);
                });
        });

        it('Get the format select keyVisual', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '?select=keyVisual')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'keyVisual']);
                    expect(res.body.keyVisual).to.have.keys('id');
                    expect(res.body.keyVisual.id).equal(fileSeed.FormatKeyVisual.id);
                });
        });

        it('Get the format test for checking end date ', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatFour.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(GetFormatResponse.attrs);
                    expect(res.body.endDate).equal('2024-11-13T18:30:00.000Z');
                });
        });

        it('Get the format with name select', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatFour.id + '?select=name')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'name']);
                    expect(res.body.id).equal(formatSeed.FormatFour.id);
                    expect(res.body.name).equal(formatSeed.FormatFour.name);
                });
        });

        it('Get the format select me object', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatFour.id + '?select=me')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'me']);
                    expect(res.body.id).equal(formatSeed.FormatFour.id);
                    expect(res.body.me.userRole).equal(FormatMemberRoles.PARTICIPANT);
                });
        });

        it('Get the format with member count select', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatFour.id + '?select=memberCount')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'memberCount']);
                    expect(res.body.id).equal(formatSeed.FormatFour.id);
                    expect(res.body.memberCount).equal(5);
                });
        });

        it('Get the format with team count select', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatFour.id + '?select=teamCount')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'teamCount']);
                    expect(res.body.id).equal(formatSeed.FormatFour.id);
                    expect(res.body.teamCount).equal(3);
                });
        });

        it('Get the format with submission count select', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatFour.id + '?select=submissionCount')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'submissionCount']);
                    expect(res.body.id).equal(formatSeed.FormatFour.id);
                    expect(res.body.submissionCount).equal(7);
                });
        });

        it('Get the format with phase count select', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatFour.id + '?select=phaseCount')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'phaseCount']);
                    expect(res.body.id).equal(formatSeed.FormatFour.id);
                    expect(res.body.phaseCount).equal(1);
                });
        });

        it('Get the format with activity count select', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatFour.id + '?select=activityCount')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'activityCount']);
                    expect(res.body.id).equal(formatSeed.FormatFour.id);
                    expect(res.body.activityCount).equal(5);
                });
        });

        it('Get the format with comment count select', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatFour.id + '?select=commentCount')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'commentCount']);
                    expect(res.body.id).equal(formatSeed.FormatFour.id);
                    expect(res.body.commentCount).equal(4);
                });
        });

        it('Get the format with organizer count select', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatFour.id + '?select=organizerCount')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'organizerCount']);
                    expect(res.body.id).equal(formatSeed.FormatFour.id);
                    expect(res.body.organizerCount).equal(2);
                });
        });

        it('Get the format with createdBy select', async () => {
            await request(server.application)
                .get('/format/' + formatOne.id + '?select=createdById')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'createdById']);
                    expect(res.body.createdById).equal(userSeed.Mickey.id);
                });
        });

        it('# GET the startDate of formatOne and check is of phase one (the minimum)', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatOne.id + '?select=startDate')
                .set('Authorization', lukeToken)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'startDate']);
                    expect(
                        moment
                            .utc(res.body.startDate)
                            .format()
                            .toString()
                    ).equal(
                        moment
                            .utc(new Date(phaseSeed.PhaseThree.startDate))
                            .format()
                            .toString()
                    );
                })
                .expect(200);
        });

        it('Get the dummy format without activities, correct team count and phase count', async () => {
            await request(server.application)
                .get('/format/' + formatSeed.FormatNine.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(GetFormatResponse.attrs);
                    expect(res.body.id).equal(formatSeed.FormatNine.id);
                    expect(res.body.memberCount).equal(1);
                    expect(res.body.phaseCount).equal(1);
                    expect(res.body.teamCount).equal(1);
                });
        });

        it('Get error format not found', async () => {
            await request(server.application)
                .get('/format/NotExistingId')
                .set('Authorization', lukeToken)
                .expect(404);
        });

        it('PATCH the format', async () => {
            await request(server.application)
                .patch('/format/' + formatSeed.FormatOne.id)
                .set('Authorization', lukeToken)
                .send({
                    name: 'FormatOnePatched',
                    shortDescription: "<b>Kurze Beschreibungt</b> für<script>alert('Owned')</script> Testformat",
                    description: "<b>Beschreibungt</b> für<script>alert('Owned')</script> Testformat"
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'name', 'shortDescription', 'description']);
                    expect(res.body.name).equal('FormatOnePatched');
                    expect(res.body.shortDescription).equal('<b>Kurze Beschreibungt</b> für Testformat');
                    expect(res.body.description).equal('<b>Beschreibungt</b> für Testformat');
                });
        });

        it('PATCH the format fails because trying to change the workspace', async () => {
            await request(server.application)
                .patch('/format/' + formatSeed.FormatOne.id)
                .set('Authorization', lukeToken)
                .send({
                    workspace: 'whateverId'
                })
                .expect((res) => {
                    expect(res.body.errors[0].msg).equal('Workspace should be an UUID');
                })
                .expect(422);
        });

        it('PATCH the format fails because user is not member', async () => {
            await request(server.application)
                .patch('/format/' + formatSeed.FormatThree.id) // Organizer is Shaak, User is Luke
                .set('Authorization', lukeToken)
                .send({
                    name: 'Testformat3Patched'
                })
                .expect(403);
        });

        it('DELETE the format succeed - no constraints', async () => {
            await request(server.application)
                .delete('/format/' + formatSeed.FormatTwo.id)
                .set('Authorization', lukeToken)
                .expect(204);
        });

        it('DELETE the format succeed - constraints handled by triggers', async () => {
            await request(server.application)
                .delete('/format/' + formatSeed.FormatOne.id)
                .set('Authorization', lukeToken)
                .expect(204);
        });

        it('DELETE the format fails because user is not member', async () => {
            await request(server.application)
                .delete('/format/' + formatSeed.FormatThree.id) // Organizer is Shaak, User is Luke
                .set('Authorization', lukeToken)
                .expect(403);
        });
    });

    describe('/format/_template', async () => {
        it('#POST fails user not member of the library ', async () => {
            await request(server.application)
                .post('/format/_template')
                .set('Authorization', lukeToken)
                .send({
                    // Luke is not member of library 3 where format template 2 belongs to
                    formatTemplateId: formatTemplateSeed.FormatTemplate2.id,
                    workspaceId: workspaceSeed.Workspace1.id
                })
                .expect(403);
        });

        it('#POST fails user not member of the workspace ', async () => {
            await request(server.application)
                .post('/format/_template')
                .set('Authorization', lukeToken)
                .send({
                    formatTemplateId: formatTemplateSeed.FormatTemplate3.id,
                    workspaceId: workspaceSeed.Workspace4.id
                })
                .expect(403);
        });

        it('#POST fails workspace not included ', async () => {
            await request(server.application)
                .post('/format/_template')
                .set('Authorization', lukeToken)
                .send({
                    formatTemplateId: formatTemplateSeed.FormatTemplate3.id
                })
                .expect(422);
        });

        it('#POST fails formatTemplateId ', async () => {
            await request(server.application)
                .post('/format/_template')
                .set('Authorization', lukeToken)
                .send({
                    workspaceId: workspaceSeed.Workspace3.id
                })
                .expect(422);
        });

        describe('#SUCCESFULL /format/_template', async () => {
            let format: Format = null;
            let phases: Phase[] = null;
            let activities: Activity[] = null;

            it('#POST create a new format from a format template', async () => {
                const formatTemplate1 = formatTemplateSeed.FormatTemplate1;
                await request(server.application)
                    .post('/format/_template')
                    .set('Authorization', lukeToken)
                    .send({
                        formatTemplateId: formatTemplate1.id,
                        workspaceId: workspaceSeed.Workspace1.id
                    })
                    .expect(201)
                    .expect((res) => {
                        format = res.body;
                        expect(res.body)
                            .is.an('object')
                            .that.has.keys('id');
                    });
            });

            it('#CHECK the phases have been created', async () => {
                // Check the phases have been created and have the same
                const phaseResponse = await request(server.application)
                    .get('/format/' + format.id + '/phase')
                    .set('Authorization', lukeToken);

                for (const phase of phaseResponse.body.entities) {
                    expect(phase.name).to.be.oneOf([phaseTemplateSeed.phaseTemplate3.name, phaseTemplateSeed.phaseTemplate4.name]);
                    expect(phase.durationUnit).to.be.oneOf([phaseTemplateSeed.phaseTemplate3.durationUnit, 'minutes']);
                }
                phases = phaseResponse.body.entities;
            });

            it('#CHECK the files have been copied. Format 1 has 2 files', async () => {
                // Check the phases have been created and have the same
                const fileResponse = await request(server.application)
                    .get('/format/' + format.id + '/file')
                    .set('Authorization', lukeToken);
                expect(fileResponse.statusCode).equal(200);
                expect(fileResponse.body)
                    .to.be.an('array')
                    .lengthOf(2);
                expect(fileResponse.body[0]).to.have.keys(FileEntryResponse.required);
            });

            it('#CHECK activities and steps have been created', async () => {
                for (const phase of phases) {
                    const activityResponse = await request(server.application)
                        .get('/format/' + format.id + '/phase/' + phase.id + '/activity')
                        .set('Authorization', lukeToken);
                    for (const activity of activityResponse.body.entities) {
                        expect(activity.name).to.be.oneOf([
                            activityTemplateSeed.ActivityTemplate3.name,
                            activityTemplateSeed.ActivityTemplate4.name
                        ]);
                        if (activity.name === activityTemplateSeed.ActivityTemplate3.name) {
                            expect(activity.position).equal(activityTemplateSeed.ActivityTemplate3.position);
                            expect(activity.configuration.submissionModifySetting).equal(
                                activityConfigurationSeed.ActivityConfigurationTwentyNine.submissionModifySetting
                            );
                            expect(activity.configuration.submissionViewSetting).equal(
                                activityConfigurationSeed.ActivityConfigurationTwentyNine.submissionViewSetting
                            );
                        }
                        if (activity.name === activityTemplateSeed.ActivityTemplate4.name) {
                            // We assign here to make sure we assigning the activities from phase 3 needed in next test
                            activities = activityResponse.body.entities;
                            expect(activity.position).equal(activityTemplateSeed.ActivityTemplate4.position);
                            expect(activity.configuration.submissionModifySetting).equal(
                                activityConfigurationSeed.ActivityConfigurationThirty.submissionModifySetting
                            );
                            expect(activity.configuration.submissionViewSetting).equal(
                                activityConfigurationSeed.ActivityConfigurationThirty.submissionViewSetting
                            );
                        }

                        // Check the steps have been created
                        const stepResponse = await request(server.application)
                            .get('/format/' + format.id + '/phase/' + phase.id + '/activity/' + activity.id + '/step')
                            .set('Authorization', lukeToken);

                        for (const step of stepResponse.body.entities) {
                            expect(step.description).to.be.oneOf([
                                stepTemplateSeed.StepTemplate4.description,
                                stepTemplateSeed.StepTemplate5.description
                            ]);
                        }
                    }
                }
            });

            it('#CHECK the files have been copied from format template 4 to new activity', async () => {
                const activity4 = activities.find((activity) => activity.name === activityTemplateSeed.ActivityTemplate4.name);
                const phase3 = phases.find((phase) => phase.name === phaseTemplateSeed.phaseTemplate3.name);
                const response = await request(server.application)
                    .get('/format/' + format.id + '/phase/' + phase3.id + '/activity/' + activity4.id + '/file')
                    .set('Authorization', lukeToken);
                expect(response.statusCode).equal(200);
                expect(response.body)
                    .to.be.an('array')
                    .lengthOf(1);
                expect(response.body[0]).to.have.keys(FileEntryResponse.required);
            });
        });
    });
});
