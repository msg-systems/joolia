import { expect } from 'chai';
import { AdminConsentService } from '../../src/api/services/adminConsent';
import { adminConsentEndpoint } from '../../src/config';
import { seeds } from '../utils';

const workspaceSeed = seeds.workspaces;

describe('Admin Consent Test', async () => {
    it('Build admin consent URL', async () => {
        const domain = 'msg.group';
        const redirectUri = 'http://localhost:9000/callback';
        const workspaceId = workspaceSeed.Workspace1.id;
        const adminConsentUrl = await AdminConsentService.getAdminConsentURL(domain, redirectUri, workspaceId);

        const state = encodeURIComponent(Buffer.from(`{"workspaceId":"${workspaceId}","domain":"msg.group"}`).toString('base64'));
        const tenant = '763b2760-45c5-46d3-883e-29705bba49b7';

        expect(adminConsentUrl).equal(adminConsentEndpoint(tenant, redirectUri, state));
    });
});
