import { describe } from 'mocha';
import { rndBase58 } from '../../src/api/middlewares';
import { expect } from 'chai';

/**
 * Generating a lot of ids to make sure performance is not a problem.
 */
describe('Request ID Generator test', function() {
    it('Stress test 1', () => {
        for (let i = 0; i < 1000; i++) {
            expect(rndBase58().length).eq(24);
        }
    });

    it('Stress test 2', function() {
        /**
         * Slower than 50k/s will fail ;)
         * Note: this can fail depending on machine load too!
         */
        this.timeout(20000);

        for (let i = 0; i < 1000000; i++) {
            rndBase58();
        }
    });
});
