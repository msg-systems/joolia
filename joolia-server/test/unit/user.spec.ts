import { describe } from 'mocha';
import { expect } from 'chai';
import { User } from '../../src/api/models';

describe('User Model Tests', () => {
    it('Should remove sensitive data from instance model', function() {
        const user = new User({
            id: '001',
            name: 'Vader',
            password: '1234',
            failedLoginAttempts: 10,
            failedLoginTimeout: new Date()
        });
        const secureUser = user.stripSensitiveFields();
        expect(secureUser).to.not.have.any.keys('password', 'failedLoginAttempts', 'failedLoginTimeout');
    });
});
