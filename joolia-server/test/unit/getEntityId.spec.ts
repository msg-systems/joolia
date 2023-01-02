import { expect } from 'chai';
import { describe } from 'mocha';
import { fakeRequest } from '../utils';
import { getFormatId, getTeamId } from '../../src/api/utils/web';

describe('IDs Extraction from Request', () => {
    it('Extract Format ID from query URL', () => {
        const req = fakeRequest({ id: '1' }, { body: {}, params: {}, query: { id: '123' } });
        const id = getFormatId(req);
        expect(id).eq('123');
    });

    it('Extract Format ID from query params', () => {
        const req = fakeRequest({ id: '1' }, { body: {}, params: { formatId: '123' }, query: {} });
        const id = getFormatId(req);
        expect(id).eq('123');
    });

    it('Extract Team ID from query URL', () => {
        const req = fakeRequest({ id: '1' }, { body: {}, params: {}, query: { id: '123' } });
        const id = getTeamId(req);
        expect(id).eq('123');
    });

    it('Extract Team ID from query params', () => {
        const req = fakeRequest({ id: '1' }, { body: {}, params: { teamId: '123' }, query: {} });
        const id = getTeamId(req);
        expect(id).eq('123');
    });
});
