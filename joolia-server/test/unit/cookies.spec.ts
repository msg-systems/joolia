import { describe } from 'mocha';
import { expect } from 'chai';
import { createAuthCookieOptions } from '../../src/api/utils/web';

describe('Cookies tests', () => {
    it('Create cookies from HTTP headers for joolia.net', function() {
        const cookies = createAuthCookieOptions({ origin: 'https://app.joolia.net' });
        expect(cookies).to.have.keys('httpOnly', 'secure', 'domain', 'maxAge');
        expect(cookies.domain).to.be.eq('joolia.net');
    });

    it('Create cookies from HTTP headers for joolia.ninja', function() {
        const cookies = createAuthCookieOptions({ origin: 'https://app.joolia.ninja' });
        expect(cookies).to.have.keys('httpOnly', 'secure', 'domain', 'maxAge');
        expect(cookies.domain).to.be.eq('joolia.ninja');
    });

    it('Create cookies from HTTP headers for localhost', function() {
        const cookies = createAuthCookieOptions({ origin: 'http://localhost' });
        expect(cookies).to.have.keys('httpOnly', 'secure', 'maxAge', 'domain');
        expect(cookies.domain).to.be.eq('localhost');
    });
});
