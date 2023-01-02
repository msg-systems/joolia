import { getConf } from '../../../config';
import axios, { AxiosResponse } from 'axios';
import { IMSTeamsConfiguration } from '../../../config/configuration';
import * as querystring from 'querystring';
import { UnauthorizedError } from '../../errors';
import { logger } from '../../../logger';
import { LinkEntry } from '../../models';

export interface IMSTeamsMeetingEntity {
    name: string;
    authorizationCode: string;
    redirectUri: string;
}

export class MSTeamsService {
    private static config: IMSTeamsConfiguration = getConf().meetingServiceConf.provider.msTeams;

    public verifyCredentials(): void {
        if (
            !getConf().meetingServiceConf.provider.msTeams.clientId ||
            !getConf().meetingServiceConf.provider.msTeams.clientSecret ||
            !getConf().meetingServiceConf.provider.msTeams.tenant
        ) {
            throw new Error('Missing MS Teams credentials');
        }
    }

    public static async createMeeting(entity: IMSTeamsMeetingEntity): Promise<string> {
        const token = await this.requestAccessToken(entity);

        let meetingResponse: AxiosResponse<any>;
        try {
            meetingResponse = await axios.post(
                this.config.graphAPI,
                {
                    subject: `${entity.name} Meeting`
                },
                {
                    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }
                }
            );
        } catch (err) {
            logger.error(err);
            throw new UnauthorizedError('Could not create meeting');
        }

        return meetingResponse.data.joinWebUrl;
    }

    private static async requestAccessToken(entity: IMSTeamsMeetingEntity): Promise<string> {
        /*eslint-disable */
        const tokenRequestBody = {
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            redirect_uri: entity.redirectUri,
            grant_type: 'authorization_code',
            code: entity.authorizationCode
        };
        /*eslint-enable */
        let tokenResponse: AxiosResponse<any>;
        try {
            tokenResponse = await axios.post(this.config.accessTokenAPI, querystring.stringify(tokenRequestBody), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        } catch (err) {
            logger.error(err);
            throw new UnauthorizedError('Could not obtain an access token');
        }

        return tokenResponse.data.access_token;
    }

    public static hasExceededExpirationTime(meetingLink: LinkEntry): boolean {
        const currentDate = new Date();
        if (!meetingLink.lastAccessedAt) {
            return true;
        }

        const expirationDate = meetingLink.lastAccessedAt;
        expirationDate.setDate(expirationDate.getDate() + getConf().meetingServiceConf.provider.msTeams.meetingLinkExpirationDays);
        if (expirationDate < currentDate) {
            return true;
        }
        return false;
    }

    static getExpirationTime(meetingLink: LinkEntry) {
        const expirationDate = meetingLink.lastAccessedAt;
        expirationDate.setDate(expirationDate.getDate() + getConf().meetingServiceConf.provider.msTeams.meetingLinkExpirationDays);
        return expirationDate;
    }
}
