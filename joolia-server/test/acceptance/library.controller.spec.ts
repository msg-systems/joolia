import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { describe } from 'mocha';
import * as request from 'supertest';
import { LibraryViewResponse } from '../../src/api/responses';
import { clearDatabases, getSignedIn, getSignedInAsAdmin, loadFixtures, qSelect, seeds } from '../utils';
import { server } from './test.common.spec';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const librarySeed = seeds.libraries;

describe('LibraryController', async () => {
    let lukeToken = null;
    let adminToken = null;
    let numberLibraries = 0;
    let newLibraryId = null;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
        adminToken = await getSignedInAsAdmin(server);
        numberLibraries = 2;
    });

    after(async () => {
        await clearDatabases();
    });

    describe('/library', async () => {
        it('#POST Responds with an newly created library', async () => {
            await request(server.application)
                .post('/library')
                .set('Accept', 'application/json')
                .set('Authorization', adminToken)
                .send({
                    name: 'testlibrary'
                })
                .expect(201)
                .expect((res) => {
                    newLibraryId = res.body.id;
                    expect(res.body)
                        .be.an('object')
                        .that.have.keys(LibraryViewResponse.attrs);
                    expect(res.body.name).equal('testlibrary');
                    expect(res.body.memberCount).equal(1);
                    expect(res.body.templateCount).equal(0);
                });

            numberLibraries++;
        });

        it('#POST Responds with an error, because an id is included in the body', async () => {
            await request(server.application)
                .post('/library')
                .set('Accept', 'application/json')
                .set('Authorization', adminToken)
                .send({
                    id: 'idInTheBody',
                    name: 'testlibrary'
                })
                .expect(422)
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                });
        });

        it('#POST Responds with an error because of missing admin rights', async () => {
            await request(server.application)
                .post('/library')
                .set('Accept', 'application/json')
                .set('Authorization', lukeToken)
                .send({
                    name: 'testlibrary'
                })
                .expect(403);
        });

        it('#GET Responds with a list of existing libraries', async () => {
            await request(server.application)
                .get('/library')
                .set('Authorization', adminToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .to.be.an('object')
                        .to.have.keys(['entities', 'count']);

                    expect(res.body.count).equal(numberLibraries);

                    const libraryIds = res.body.entities.map((library) => library.id);
                    expect(libraryIds).to.have.members([newLibraryId, librarySeed.library1.id, librarySeed.library3.id]);

                    // Libraries should be order on name asc name by default
                    // @ts-ignore
                    expect(res.body.entities).to.be.ascendingBy('name');
                });
        });

        describe('/library?filter', async () => {
            it('#GET Responds with a list of existing libraries, that matches name', async () => {
                await request(server.application)
                    .get('/library?filter.name=exercitation')
                    .set('Authorization', lukeToken)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body)
                            .to.be.an('object')
                            .that.have.keys(['count', 'entities']);
                        expect(res.body.count).equal(1);
                        expect(res.body.entities.length).equal(1);
                        const library: LibraryViewResponse = res.body.entities[0];
                        expect(library).to.have.keys(LibraryViewResponse.attrs);
                        expect(library.name).equals(librarySeed.library1.name);
                    });
            });

            it('#GET Responds with a list of existing libraries, that matches some names', async () => {
                await request(server.application)
                    .get('/library?filter.name[]=exercitation')
                    .set('Authorization', lukeToken)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body)
                            .to.be.an('object')
                            .that.have.keys(['count', 'entities']);
                        expect(res.body.count).equal(1);
                        expect(res.body.entities.length).equal(1);
                        const library: LibraryViewResponse = res.body.entities[0];
                        expect(library).to.have.keys(LibraryViewResponse.attrs);
                        expect(library.name).equals(librarySeed.library1.name);
                    });
            });

            it('#GET Responds with a list of existing libraries, that matches some more names', async () => {
                await request(server.application)
                    .get('/library?filter.name[]=exercitation&filter.name[]=ullamco')
                    .set('Authorization', lukeToken)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body)
                            .to.be.an('object')
                            .that.have.keys(['count', 'entities']);
                        expect(res.body.count).equal(2);
                        expect(res.body.entities.length).equal(2);
                    });
            });

            it('#GET Responds with an empty list, because nothing matches', async () => {
                await request(server.application)
                    .get('/library?filter.name=nothing')
                    .set('Authorization', lukeToken)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body)
                            .to.be.an('object')
                            .that.have.keys(['count', 'entities']);
                        expect(res.body.count).equal(0);
                        expect(res.body.entities.length).equal(0);
                    });
            });
        });

        describe('/library?select=', async () => {
            it('#GET Responds with a list of existing libraries, with select on name', async () => {
                await request(server.application)
                    .get('/library?select[]=name')
                    .set('Authorization', lukeToken)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.entities).be.an('array');
                        res.body.entities.forEach((entity) => {
                            expect(entity).to.have.keys(['id', 'name']);
                        });
                    });
            });

            it('#GET Responds with a list of existing libraries, with select on memberCount', async () => {
                await request(server.application)
                    .get('/library?select[]=memberCount')
                    .set('Authorization', lukeToken)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.entities).be.an('array');
                        res.body.entities.forEach((entity) => {
                            expect(entity).to.have.keys(['id', 'memberCount']);
                        });
                    });
            });
        });

        describe('/library?order=', async () => {
            it('#GET Responds with a list of existing libraries,ordered by name', async () => {
                await request(server.application)
                    .get('/library?order[name]=asC')
                    .set('Authorization', lukeToken)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.entities).be.an('array');
                        // @ts-ignore
                        expect(res.body.entities).to.be.ascendingBy('name');
                    });
            });

            it('#GET Responds with a list of existing libraries,ordered by name descending', async () => {
                await request(server.application)
                    .get('/library?order[name]=dEsc')
                    .set('Authorization', lukeToken)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.entities).be.an('array');
                        // @ts-ignore
                        expect(res.body.entities).to.be.descendingBy('name');
                    });
            });

            it('#GET Responds with a list of existing libraries,ordered by name and id', async () => {
                await request(server.application)
                    .get('/library?order[id]=asc&order[name]=asc')
                    .set('Authorization', lukeToken)
                    .expect(200)
                    .expect((res) => {
                        const twinLibraries = res.body.entities.filter((entity) => {
                            return entity.name === 'twinLibrary';
                        });
                        // @ts-ignore
                        expect(twinLibraries).to.be.ascendingBy('id');
                        // @ts-ignore
                        expect(twinLibraries).to.be.ascendingBy('name');
                    });
            });

            it('#GET Responds with a list of existing libraries,ordered by name and descending id', async () => {
                await request(server.application)
                    .get('/library?order[id]=desc&order[name]=asc')
                    .set('Authorization', lukeToken)
                    .expect(200)
                    .expect((res) => {
                        const twinLibraries = res.body.entities.filter((entity) => {
                            return entity.name === 'twinLibrary';
                        });
                        // @ts-ignore
                        expect(twinLibraries).to.be.descendingBy('id');
                        // @ts-ignore
                        expect(twinLibraries).to.be.ascendingBy('name');
                    });
            });
        });

        describe('/library?take=&skip=', async () => {
            it('#GET Responds with a list of existing libraries, with 2 in limit', async () => {
                await request(server.application)
                    .get('/library?take=2')
                    .set('Authorization', adminToken)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.entities).be.an('array');
                        expect(res.body.entities.length).equal(2);
                    });
            });

            it('#GET Responds with a list of existing libraries,with 1 in offset and limit 3', async () => {
                await request(server.application)
                    .get('/library?take=3&skip=1')
                    .set('Authorization', adminToken)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.entities).be.an('array');
                        expect(res.body.entities.length).equal(2);
                    });
            });
        });
    });

    describe('/library/{id}', async () => {
        it('#GET Responds with a specific library information, existing id', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library1.id)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .be.an('object')
                        .that.have.keys(LibraryViewResponse.attrs);
                    expect(res.body.id).equal(librarySeed.library1.id);
                    expect(res.body.name).equal(librarySeed.library1.name);
                    expect(res.body.templateCount).equal(3);
                    expect(res.body.memberCount).equal(2);
                });
        });

        it('#GET Responds with a specific library information, existing id and select on all fields', async () => {
            const selects = ['id', 'name', 'memberCount', 'updatedAt', 'templateCount'];
            await request(server.application)
                .get(`/library/${librarySeed.library1.id}?${qSelect(selects)}`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .be.an('object')
                        .that.have.keys(selects);
                    expect(res.body.id).equal(librarySeed.library1.id);
                    expect(res.body.name).equal(librarySeed.library1.name);
                    expect(res.body.templateCount).equal(3);
                    expect(res.body.memberCount).equal(2);
                });
        });

        it('#GET Responds with a specific library information, with order - that is ignored', async () => {
            await request(server.application)
                .get(`/library/${librarySeed.library1.id}?order[ignored]=asc`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .be.an('object')
                        .that.have.keys(LibraryViewResponse.attrs);
                });
        });

        it('#GET Responds with a specific library information, existing id and select on name', async () => {
            await request(server.application)
                .get(`/library/${librarySeed.library2.id}?${qSelect(['name'])}`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .be.an('object')
                        .that.have.keys(['id', 'name']);
                    expect(res.body.id).equal(librarySeed.library2.id);
                    expect(res.body.name).equal(librarySeed.library2.name);
                });
        });

        it('#GET Responds with a specific library information, existing id and select on memberCount', async () => {
            await request(server.application)
                .get(`/library/${librarySeed.library1.id}?${qSelect(['memberCount'])}`)
                .set('Authorization', lukeToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body)
                        .be.an('object')
                        .that.have.keys(['id', 'memberCount']);
                    expect(res.body.id).equal(librarySeed.library1.id);
                    expect(res.body.memberCount).equal(2);
                });
        });

        it('#GET Responds 404 for a not existing id', async () => {
            await request(server.application)
                .get('/library/notAnExistingId')
                .set('Authorization', lukeToken)
                .expect(404);
        });

        it('#PATCH Responds with the patched library', async () => {
            await request(server.application)
                .patch('/library/' + librarySeed.library2.id)
                .set('Authorization', lukeToken)
                .set('Accept', 'application/json')
                .send({
                    name: 'NewnamePatched'
                })
                .expect((res) => {
                    expect(res.body).be.an('object');
                    expect(res.body.name).equal('NewnamePatched');
                })
                .expect(200);
        });

        it('#GET Fails if a library of which the user is not member of is requested', async () => {
            await request(server.application)
                .get('/library/' + librarySeed.library3.id)
                .set('Authorization', lukeToken)
                .expect(403);
        });
    });
});
