import { describe } from 'mocha';
import { expect } from 'chai';
import { UserRating } from '../../src/api/models';

describe('Feedback tests', () => {
    it('Ratings should be rounded', () => {
        expect(UserRating.roundRating(1.25)).eq(1.5);
        expect(UserRating.roundRating(1.11)).eq(1.5);
        expect(UserRating.roundRating(0.55)).eq(1.0);
        expect(UserRating.roundRating(0.75)).eq(1.0);
        expect(UserRating.roundRating(1.5)).eq(1.5);
        expect(UserRating.roundRating(1.75)).eq(2);
        expect(UserRating.roundRating(4.75)).eq(5);
    });

    it('Error when out of range', () => {
        expect(() => UserRating.roundRating(-0.01)).to.throw('Rating value out of range');
        expect(() => UserRating.roundRating(5.1)).to.throw('Rating value out of range');
        expect(() => UserRating.roundRating(0)).to.throw('Rating value out of range');
    });
});
