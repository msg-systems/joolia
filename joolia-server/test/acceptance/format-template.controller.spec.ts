import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { describe } from 'mocha';
import * as request from 'supertest';
import { FormatTemplateResponse, FileEntryResponse, UserResponse } from '../../src/api/responses';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import { TemplateCategory } from '../../src/api/models';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const keyVisualSeed = seeds.files.keyVisuals;
const formatTmplFileSeed = seeds.files.formatTemplateEntries;
const formatSeed = seeds.formats;
const librarySeed = seeds.libraries;
const userSeed = seeds.users;
const formatTmplSeed = seeds.templates.formats;

describe('FormatTemplateController', async () => {
    let lukeToken = null;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('/format-template', async () => {
        it('GET all formatTemplates of user libraries', async () => {
            await request(server.application)
                .get('/format-template')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.count).equals(3);

                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(FormatTemplateResponse.attrs);
                        expect(entity.id).to.be.oneOf([
                            formatTmplSeed.FormatTemplate1.id,
                            formatTmplSeed.FormatTemplate3.id,
                            formatTmplSeed.FormatTemplate4.id
                        ]);
                    }

                    expect(res.body.entities.find((tmpl) => tmpl.id === formatTmplSeed.FormatTemplate1.id).phaseTemplateCount).equal(2);
                    expect(res.body.entities.find((tmpl) => tmpl.id === formatTmplSeed.FormatTemplate1.id).activityTemplateCount).equal(2);
                    expect(res.body.entities.find((tmpl) => tmpl.id === formatTmplSeed.FormatTemplate3.id).phaseTemplateCount).equal(1);
                    expect(res.body.entities.find((tmpl) => tmpl.id === formatTmplSeed.FormatTemplate3.id).activityTemplateCount).equal(1);
                    expect(res.body.entities.find((tmpl) => tmpl.id === formatTmplSeed.FormatTemplate4.id).phaseTemplateCount).equal(0);
                    expect(res.body.entities.find((tmpl) => tmpl.id === formatTmplSeed.FormatTemplate4.id).activityTemplateCount).equal(0);

                    // Format templates should be order on name asc name by default
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });

        it('GET all formatTemplates of user libraries select by name', async () => {
            await request(server.application)
                .get('/format-template?select=name')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.count).equals(3);

                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(['id', 'name']);
                        expect(entity.name).to.be.oneOf([formatTmplSeed.FormatTemplate1.name, formatTmplSeed.FormatTemplate3.name]);
                    }
                });
        });

        it('GET all formatTemplates of user libraries select activityTemplateCount', async () => {
            await request(server.application)
                .get('/format-template?select[]=activityTemplateCount&select[]=phaseTemplateCount')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.count).equals(3);

                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(['id', 'activityTemplateCount', 'phaseTemplateCount']);
                        expect(entity.id).to.be.oneOf([
                            formatTmplSeed.FormatTemplate1.id,
                            formatTmplSeed.FormatTemplate3.id,
                            formatTmplSeed.FormatTemplate4.id
                        ]);
                    }
                });
        });

        it('GET all formatTemplates of user libraries select category', async () => {
            await request(server.application)
                .get('/format-template?select=category')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(['id', 'category']);
                        expect(entity.category).to.be.oneOf([
                            formatTmplSeed.FormatTemplate1.category,
                            formatTmplSeed.FormatTemplate3.category
                        ]);
                    }
                });
        });

        it('GET should retrieve all the formatTemplates order on name', async () => {
            await request(server.application)
                .get('/format-template?order[name]=asc')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });
    });

    describe('/library/:libraryId/format-template', async () => {
        it('GET all formatTemplates of one user library', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/format-template')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(FormatTemplateResponse.attrs);
                        expect(entity.id).to.be.oneOf([formatTmplSeed.FormatTemplate1.id, formatTmplSeed.FormatTemplate3.id]);
                        expect(entity.createdBy).to.have.keys(UserResponse.attrs);
                    }
                    expect(res.body.entities.find((tmpl) => tmpl.id === formatTmplSeed.FormatTemplate1.id).phaseTemplateCount).equal(2);
                    expect(res.body.entities.find((tmpl) => tmpl.id === formatTmplSeed.FormatTemplate1.id).activityTemplateCount).equal(2);
                    expect(res.body.entities.find((tmpl) => tmpl.id === formatTmplSeed.FormatTemplate3.id).phaseTemplateCount).equal(1);
                    expect(res.body.entities.find((tmpl) => tmpl.id === formatTmplSeed.FormatTemplate3.id).activityTemplateCount).equal(1);
                });
        });

        it('GET all formatTemplates of one user library select by name', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/format-template?select=name')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(['id', 'name']);
                        expect(entity.name).to.be.oneOf([formatTmplSeed.FormatTemplate1.name, formatTmplSeed.FormatTemplate3.name]);
                    }
                });
        });

        it('GET all formatTemplates of one user library select activityTemplateCount', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/format-template?select[]=activityTemplateCount&select[]=phaseTemplateCount')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(['id', 'activityTemplateCount', 'phaseTemplateCount']);
                        expect(entity.id).to.be.oneOf([formatTmplSeed.FormatTemplate1.id, formatTmplSeed.FormatTemplate3.id]);
                    }
                    expect(res.body.entities.find((tmpl) => tmpl.id === formatTmplSeed.FormatTemplate1.id).phaseTemplateCount).equal(2);
                    expect(res.body.entities.find((tmpl) => tmpl.id === formatTmplSeed.FormatTemplate1.id).activityTemplateCount).equal(2);
                    expect(res.body.entities.find((tmpl) => tmpl.id === formatTmplSeed.FormatTemplate3.id).phaseTemplateCount).equal(1);
                    expect(res.body.entities.find((tmpl) => tmpl.id === formatTmplSeed.FormatTemplate3.id).activityTemplateCount).equal(1);
                });
        });

        it('GET all formatTemplates of one user library select by category', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/format-template?select=category')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(['id', 'category']);
                        expect(entity.category).to.be.oneOf([
                            formatTmplSeed.FormatTemplate1.category,
                            formatTmplSeed.FormatTemplate3.category
                        ]);
                    }
                });
        });

        it('GET all formatTemplates of one user library filter by category', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/format-template?filter[category]=ideate&filter[category]=explore')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.entities.length).equals(1);

                    for (const entity of res.body.entities) {
                        expect(entity.id).to.be.oneOf([formatTmplSeed.FormatTemplate3.id]);
                    }
                });
        });

        it('GET should retrieve all the formatTemplates order on name', async () => {
            await request(server.application)
                .get('/format-template?order[name]=asc')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });
    });

    describe('/library/:libraryId/format-template/:format-templateId', async () => {
        it('GET formatTemplate ONE user library', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/format-template/' + formatTmplSeed.FormatTemplate1.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(FormatTemplateResponse.attrs);

                    expect(res.body.id).equal(formatTmplSeed.FormatTemplate1.id);
                    expect(res.body.phaseTemplateCount).equal(2);
                    expect(res.body.activityTemplateCount).equal(2);
                    expect(res.body.shortDescription).equal(formatTmplSeed.FormatTemplate1.shortDescription);
                    expect(res.body.description).equal(formatTmplSeed.FormatTemplate1.description);
                    expect(res.body.keyVisual.id).equal(keyVisualSeed.FormatTemplateKeyVisual.id);
                });
        });

        it('GET formatTemplate ONE fails cause user no member library', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library3.id + '/format-template/' + formatTmplSeed.FormatTemplate2.id)
                .set('Authorization', lukeToken)
                .expect(403);
        });

        it('GET formatTemplate ONE user library select phaseTemplateCount', async () => {
            await request(server.application)
                .get(
                    '/library/' +
                        librarySeed.library1.id +
                        '/format-template/' +
                        formatTmplSeed.FormatTemplate1.id +
                        '?select[]=phaseTemplateCount&select[]=activityTemplateCount'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'phaseTemplateCount', 'activityTemplateCount']);
                    expect(res.body.id).equal(formatTmplSeed.FormatTemplate1.id);
                    expect(res.body.phaseTemplateCount).equal(2);
                    expect(res.body.activityTemplateCount).equal(2);
                });
        });

        it('GET formatTemplate ONE user library select library', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/format-template/' + formatTmplSeed.FormatTemplate1.id + '?select=library')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'library']);
                });
        });

        it('GET formatTemplate ONE user library select category', async () => {
            request(server.application)
                .get('/library/' + librarySeed.library1.id + '/format-template/' + formatTmplSeed.FormatTemplate1.id + '?select=category')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'category']);
                });
        });

        it('GET formatTemplate ONE user library select keyVisual', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/format-template/' + formatTmplSeed.FormatTemplate1.id + '?select=keyVisual')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'keyVisual']);
                    expect(res.body.keyVisual).to.have.keys(FileEntryResponse.required);
                    expect(res.body.keyVisual.id).equal(keyVisualSeed.FormatTemplateKeyVisual.id);
                });
        });

        it('PATCH format-template should update category', async () => {
            await request(server.application)
                .patch('/library/' + librarySeed.library1.id + '/format-template/' + formatTmplSeed.FormatTemplate1.id)
                .set('Authorization', lukeToken)
                .send({
                    category: TemplateCategory.IDEATE
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.category).equal(TemplateCategory.IDEATE);
                });
        });

        it('PATCH format-template should fail because of invalid category', async () => {
            await request(server.application)
                .patch('/library/' + librarySeed.library1.id + '/format-template/' + formatTmplSeed.FormatTemplate1.id)
                .set('Authorization', lukeToken)
                .send({
                    category: 'foo'
                })
                .expect(422);
        });

        it('PATCH format-template should fail because of invalid field in body', async () => {
            await request(server.application)
                .patch('/library/' + librarySeed.library1.id + '/format-template/' + formatTmplSeed.FormatTemplate1.id)
                .set('Authorization', lukeToken)
                .send({
                    description: 'updating description is not allowed',
                    category: TemplateCategory.IDEATE
                })
                .expect(422);
        });
    });

    describe('/library/:libraryId/format-template/', async () => {
        let createdTmpl = null;

        it('POST create formatTemplate from Format Four fails cause user is no organizer', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/format-template')
                .set('Authorization', lukeToken)
                .send({
                    formatId: formatSeed.FormatFour.id,
                    category: 'explore'
                })
                .expect(403);
        });

        it('POST create formatTemplate fails cause formatId is no uuid', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/format-template')
                .set('Authorization', lukeToken)
                .send({
                    formatId: 'tzdzwnd'
                })
                .expect(422);
        });

        it('POST create formatTemplate fails cause formatId is not passed', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/format-template')
                .set('Authorization', lukeToken)
                .send({
                    noFormatId: formatSeed.FormatOne.id
                })
                .expect(422);
        });

        it('POST create formatTemplate fails cause category is not passed', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/format-template')
                .set('Authorization', lukeToken)
                .send({
                    formatId: formatSeed.FormatOne.id
                })
                .expect(422);
        });

        it('POST create formatTemplate fails cause category is not valid', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/format-template')
                .set('Authorization', lukeToken)
                .send({
                    formatId: formatSeed.FormatOne.id,
                    category: 'NotAValidCategory'
                })
                .expect(422);
        });

        it('POST create formatTemplate from Format One', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/format-template')
                .set('Authorization', lukeToken)
                .send({
                    formatId: formatSeed.FormatOne.id,
                    category: 'ideate'
                })
                .expect(201)
                .expect((res) => {
                    createdTmpl = res.body;
                    expect(res.body).to.have.keys(FormatTemplateResponse.attrs);
                    expect(res.body.name).equal(formatSeed.FormatOne.name);
                    expect(res.body.shortDescription).equal(formatSeed.FormatOne.shortDescription);
                    expect(res.body.description).equal(formatSeed.FormatOne.description);
                    expect(res.body.createdBy.id).equal(userSeed.Luke.id);
                    expect(res.body.phaseTemplateCount).equal(4);
                    expect(res.body.activityTemplateCount).equal(19);
                    expect(res.body.category).equal('ideate');
                });

            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/format-template/' + createdTmpl.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(FormatTemplateResponse.attrs);
                    expect(res.body.name).equal(createdTmpl.name);
                    expect(res.body.shortDescription).equal(createdTmpl.shortDescription);
                    expect(res.body.description).equal(createdTmpl.description);
                    expect(res.body.createdBy.id).equal(createdTmpl.createdBy.id);
                    expect(res.body.phaseTemplateCount).equal(createdTmpl.phaseTemplateCount);
                    expect(res.body.activityTemplateCount).equal(createdTmpl.activityTemplateCount);
                    expect(res.body.category).equal(createdTmpl.category);
                });
        });

        it('#GET the files from created template', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/format-template/' + createdTmpl.id + '/file')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body[0]).to.have.keys(FileEntryResponse.required);
        });

        it('#DELETE created template', async () => {
            await request(server.application)
                .delete('/library/' + librarySeed.library1.id + '/format-template/' + createdTmpl.id)
                .set('Authorization', lukeToken)
                .expect(204);
        });
    });

    describe('/library/:libraryId/formatTemplate/:formatTemplateId/keyvisual', async (): Promise<void> => {
        it('#GET get the format template keyVisual url', async (): Promise<void> => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/format-template/' + formatTmplSeed.FormatTemplate1.id + '/keyvisual')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body).to.have.keys(FileEntryResponse.attrs);
        });

        it('#GET fails Luke not member of library3', async (): Promise<void> => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library3.id + '/activity-template/' + formatTmplSeed.FormatTemplate2.id + '/keyvisual')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(403);
        });
    });

    describe('/library/:libraryId/formatTemplate/:formatTemplateId/file...', async (): Promise<void> => {
        it('Request all files of formatTemplate', async () => {
            const response = await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/format-template/' + formatTmplSeed.FormatTemplate1.id + '/file')
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body)
                .to.be.an('array')
                .lengthOf(2);
            response.body.every((file) =>
                expect(file.id).to.be.oneOf([
                    formatTmplFileSeed.FormatTemplateFileOne.id,
                    formatTmplFileSeed.FormatTemplateFileWithoutData.id
                ])
            );
        });

        it('Request one file of formatTemplate', async () => {
            const response = await request(server.application)
                .get(
                    '/library/' +
                        librarySeed.library1.id +
                        '/format-template/' +
                        formatTmplSeed.FormatTemplate1.id +
                        '/file/' +
                        formatTmplFileSeed.FormatTemplateFileOne.id
                )
                .set('Authorization', lukeToken);
            expect(response.statusCode).equal(200);
            expect(response.body).to.have.keys(FileEntryResponse.attrs);
            expect(response.body.id).equal(formatTmplFileSeed.FormatTemplateFileOne.id);
        });

        it('#GET fails Luke not member of library3', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library3.id + '/format-template/' + formatTmplSeed.FormatTemplate2.id + '/file')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .expect(403);
        });
    });
});
