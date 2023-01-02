import { describe } from 'mocha';
import * as request from 'supertest';
import { server } from './test.common.spec';
import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

describe('Echo Controller Test', async () => {
    let created = null;

    it('Create an Echo', async () => {
        await request(server.application)
            .post('/echo')
            .send({
                field1: 'field1',
                field2: 1
            })
            .expect(200)
            .expect((res) => {
                expect(res.body)
                    .to.be.an('object')
                    .that.have.keys(['id', 'f1', 'f2']);
                created = res.body;
            });
    });

    it('Get all without selection', async () => {
        await request(server.application)
            .get('/echo')
            .send()
            .expect(200)
            .expect((res) => {
                expect(res.body)
                    .to.be.an('object')
                    .that.have.keys(['count', 'entities']);
            });
    });

    it('Get one without selection', async () => {
        await request(server.application)
            .get(`/echo/${created.id}`)
            .send()
            .expect(200)
            .expect((res) => {
                expect(res.body)
                    .to.be.an('object')
                    .that.have.keys(['id', 'f1', 'f2']);
            });
    });
});
