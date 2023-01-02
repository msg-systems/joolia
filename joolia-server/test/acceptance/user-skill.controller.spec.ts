import { describe } from 'mocha';
import * as request from 'supertest';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import * as httpStatus from 'http-status';
import { expect } from 'chai';
import { SkillResponse } from '../../src/api/responses/skill.response';

const userSeed = seeds.users;
const skills = seeds.skills;

describe('UserSkillController', async () => {
    let lukeToken = null;
    let leiaToken = null;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server, userSeed.Luke);
        leiaToken = await getSignedIn(server, userSeed.Leia);
    });

    after(async () => {
        await clearDatabases();
    });

    describe('As Leia', async () => {
        it('Get all skills of this user - forbidden', async () => {
            await request(server.application)
                .get(`/user/${userSeed.Luke.id}/skill`)
                .set('Authorization', leiaToken)
                .expect(httpStatus.OK);
        });

        it('Add skills to this user - forbidden', async () => {
            await request(server.application)
                .put(`/user/${userSeed.Luke.id}/skill`)
                .set('Authorization', leiaToken)
                .send({
                    skillIds: [skills.SkillThree.id, skills.SkillOne.id]
                })
                .expect(httpStatus.FORBIDDEN);
        });

        it('Remove skills from this user - forbidden', async () => {
            await request(server.application)
                .delete(`/user/${userSeed.Luke.id}/skill/${skills.SkillOne.id}`)
                .set('Authorization', leiaToken)
                .expect(httpStatus.FORBIDDEN);
        });
    });

    describe('As Luke', async () => {
        it('Get all known skills', async () => {
            await request(server.application)
                .get('/user/skill')
                .set('Authorization', lukeToken)
                .expect(httpStatus.OK)
                .expect(async (res) => {
                    expect(res.body.length).equals(6);
                    res.body.forEach((entry) => {
                        expect(entry).to.have.keys(SkillResponse.attrs);
                    });
                });
        });

        it('Get all skills of this user', async () => {
            await request(server.application)
                .get(`/user/${userSeed.Leia.id}/skill`)
                .set('Authorization', lukeToken)
                .expect(httpStatus.OK)
                .expect(async (res) => {
                    expect(res.body.length).equals(2);
                    res.body.forEach((entry) => {
                        expect(entry).to.have.keys(SkillResponse.attrs);
                        expect(entry.name).to.be.oneOf([skills.SkillThree.name, skills.SkillFour.name]);
                    });
                });
        });

        it('Wrong payload - missing field', async () => {
            await request(server.application)
                .put(`/user/${userSeed.Luke.id}/skill`)
                .set('Authorization', lukeToken)
                .send({
                    field: 'x'
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY);
        });

        it('Wrong payload - max number of skills exceeded', async () => {
            await request(server.application)
                .put(`/user/${userSeed.Luke.id}/skill`)
                .set('Authorization', lukeToken)
                .send({
                    skillIds: ['1', '2', '3', '4']
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY);
        });

        it('Add non existing skills to this user changes nothing', async () => {
            await request(server.application)
                .put(`/user/${userSeed.Luke.id}/skill`)
                .set('Authorization', lukeToken)
                .send({
                    skillIds: ['wrong_id_1', 'wrong_id_2']
                })
                .expect((res) => {
                    /**
                     * Should not have changed at all!
                     */
                    res.body.forEach((entry) => {
                        expect(entry).to.have.keys(SkillResponse.attrs);
                        expect(entry.name).to.be.oneOf([skills.SkillOne.name, skills.SkillTwo.name]);
                    });
                })
                .expect(httpStatus.OK);
        });

        it('Add skills to this user', async () => {
            await request(server.application)
                .put(`/user/${userSeed.Luke.id}/skill`)
                .set('Authorization', lukeToken)
                .send({
                    skillIds: [skills.SkillThree.id, skills.SkillOne.id]
                })
                .expect(httpStatus.OK)
                .expect((res) => {
                    res.body.forEach((entry) => {
                        expect(entry).to.have.keys(SkillResponse.attrs);
                        expect(entry.name).to.be.oneOf([skills.SkillOne.name, skills.SkillTwo.name, skills.SkillThree.name]);
                    });
                });

            await request(server.application)
                .put(`/user/${userSeed.Luke.id}/skill`)
                .set('Authorization', lukeToken)
                .send({
                    skillIds: [skills.SkillFour.id]
                })
                .expect(httpStatus.BAD_REQUEST); //exceeded may skills per user
        });

        it('Remove skills from this user', async () => {
            await request(server.application)
                .delete(`/user/${userSeed.Luke.id}/skill/${skills.SkillOne.id}`)
                .set('Authorization', lukeToken)
                .expect(httpStatus.NO_CONTENT);

            await request(server.application)
                .get(`/user/${userSeed.Luke.id}/skill`)
                .set('Authorization', lukeToken)
                .expect(httpStatus.OK)
                .expect(async (res) => {
                    res.body.forEach((entry) => {
                        expect(entry).to.have.keys(SkillResponse.attrs);
                        expect(entry.name).to.be.oneOf([skills.SkillTwo.name, skills.SkillThree.name]);
                    });
                });
        });
    });
});
