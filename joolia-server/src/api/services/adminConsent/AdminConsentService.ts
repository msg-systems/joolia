import axios, { AxiosResponse } from 'axios';
import { adminConsentEndpoint, userinfoEndpoint } from '../../../config';
import { logger } from '../../../logger';
import { BadRequestError } from '../../errors';
import { Request } from 'express';
import { MailService } from '../mail';
import { AdminConsentRequest } from './types';
import { getLocale } from '../../utils/helpers';

export class AdminConsentService {
    public static async sendAdminConsentRequest(req: Request): Promise<void> {
        const adminConsentUrl = await this.getAdminConsentURL(req.body.domain, req.body.redirectUri, req.params.workspaceId);
        const locale = getLocale(req);

        await MailService.send(new AdminConsentRequest(locale, req.body.message, req.user.name, req.body.adminEmail, adminConsentUrl));
    }

    public static async getAdminConsentURL(domain: string, redirectUri: string, workspaceId: string): Promise<string> {
        const tenant = await this.getTenant(domain);
        const state = this.encodeWorkspaceInformation(workspaceId, domain);

        return adminConsentEndpoint(tenant, redirectUri, state);
    }

    private static async getTenant(domain: string): Promise<string> {
        let userInfoResponse: AxiosResponse<any>;
        try {
            userInfoResponse = await axios.get(userinfoEndpoint(domain));
        } catch (err) {
            logger.error(err);
            throw new BadRequestError('Invalid domain');
        }

        return userInfoResponse.data.token_endpoint.split('/')[3];
    }

    private static encodeWorkspaceInformation(workspaceId: string, domain: string) {
        const workspaceInformation = {
            workspaceId: workspaceId,
            domain: domain
        };
        return encodeURIComponent(Buffer.from(JSON.stringify(workspaceInformation)).toString('base64'));
    }
}
