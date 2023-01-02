import { TestBed } from '@angular/core/testing';

import { MeetingService } from './meeting.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigurationService } from './configuration.service';
import { ConfigurationServiceStub, getMockData, LoggerServiceStub, SnackbarServiceStub } from '../../../testing/unitTest';
import { LoggerService } from './logger.service';
import { SnackbarService } from './snackbar.service';
import { IMeeting } from '../models/meeting.model';
import { NavigationType } from '../enum/global/navigation-type.enum';
import { MeetingType } from '../enum/global/meeting-type.enum';

const configurationServiceStub = new ConfigurationServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const snackbarServiceStub = new SnackbarServiceStub();

let mockFormat1;
let mockTeam1;
let mockMeetingBBB;
let mockMeetingMSTeams;
let mockAuthorizationCode;
let mockAuthorizationUrlMSTeams;

describe('MeetingService', () => {
    let service: MeetingService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        spyOn(window, 'open');
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                MeetingService,
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: SnackbarService, useValue: snackbarServiceStub }
            ]
        });
        service = TestBed.inject(MeetingService);
        httpMock = TestBed.inject(HttpTestingController);
        mockTeam1 = getMockData('team.team1');
        mockFormat1 = getMockData('format.format1');
        mockMeetingBBB = getMockData('meeting.BBB');
        mockMeetingMSTeams = getMockData('meeting.MSTeams');
        snackbarServiceStub._resetStubCalls();
        loggerServiceStub._resetStubCalls();
        mockAuthorizationCode = '12345';
        mockAuthorizationUrlMSTeams = getMockData('meeting.authorizationUrlMSTeams');
    });
    it('should create', () => {
        expect(service).toBeDefined();
    });
    it('should create a format BBB meeting', () => {
        const meeting = { entity: 'Format', id: mockFormat1.id, formatId: mockFormat1.id, type: MeetingType.BBB } as IMeeting;
        service.authorizeAndCreateMeeting(meeting);
        const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/meeting`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ authorizationCode: '', type: 'BBB', redirectUri: '' });
        req.flush(mockMeetingBBB);
        httpMock.verify();
        expect(loggerServiceStub._traceCalls.some((e) => e.message === `[Meeting] Open Link: ${mockMeetingBBB.url}`)).toBeTruthy();
    });

    it('should create a team BBB meeting', () => {
        const meeting = { entity: 'Team', id: mockTeam1.id, formatId: mockFormat1.id, type: MeetingType.BBB } as IMeeting;
        service.authorizeAndCreateMeeting(meeting);
        const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team/${mockTeam1.id}/meeting`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ authorizationCode: '', type: 'BBB', redirectUri: '' });
        req.flush(mockMeetingBBB);
        httpMock.verify();
        expect(loggerServiceStub._traceCalls.some((e) => e.message === `[Meeting] Open Link: ${mockMeetingBBB.url}`)).toBeTruthy();
    });

    it('should inform organizer if BBB meeting cant be created', () => {
        const meeting = { entity: 'Format', id: mockFormat1.id, formatId: mockFormat1.id, type: MeetingType.BBB } as IMeeting;
        service.authorizeAndCreateMeeting(meeting);
        const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/meeting`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ authorizationCode: '', type: 'BBB', redirectUri: '' });
        const mockErrorResponse = { status: 500, statusText: 'Internal Server Error' };
        req.flush({}, mockErrorResponse);
        httpMock.verify();
        expect(snackbarServiceStub._openWithMessageCalls[0].message).toBe('errors.meeting.unableToStart');
    });

    xit('should redirect to authorization page for MSTeams', () => {
        const meeting = {
            entity: 'Format',
            id: mockFormat1.id,
            formatId: mockFormat1.id,
            type: MeetingType.MSTeams
        } as IMeeting;
        service.authorizeAndCreateMeeting(meeting);
        expect(
            loggerServiceStub._traceCalls.some(
                (e) => e.message === `[Meeting] Open login link to get authorization: ${mockAuthorizationUrlMSTeams}`
            )
        ).toBeTruthy();
    });

    it('should create a format MSTeams meeting', () => {
        const meeting = {
            entity: 'Format',
            id: mockFormat1.id,
            formatId: mockFormat1.id,
            type: MeetingType.MSTeams,
            authorizationCode: mockAuthorizationCode
        } as IMeeting;
        service.createMeeting(meeting).subscribe((response) => {
            expect(response).toEqual(mockMeetingMSTeams);
        });
        const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/meeting`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
            authorizationCode: mockAuthorizationCode,
            type: 'MSTeams',
            redirectUri: service.getMSTeamsRedirectUri()
        });
        req.flush(mockMeetingMSTeams);
        httpMock.verify();
    });

    it('should create a team MSTeams meeting', () => {
        const meeting = {
            entity: 'Team',
            id: mockTeam1.id,
            formatId: mockFormat1.id,
            type: MeetingType.MSTeams,
            authorizationCode: mockAuthorizationCode
        } as IMeeting;
        service.createMeeting(meeting).subscribe((response) => {
            expect(response).toEqual(mockMeetingMSTeams);
        });
        const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team/${mockTeam1.id}/meeting`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
            authorizationCode: mockAuthorizationCode,
            type: 'MSTeams',
            redirectUri: service.getMSTeamsRedirectUri()
        });
        req.flush(mockMeetingMSTeams);
        httpMock.verify();
    });

    it('should be able to join a format BBB meeting', () => {
        service.getFormatMeeting(mockFormat1.id).subscribe((response) => {
            expect(response).toEqual(mockMeetingBBB);
            service.joinMeeting(mockMeetingBBB.url, NavigationType.NEW_TAB);
            expect(loggerServiceStub._traceCalls.some((e) => e.message === `[Meeting] Open Link: ${mockMeetingBBB.url}`)).toBeTruthy();
        });
        const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/meeting`);
        expect(req.request.method).toBe('GET');
        req.flush(mockMeetingBBB);
        httpMock.verify();
    });

    it('should be able to join a team BBB meeting', () => {
        service.getTeamMeeting(mockFormat1.id, mockTeam1.id).subscribe((response) => {
            expect(response).toEqual(mockMeetingBBB);
            service.joinMeeting(mockMeetingBBB.url, NavigationType.NEW_TAB);
            expect(loggerServiceStub._traceCalls.some((e) => e.message === `[Meeting] Open Link: ${mockMeetingBBB.url}`)).toBeTruthy();
        });
        const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team/${mockTeam1.id}/meeting`);
        expect(req.request.method).toBe('GET');
        req.flush(mockMeetingBBB);
        httpMock.verify();
    });

    it('should be able to join a format MSTeams meeting', () => {
        service.getFormatMeeting(mockFormat1.id).subscribe((response) => {
            expect(response).toEqual(mockMeetingMSTeams);
            service.joinMeeting(mockMeetingMSTeams.url, NavigationType.NEW_TAB);
            expect(loggerServiceStub._traceCalls.some((e) => e.message === `[Meeting] Open Link: ${mockMeetingMSTeams.url}`)).toBeTruthy();
        });
        const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/meeting`);
        expect(req.request.method).toBe('GET');
        req.flush(mockMeetingMSTeams);
        httpMock.verify();
    });

    it('should be able to join a team MSTeams meeting', () => {
        service.getTeamMeeting(mockFormat1.id, mockTeam1.id).subscribe((response) => {
            expect(response).toEqual(mockMeetingMSTeams);
            service.joinMeeting(mockMeetingMSTeams.url, NavigationType.NEW_TAB);
            expect(loggerServiceStub._traceCalls.some((e) => e.message === `[Meeting] Open Link: ${mockMeetingMSTeams.url}`)).toBeTruthy();
        });
        const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team/${mockTeam1.id}/meeting`);
        expect(req.request.method).toBe('GET');
        req.flush(mockMeetingMSTeams);
        httpMock.verify();
    });

    it('should be able to delete an existing format meeting', () => {
        service.deleteMeeting('Format', mockFormat1.id, mockFormat1.id);
        const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/meeting`);
        expect(req.request.method).toBe('DELETE');
        req.flush('');
        httpMock.verify();
        expect(loggerServiceStub._traceCalls.some((e) => e.message === `[Meeting] deleted meeting`)).toBeTruthy();
        expect(snackbarServiceStub._openWithMessageCalls[0].message).toBe('snackbar.meetingCancelled');
    });
    it('should be able to delete an existing team meeting', () => {
        service.deleteMeeting('Team', mockTeam1.id, mockFormat1.id);
        const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team/${mockTeam1.id}/meeting`);
        expect(req.request.method).toBe('DELETE');
        req.flush('');
        httpMock.verify();
        expect(loggerServiceStub._traceCalls.some((e) => e.message === `[Meeting] deleted meeting`)).toBeTruthy();
        expect(snackbarServiceStub._openWithMessageCalls[0].message).toBe('snackbar.meetingCancelled');
    });

    it('should inform if an existing format meeting cannot be deleted', () => {
        service.deleteMeeting('Format', mockTeam1.id, mockFormat1.id);
        const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/meeting`);
        expect(req.request.method).toBe('DELETE');
        const mockErrorResponse = { status: 500, statusText: 'Internal Server Error' };
        req.flush('', mockErrorResponse);
        httpMock.verify();
        expect(snackbarServiceStub._openWithMessageCalls[0].message).toBe('errors.meeting.unableToDelete');
    });

    it('should inform if an existing team meeting cannot be deleted', () => {
        service.deleteMeeting('Team', mockTeam1.id, mockFormat1.id);
        const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team/${mockTeam1.id}/meeting`);
        expect(req.request.method).toBe('DELETE');
        const mockErrorResponse = { status: 500, statusText: 'Internal Server Error' };
        req.flush('', mockErrorResponse);
        httpMock.verify();
        expect(snackbarServiceStub._openWithMessageCalls[0].message).toBe('errors.meeting.unableToDelete');
    });

    it('should be able to encode and decode a meeting', () => {
        const meeting = {
            entity: 'Format',
            id: mockFormat1.id,
            formatId: mockFormat1.id,
            type: MeetingType.MSTeams
        } as IMeeting;
        let encodedMeetingInformation = service.encodeMeetingInformation(meeting);
        expect(service.decodeMeetingInformation(encodedMeetingInformation)).toEqual(meeting);
    });
});
