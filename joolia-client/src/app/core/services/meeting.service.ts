import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from './logger.service';
import { SnackbarService } from './snackbar.service';
import { IMeeting } from '../models/meeting.model';
import { MeetingType } from '../enum/global/meeting-type.enum';
import { NavigationType } from '../enum/global/navigation-type.enum';
import { MeetingResponse } from '../models/meeting-response.model';
import { UtilService } from './util.service';

/**
 * The MeetingService is used to handle meeting requests
 */
@Injectable({
    providedIn: 'root'
})
export class MeetingService {
    private readonly serverConnection: string;

    constructor(
        private config: ConfigurationService,
        private httpClient: HttpClient,
        private logger: LoggerService,
        private snackbarService: SnackbarService
    ) {
        this.serverConnection = this.config.getServerConnection();
    }

    private navigateToMeeting(url: string, navigationType: NavigationType) {
        if (!url) {
            this.snackbarService.openWithMessage('errors.meeting.unableToStart');
        }
        if (navigationType === NavigationType.SAME_TAB) {
            window.open(url, '_self');
        } else {
            window.open(url, '_blank');
        }

        this.logger.debug('[Meeting] Open Link: ' + url, this.navigateToMeeting);
    }

    getFormatMeeting(formatId: string): Observable<MeetingResponse> {
        return this.httpClient.get<MeetingResponse>(`${this.serverConnection}/format/${formatId}/meeting`);
    }

    getTeamMeeting(formatId: string, teamId: string) {
        return this.httpClient.get<MeetingResponse>(`${this.serverConnection}/format/${formatId}/team/${teamId}/meeting`);
    }

    joinMeeting(formatMeetingUrl: string, navigationType: NavigationType) {
        this.navigateToMeeting(formatMeetingUrl, navigationType);
        this.logger.debug(`Meeting joined`, this.joinMeeting);
    }

    authorizeAndCreateMeeting(meeting: IMeeting) {
        if (meeting.type === MeetingType.MSTeams) {
            const url = this.createMSTeamsAuthorizationUrl(meeting);
            window.open(url, '_blank');

            this.logger.debug('[Meeting] Open login link to get authorization: ' + url, this.authorizeAndCreateMeeting);
        } else if (meeting.type === MeetingType.BBB) {
            this.createMeeting(meeting).subscribe(
                (response) => {
                    this.joinMeeting(response.url, NavigationType.NEW_TAB);
                },
                (_err) => {
                    this.snackbarService.openWithMessage('errors.meeting.unableToStart');
                    this.logger.error('[Meeting] not able to start meeting', this.authorizeAndCreateMeeting);
                }
            );
        }
    }

    createMeeting(meeting: IMeeting): Observable<MeetingResponse> {
        const msTeamsRedirectUri = this.getMSTeamsRedirectUri();
        let body;
        if (meeting.type === MeetingType.BBB) {
            body = { type: meeting.type, authorizationCode: '', redirectUri: '' };
        } else {
            body = {
                type: meeting.type,
                authorizationCode: meeting.authorizationCode,
                redirectUri: msTeamsRedirectUri
            };
        }
        if (meeting.entity === 'Format') {
            return this.httpClient.post<MeetingResponse>(`${this.serverConnection}/format/${meeting.formatId}/meeting`, body);
        } else {
            return this.httpClient.post<MeetingResponse>(
                `${this.serverConnection}/format/${meeting.formatId}/team/${meeting.id}/meeting`,
                body
            );
        }
    }

    createMSTeamsAuthorizationUrl(meeting: IMeeting) {
        return (
            ConfigurationService.getConfiguration().configuration.microsoftTeamsBaseAuthorizationUrl +
            '&redirect_uri=' +
            encodeURI(this.getMSTeamsRedirectUri()) +
            '&state=' +
            this.encodeMeetingInformation(meeting)
        );
    }

    getMSTeamsRedirectUri() {
        return location.origin + ConfigurationService.getConfiguration().appBaseHref + 'callback';
    }

    encodeMeetingInformation(meeting: IMeeting): string {
        const meetingInformation = {
            entity: meeting.entity,
            id: meeting.id,
            formatId: meeting.formatId,
            type: meeting.type
        };
        return UtilService.encodeObjectBase64andURI(meetingInformation);
    }

    decodeMeetingInformation(meetingInformationEncoded: string): IMeeting {
        return UtilService.decodeObjectBase64andURI(meetingInformationEncoded);
    }

    deleteMeeting(entity: string, entityId: string, formatId: string) {
        let deleteRequest: Observable<void>;
        if (entity === 'Format') {
            deleteRequest = this.httpClient.delete<void>(`${this.serverConnection}/format/${formatId}/meeting`);
        } else if (entity === 'Team') {
            deleteRequest = this.httpClient.delete<void>(`${this.serverConnection}/format/${formatId}/team/${entityId}/meeting`);
        }
        deleteRequest.subscribe(
            (_response) => {
                this.snackbarService.openWithMessage('snackbar.meetingCancelled');
                this.logger.debug('[Meeting] deleted meeting', this.deleteMeeting);
            },
            (_err) => {
                this.snackbarService.openWithMessage('errors.meeting.unableToDelete');
                this.logger.error('[Meeting] not able to delete meeting', this.deleteMeeting);
            }
        );
    }
}
