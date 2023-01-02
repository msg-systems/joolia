import * as request from 'supertest';
import { describe } from 'mocha';
import { server } from './test.common.spec';
import { expect } from 'chai';
import { FileEntryResponse, LinkEntryResponse } from '../../src/api/responses';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';

const users = seeds.users;
const formats = seeds.formats;

describe('KeyVisuals on Formats', async () => {
    let lukeToken;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server, users.Luke);
    });

    after(async () => {
        await clearDatabases();
    });

    it('#PUT adds a key visual to the format', async () => {
        const response = await request(server.application)
            .put('/format/' + formats.FormatOne.id + '/keyvisual')
            .set('Accept', 'application/json')
            .set('Authorization', lukeToken);
        expect(response.statusCode).equal(201);
        expect(response.body).to.have.keys(FileEntryResponse.attrs);
    });

    it('#GET gets the activity key visual', async () => {
        const response = await request(server.application)
            .get('/format/' + formats.FormatOne.id + '/keyvisual')
            .set('Accept', 'application/json')
            .set('Authorization', lukeToken);
        expect(response.statusCode).equal(200);
        expect(response.body).to.have.keys(FileEntryResponse.attrs);
    });

    it('#PUT fails user not organizer', async () => {
        const response = await request(server.application)
            .put('/format/' + formats.FormatThree.id + '/keyvisual')
            .set('Accept', 'application/json')
            .set('Authorization', lukeToken);
        expect(response.statusCode).equal(403);
    });

    it('#PUT adds a false key visual LINK to the format', async () => {
        const response = await request(server.application)
            .put('/format/' + formats.FormatFive.id + '/keyvisual')
            .set('Accept', 'application/json')
            .set('Authorization', lukeToken)
            .send({
                linkUrl: 'tuTup.com'
            });
        expect(response.statusCode).equal(422);
    });

    it('#GET check the link has been assigned', async () => {
        const response = await request(server.application)
            .get('/format/' + formats.FormatFive.id)
            .set('Accept', 'application/json')
            .set('Authorization', lukeToken);
        expect(response.statusCode).equal(200);
        expect(response.body.keyVisual).to.have.keys('linkUrl');
        expect(response.body.keyVisual.linkUrl).not.equals('tuTup.com');
    });

    it('#GET should fail can not retrieve the link as file', async () => {
        const response = await request(server.application)
            .get('/format/' + formats.FormatFive.id + '/keyvisual')
            .set('Accept', 'application/json')
            .set('Authorization', lukeToken);
        expect(response.statusCode).equal(404);
    });

    it('#PUT fails user not organizer', async () => {
        const response = await request(server.application)
            .put('/format/' + formats.FormatThree.id + '/keyvisual')
            .set('Accept', 'application/json')
            .set('Authorization', lukeToken);
        expect(response.statusCode).equal(403);
    });

    it('#PUT adds a key visual LINK to the format which has a image already', async () => {
        const response = await request(server.application)
            .put('/format/' + formats.FormatOne.id + '/keyvisual')
            .set('Accept', 'application/json')
            .set('Authorization', lukeToken)
            .send({
                linkUrl: 'https://www.youtube.com/embed/u_vMChpZMCk'
            });
        expect(response.statusCode).equal(201);
        expect(response.body).to.have.keys(LinkEntryResponse.attrs);
    });

    it('#GET check the yt link has been assigned', async () => {
        const response = await request(server.application)
            .get('/format/' + formats.FormatOne.id)
            .set('Accept', 'application/json')
            .set('Authorization', lukeToken);
        expect(response.statusCode).equal(200);
        expect(response.body.keyVisual).to.have.keys('linkUrl');
        expect(response.body.keyVisual.linkUrl).equals('https://www.youtube.com/embed/u_vMChpZMCk');
    });

    it('#PUT fails link url is not a string', async () => {
        await request(server.application)
            .put('/format/' + formats.FormatOne.id + '/keyvisual')
            .set('Accept', 'application/json')
            .set('Authorization', lukeToken)
            .send({
                linkUrl: 123456
            })
            .expect(422);
    });
});
