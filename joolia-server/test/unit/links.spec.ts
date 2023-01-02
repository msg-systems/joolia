import { describe } from 'mocha';
import { expect } from 'chai';
import { isVideoLink } from '../../src/api/validations';

describe('Link tests', () => {
    it('Valid Links', function() {
        expect(isVideoLink('')).to.be.false;
        expect(isVideoLink('abc')).to.be.false;
        expect(isVideoLink(null)).to.be.false;
        expect(isVideoLink('http://example.com')).to.be.false;
        expect(isVideoLink('https://www.youtube.com/watch?v=KqOzsq3_yOM')).to.be.false;
        expect(isVideoLink('https://youtu.be/KqOzsq3_yOM')).to.be.true;
        expect(isVideoLink('https://www.youtube.com/embed/KqOzsq3_yOM')).to.be.true;
    });
});
