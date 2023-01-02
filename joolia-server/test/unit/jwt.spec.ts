import { describe } from 'mocha';
import { expect } from 'chai';
import { genToken } from '../../src/api/utils/web';
import * as moment from 'moment';

describe('JWT Token tests', () => {
    it('Create expired token', function() {
        const [token, expires] = genToken({}, -3.154e7);
        expect(token).to.not.be.empty;
        expect(moment(expires).isValid()).to.be.true;
        expect(moment(expires).isBefore(moment())).to.be.true;
    });
});
