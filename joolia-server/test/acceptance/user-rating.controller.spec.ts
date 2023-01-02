import { expect, use } from 'chai';
import * as chaiLike from 'chai-like';
import * as chaiSorted from 'chai-sorted';
import * as chaiThings from 'chai-things';
import { describe } from 'mocha';
import { clearDatabases, getSignedIn, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import * as request from 'supertest';
import { UserRatingResponse } from '../../src/api/responses';

use(chaiLike);
use(chaiThings);
use(chaiSorted);

const activitySeed = seeds.activities;
const phaseSeed = seeds.phases;
const formatSeed = seeds.formats;
const ratingSeed = seeds.userRatings;
const userSubmissionSeed = seeds.userSubmissions;
const teamSubmissionSeed = seeds.teamSubmissions;

describe('UserRatingController', async () => {
    let lukeToken = null;
    let mickeyToken = null;
    let leiaToken = null;

    before(async () => {
        await loadFixtures();
        lukeToken = await getSignedIn(server);
        mickeyToken = await getSignedIn(server, { email: 'mickey@disney.com', password: '12345678' });
        leiaToken = await getSignedIn(server, { email: 'princess@alliance.com', password: '12345678' });
    });

    after(async () => {
        await clearDatabases();
    });

    it('GET an existing rating', async () => {
        await request(server.application)
            .get(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseTwo.id +
                    '/activity/' +
                    activitySeed.ActivityTwo.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionOne.id +
                    '/rating'
            )
            .set('Authorization', lukeToken)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(UserRatingResponse.attrs);
                expect(res.body.id).equals(ratingSeed.RatingOne.id);
            });
    });

    it('GET should return empty object if rating does not exist', async () => {
        await request(server.application)
            .get(
                '/format/' +
                    formatSeed.FormatEight.id +
                    '/phase/' +
                    phaseSeed.PhaseTen.id +
                    '/activity/' +
                    activitySeed.ActivityTwentyFive.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionSeven.id +
                    '/rating'
            )
            .set('Authorization', leiaToken)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.be.empty;
            });
    });

    it('PATCH participant as team member should create a rating', async () => {
        await request(server.application)
            .patch(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseThree.id +
                    '/activity/' +
                    activitySeed.ActivityOne.id +
                    '/submission/' +
                    teamSubmissionSeed.TeamSubmissionSix.id +
                    '/rating'
            )
            .set('Authorization', mickeyToken)
            .send({
                rating: 2
            })
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(UserRatingResponse.attrs);
                expect(res.body.rating).equals(2);
            });
    });

    it('PATCH rating should update an existing rating', async () => {
        await request(server.application)
            .patch(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseTwo.id +
                    '/activity/' +
                    activitySeed.ActivityTwo.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionOne.id +
                    '/rating'
            )
            .set('Authorization', lukeToken)
            .send({
                rating: 5
            })
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.keys(UserRatingResponse.attrs);
                expect(res.body.id).equals(ratingSeed.RatingOne.id);
                expect(res.body.rating).equals(5);
            });
    });

    it('PATCH rating should fail for empty rating', async () => {
        await request(server.application)
            .patch(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseTwo.id +
                    '/activity/' +
                    activitySeed.ActivityTwo.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionOne.id +
                    '/rating'
            )
            .set('Authorization', lukeToken)
            .send({})
            .expect(422);
    });

    it('PATCH rating should fail because rating is below zero', async () => {
        await request(server.application)
            .patch(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseTwo.id +
                    '/activity/' +
                    activitySeed.ActivityTwo.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionOne.id +
                    '/rating'
            )
            .set('Authorization', lukeToken)
            .send({
                rating: -1
            })
            .expect((res) => {
                expect(res.body).to.have.keys(['errors']);
            })
            .expect(422);
    });

    it('PATCH rating should fail because rating is not a float', async () => {
        await request(server.application)
            .patch(
                '/format/' +
                    formatSeed.FormatOne.id +
                    '/phase/' +
                    phaseSeed.PhaseTwo.id +
                    '/activity/' +
                    activitySeed.ActivityTwo.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionFour.id +
                    '/rating'
            )
            .set('Authorization', lukeToken)
            .send({
                rating: 'text'
            })
            .expect(422);
    });

    it('PATCH rating should fail because user is not formatMember', async () => {
        await request(server.application)
            .patch(
                '/format/' +
                    formatSeed.FormatThree.id +
                    '/phase/' +
                    phaseSeed.PhaseFive.id +
                    '/activity/' +
                    activitySeed.ActivityNineteen.id +
                    '/submission/' +
                    userSubmissionSeed.UserSubmissionTwo.id +
                    '/rating'
            )
            .set('Authorization', lukeToken)
            .send({
                rating: 1
            })
            .expect(403);
    });
});
