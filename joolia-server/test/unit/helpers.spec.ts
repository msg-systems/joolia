import { describe } from 'mocha';
import { expect } from 'chai';
import { normalizeStr } from '../../src/api/utils/helpers';

describe('Helper function tests', () => {
    it('Normalize string', function() {
        expect(normalizeStr('Blah Blah')).equals('BLAH_BLAH');
        expect(normalizeStr('blah blah')).equals('BLAH_BLAH');
        expect(normalizeStr('blahblah')).equals('BLAHBLAH');
        expect(normalizeStr('blah & blah')).equals('BLAH_AND_BLAH');
        expect(normalizeStr('blah / blah')).equals('BLAH_BLAH');
        expect(normalizeStr('blah/blah')).equals('BLAH_BLAH');
        expect(normalizeStr('blah \\ blah')).equals('BLAH_BLAH');
        expect(normalizeStr('blah\\blah')).equals('BLAH_BLAH');
        expect(normalizeStr('blah_blah')).equals('BLAH_BLAH');
        expect(normalizeStr('blah______blah')).equals('BLAH_BLAH');
    });
});
