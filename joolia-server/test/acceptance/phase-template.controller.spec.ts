import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { describe } from 'mocha';
import * as request from 'supertest';
import { PhaseTemplateResponse, UserResponse } from '../../src/api/responses';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import { TemplateCategory } from '../../src/api/models';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const userSeed = seeds.users;
const librarySeed = seeds.libraries;
const phaseSeed = seeds.phases;
const phaseTmplSeed = seeds.templates.phases;

describe('PhaseTemplateController', async () => {
    let lukeToken = null;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('/phase-template', async () => {
        it('GET all phaseTemplates of user libraries', async () => {
            await request(server.application)
                .get('/phase-template')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.count).equals(2);

                    // Phase templates should be order on name asc name by default
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');

                    for (const phaseTmpl of res.body.entities) {
                        expect(phaseTmpl).to.have.keys(PhaseTemplateResponse.attrs);
                        expect(phaseTmpl.createdBy).to.have.keys(UserResponse.attrs);
                        expect(phaseTmpl.id).to.be.oneOf([phaseTmplSeed.phaseTemplate8.id, phaseTmplSeed.phaseTemplate5.id]);
                    }
                });
        });

        it('GET all phaseTemplates of user libraries select by name', async () => {
            await request(server.application)
                .get('/phase-template?select[]=name&select[]=duration')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equals(2);

                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(['id', 'name', 'duration']);
                        expect(entity.id).to.be.oneOf([phaseTmplSeed.phaseTemplate8.id, phaseTmplSeed.phaseTemplate5.id]);
                    }
                });
        });

        it('GET all phaseTemplates of user libraries select category', async () => {
            await request(server.application)
                .get('/phase-template?select=category')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equals(2);

                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(['id', 'category']);
                        expect(entity.category).to.be.oneOf([phaseTmplSeed.phaseTemplate8.category, phaseTmplSeed.phaseTemplate5.category]);
                    }
                });
        });

        it('GET should retrieve all the phaseTemplates order on name', async () => {
            await request(server.application)
                .get('/phase-template?order[name]=asc')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    //@ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });
    });

    describe('/library/:libraryId/phase-template', async () => {
        it('GET all phaseTemplates of one user library', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library2.id + '/phase-template')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .that.has.keys(['count', 'entities']);

                    expect(res.body.count).equals(2);

                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(PhaseTemplateResponse.attrs);
                        expect(entity.createdBy).to.have.keys(UserResponse.attrs);
                    }
                });
        });

        it('GET all phaseTemplate of one user library select by name', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library2.id + '/phase-template?select[]=name&select[]=activityTemplateCount')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equals(2);

                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(['id', 'name', 'activityTemplateCount']);
                        expect(entity.name).to.be.oneOf([phaseTmplSeed.phaseTemplate8.name, phaseTmplSeed.phaseTemplate5.name]);
                    }
                });
        });

        it('GET should retrieve all the phaseTemplates of one user library order on name', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library2.id + '/phase-template?order[name]=asc')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equals(2);
                    //@ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });

        it('GET all phaseTemplate of one user library filter by category', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library2.id + '/phase-template?filter.category[]=ideate&filter.category[]=test')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equals(2);

                    for (const entity of res.body.entities) {
                        expect(entity).to.have.keys(PhaseTemplateResponse.attrs);
                        expect(entity.name).to.be.oneOf([phaseTmplSeed.phaseTemplate8.name, phaseTmplSeed.phaseTemplate5.name]);
                        expect(entity.category).to.be.oneOf([TemplateCategory.TEST, TemplateCategory.IDEATE]);
                    }
                });
        });

        it('GET all phaseTemplate of one user library filter by unknown category', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library2.id + '/phase-template?filter.category=Unknown')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).equals(0);
                    expect(res.body.entities.length).equals(0);
                });
        });
    });

    describe('/library/:libraryId/phase-template/:id', async () => {
        it('GET phaseTemplate 5 from user library', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library2.id + '/phase-template/' + phaseTmplSeed.phaseTemplate5.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.keys(PhaseTemplateResponse.attrs);
                    expect(res.body.id).equal(phaseTmplSeed.phaseTemplate5.id);
                    expect(res.body.activityTemplateCount).equal(2);
                    expect(res.body.duration).equal(1530);
                    expect(res.body.durationUnit).equal(phaseTmplSeed.phaseTemplate5.durationUnit);
                    expect(res.body.createdBy).to.have.keys(UserResponse.attrs);
                });
        });

        it('GET PhaseTemplate fails cause user no member library', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library3.id + '/phase-template/' + phaseTmplSeed.phaseTemplate5.id)
                .set('Authorization', lukeToken)
                .expect(403);
        });

        it('GET phaseTemplate 5 user library select activityTemplateCount', async () => {
            await request(server.application)
                .get(
                    '/library/' +
                        librarySeed.library2.id +
                        '/phase-template/' +
                        phaseTmplSeed.phaseTemplate5.id +
                        '?select=activityTemplateCount'
                )
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'activityTemplateCount']);
                    expect(res.body.id).equal(phaseTmplSeed.phaseTemplate5.id);
                    expect(res.body.activityTemplateCount).equal(2);
                });
        });

        it('GET phasetemplate 5 user library select library', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library2.id + '/phase-template/' + phaseTmplSeed.phaseTemplate5.id + '?select=library')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'library']);
                });
        });

        it('GET phasetemplate 5 user library select category', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library2.id + '/phase-template/' + phaseTmplSeed.phaseTemplate5.id + '?select=category')
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(['id', 'category']);
                });
        });

        it('PATCH phase-template should update category', async () => {
            await request(server.application)
                .patch('/library/' + librarySeed.library2.id + '/phase-template/' + phaseTmplSeed.phaseTemplate5.id)
                .set('Authorization', lukeToken)
                .send({
                    category: TemplateCategory.IDEATE
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.category).equal(TemplateCategory.IDEATE);
                });
        });

        it('PATCH phase-template should fail because of invalid category', async () => {
            await request(server.application)
                .patch('/library/' + librarySeed.library2.id + '/phase-template/' + phaseTmplSeed.phaseTemplate5.id)
                .set('Authorization', lukeToken)
                .send({
                    category: 'foo'
                })
                .expect(422);
        });

        it('PATCH phase-template should fail because of invalid field in body', async () => {
            await request(server.application)
                .patch('/library/' + librarySeed.library2.id + '/phase-template/' + phaseTmplSeed.phaseTemplate5.id)
                .set('Authorization', lukeToken)
                .send({
                    name: 'updating name is not allowed',
                    category: TemplateCategory.IDEATE
                })
                .expect(422);
        });
    });

    describe('/library/:libraryId/phase-template', async () => {
        let createdTmpl = null;

        it('POST create phaseTemplate from Format Four fails cause user is no organizer', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/phase-template')
                .set('Authorization', lukeToken)
                .send({
                    phaseId: phaseSeed.PhaseEight.id,
                    category: 'explore'
                })
                .expect(403);
        });

        it('POST create phaseTemplate fails cause phaseId is no uuid', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/phase-template')
                .set('Authorization', lukeToken)
                .send({
                    phaseId: 'tzdzwnd'
                })
                .expect(422);
        });

        it('POST create phaseTemplate fails cause phaseId is not passed', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/phase-template')
                .set('Authorization', lukeToken)
                .send({
                    noPhaseId: phaseSeed.PhaseEight.id
                })
                .expect(422);
        });

        it('POST create phaseTemplate fails cause category is not passed', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/phase-template')
                .set('Authorization', lukeToken)
                .send({
                    phaseId: phaseSeed.PhaseEight.id
                })
                .expect(422);
        });

        it('POST create phaseTemplate fails cause category is not valid', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/phase-template')
                .set('Authorization', lukeToken)
                .send({
                    phaseId: phaseSeed.PhaseEight.id,
                    category: 'Not a valid category'
                })
                .expect(422);
        });

        it('POST create phaseTemplate from Phase Two', async () => {
            await request(server.application)
                .post('/library/' + librarySeed.library1.id + '/phase-template')
                .set('Authorization', lukeToken)
                .send({
                    phaseId: phaseSeed.PhaseTwo.id,
                    category: 'ideate'
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).to.have.keys(PhaseTemplateResponse.attrs);
                    expect(res.body.name).equal(phaseSeed.PhaseTwo.name);
                    expect(res.body.durationUnit).equal(phaseSeed.PhaseTwo.durationUnit);
                    expect(res.body.createdBy.id).equal(userSeed.Luke.id);
                    expect(res.body.activityTemplateCount).equal(3);
                    expect(res.body.duration).equals(120);
                    expect(res.body.category).equals('ideate');
                    createdTmpl = res.body;
                });

            await request(server.application)
                .get('/library/' + librarySeed.library1.id + '/phase-template/' + createdTmpl.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.keys(PhaseTemplateResponse.attrs);
                    expect(res.body.name).equal(createdTmpl.name);
                    expect(res.body.durationUnit).equal(createdTmpl.durationUnit);
                    expect(res.body.duration).equal(createdTmpl.duration);
                    expect(res.body.createdBy.id).equal(createdTmpl.createdBy.id);
                    expect(res.body.activityTemplateCount).equal(createdTmpl.activityTemplateCount);
                    expect(res.body.category).equal(createdTmpl.category);
                });
        });

        it('DELETE phaseTemplate succeeds', async () => {
            await request(server.application)
                .delete('/library/' + librarySeed.library2.id + '/phase-template/' + createdTmpl.id)
                .set('Authorization', lukeToken)
                .expect(204);
        });
    });
});
