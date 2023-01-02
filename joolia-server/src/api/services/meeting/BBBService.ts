import { logger } from '../../../logger';
import * as crypto from 'crypto';
import * as xml2js from 'xml2js';
import axios from 'axios';
import { getConf } from '../../../config';
import { IBBBConfiguration } from '../../../config/configuration';
import { BadRequestError } from '../../errors';

export interface IBBBMeetingEntity {
    id: string;
    name: string;
}

/**
 * Represents a user joining a Meeting.
 */
export interface IBBBMeetingUser {
    name?: string;
    email: string;
    isModerator: boolean;
}

/**
 * Big Blue Button Service Implementation.
 *
 * Specific implementation details: https://docs.bigbluebutton.org/dev/api.html
 */
export class BBBService {
    private static config: IBBBConfiguration = getConf().meetingServiceConf.provider.bbb;

    public verifyCredentials(): void {
        if (!getConf().meetingServiceConf.provider.bbb.endpoint || !getConf().meetingServiceConf.provider.bbb.secret) {
            throw new Error('Missing BBB credentials');
        }
    }

    public static async createMeeting(entity: IBBBMeetingEntity, user: IBBBMeetingUser): Promise<string> {
        const params = {
            name: entity.name,
            meetingID: this.getMeetingId(entity),
            autoStartRecording: this.config.autoStartRecording,
            attendeePW: this.getAttendeePassword(entity),
            moderatorPW: this.getModeratorPassword(entity),
            logoutURL: this.config.logoutUrl
        };

        const createUrl = this.buildCallURL('create', params);

        const response = await axios.post(createUrl, this.getPresentationConfig(), { headers: { 'Content-Type': 'text/xml' } });

        logger.silly('status: %s, data: %o', response.status, response.data);

        return this.getMeetingUrl(entity, user);
    }

    public static async getMeeting(entity: IBBBMeetingEntity, user: IBBBMeetingUser): Promise<string> {
        const meetingExists: boolean = await this.meetingExists(entity);
        if (!meetingExists) {
            return null;
        }
        return this.getMeetingUrl(entity, user);
    }

    private static async getMeetingUrl(entity: IBBBMeetingEntity, user: IBBBMeetingUser): Promise<string> {
        const params = {
            meetingID: this.getMeetingId(entity),
            fullName: this.getUserMeetingName(user),
            password: this.getUserMeetingPassword(user, entity),
            redirect: true
        };

        return this.buildCallURL('join', params);
    }

    private static async meetingExists(entity: IBBBMeetingEntity): Promise<boolean> {
        const getMeetingsUrl = this.buildCallURL('getMeetings');
        const response = await axios.get(getMeetingsUrl);

        return new Promise<boolean>((resolve, reject) => {
            xml2js.parseString(response.data, (err, data) => {
                if (err) {
                    logger.error('Fail to parse XML %o', err);
                    reject(err);
                } else {
                    let exists = false;

                    /**
                     * TODO: Argh! XML data converted in a ugly object :/
                     */
                    if (data.response.returncode[0] === 'SUCCESS') {
                        if (data.response.meetings && !data.response.messageKey) {
                            exists = data.response.meetings.some((e) => e.meeting[0].meetingID[0] === entity.id);
                        }
                    } else {
                        logger.error('Unexpected response %o', data);
                    }

                    resolve(exists);
                }
            });
        });
    }

    public static async deleteMeeting(entity: IBBBMeetingEntity, user: IBBBMeetingUser): Promise<boolean> {
        const meetingExists: boolean = await this.meetingExists(entity);
        if (!meetingExists) {
            return false;
        }

        const params = {
            meetingID: this.getMeetingId(entity),
            fullName: this.getUserMeetingName(user),
            password: this.getUserMeetingPassword(user, entity),
            redirect: true
        };

        const deleteMeetingCallURL = this.buildCallURL('end', params);
        try {
            await axios.get(deleteMeetingCallURL);
            return true;
        } catch (err) {
            logger.error(err);
            throw new BadRequestError('Could not delete BBB meeting');
        }
    }

    private static getMeetingId(entity: IBBBMeetingEntity): string {
        return entity.id;
    }

    /**
     * Attendee password is the first 4 digits of Entity's Id.
     */
    private static getAttendeePassword(entity: IBBBMeetingEntity): string {
        return this.getMeetingId(entity).substring(0, 4);
    }

    /**
     * Moderator password is the last 4 digits of Entity's Id.
     */
    private static getModeratorPassword(entity: IBBBMeetingEntity): string {
        return this.getMeetingId(entity).slice(-4);
    }

    private static getUserMeetingName(user: IBBBMeetingUser): string {
        return user.name || user.email.split('@')[0];
    }

    private static getUserMeetingPassword(user: IBBBMeetingUser, entity: IBBBMeetingEntity): string {
        return user.isModerator ? this.getModeratorPassword(entity) : this.getAttendeePassword(entity);
    }

    private static buildCallURL(apiFuncName: string, params?: Record<string, string | number | boolean>): string {
        const apiParams = params
            ? Object.keys(params)
                  .map((k) => `${k}=${encodeURIComponent(params[k])}`)
                  .join('&')
            : '';

        const apiCallStr = `${apiFuncName}${apiParams}${this.config.secret}`;
        const sha1sum = crypto.createHash('sha1');
        sha1sum.update(apiCallStr);
        const checksum = sha1sum.digest('hex');
        return `${this.config.endpoint}/${apiFuncName}?${apiParams}&checksum=${checksum}`;
    }

    private static getPresentationConfig(): string {
        if (this.config.defaultPresentationUrl) {
            return `
              <modules>
                 <module name="presentation">
                    <document url="${this.config.defaultPresentationUrl}" filename="JooliaBlank.pdf"/>
                 </module>
              </modules>`;
        }
    }
}
