import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    ActivityService,
    AuthenticationService,
    CanvasService,
    ConfigurationService,
    FormatService,
    LoggerService,
    NotificationService,
    NotificationTransportObject,
    TeamService,
    UserService,
    UtilService
} from '../../../core/services';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
    ActivityServiceStub,
    AuthenticationServiceStub,
    CanvasServiceStub,
    FormatServiceStub,
    getMockData,
    LoggerServiceStub,
    NotificationServiceStub,
    TeamServiceStub,
    TranslateServiceStub,
    UserServiceStub
} from '../../../../testing/unitTest';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CanvasDetailsComponent } from './canvas-details.component';
import { ActivatedRouteStub } from '../../../../testing/activated-route-stub';
import { SubmissionModifySetting, SubmissionSubmitter, SubmissionViewSetting } from '../../../core/enum/global/submission.enum';
import { CanvasSubmission, UpdateEventBody, UserRole } from '../../../core/models';

const formatServiceStub = new FormatServiceStub();
const activityServiceStub = new ActivityServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const translateServiceStub = new TranslateServiceStub();
const canvasServiceStub = new CanvasServiceStub();
const teamServiceStub = new TeamServiceStub();
const userServiceStub = new UserServiceStub();
const authenticationServiceStub = new AuthenticationServiceStub();
const notificationServiceStub = new NotificationServiceStub();

const mockFormat = getMockData('format.format1');
const mockPhase = getMockData('phase.phase1');
const mockActivity = getMockData('activity.activity1');
const mockCanvas = getMockData('canvas.canvas1');
const mockTeamList = getMockData('team.list.list1');
const mockUserLuke = getMockData('user.luke');
const mockUserLeia = getMockData('user.leia');
const mockCanvasSubmissions = getMockData('canvasSubmission.list.list1');

const activeRouteServiceStub = new ActivatedRouteStub({
    phaseId: mockPhase.id,
    activityId: mockActivity.id,
    canvasId: mockCanvas.id
});

describe('CanvasDetails', () => {
    let component: CanvasDetailsComponent;
    let fixture: ComponentFixture<CanvasDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            declarations: [CanvasDetailsComponent],
            providers: [
                { provide: UtilService, useValue: UtilService },
                { provide: NotificationService, useValue: notificationServiceStub },
                { provide: FormatService, useValue: formatServiceStub },
                { provide: ActivityService, useValue: activityServiceStub },
                { provide: HttpClient, useValue: {} },
                { provide: TranslateService, useValue: translateServiceStub },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: CanvasService, useValue: canvasServiceStub },
                { provide: TeamService, useValue: teamServiceStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
                { provide: ActivatedRoute, useValue: activeRouteServiceStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(CanvasDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        translateServiceStub._resetStubCalls();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should load entities', () => {
            spyOn(component, 'loadCanvas').and.callThrough();
            spyOn(component, 'loadSubmitterSelectionList').and.callThrough();

            component.ngOnInit();
            fixture.detectChanges();

            expect(component.format.id).toEqual(mockFormat.id);
            expect(component.phaseId).toEqual(mockPhase.id);
            expect(component.activity.id).toEqual(mockActivity.id);
            expect(component.loadCanvas).toHaveBeenCalledWith(mockCanvas.id);
            expect(component.loadSubmitterSelectionList).toHaveBeenCalled();
        });
    });

    describe('Notifications', () => {
        it('should join canvas notifications room', fakeAsync(() => {
            notificationServiceStub._resetStubCalls();
            component.ngOnInit();
            fixture.detectChanges();
            tick();

            const room =
                `${ConfigurationService.getConfiguration().configuration.websocket.rooms.notifications.canvas}` + `${mockCanvas.id}`;
            expect(notificationServiceStub._initCalls.length).toEqual(1);
            expect(notificationServiceStub._joinRoomCalls.length).toEqual(1);
            expect(notificationServiceStub._joinRoomCalls.pop().room).toEqual(room);
        }));

        it('should reload submissions on notification', () => {
            component.ngOnInit();
            fixture.detectChanges();

            spyOn(component, 'loadSubmissions').and.callThrough();

            notificationServiceStub.canvasChangedWS.next(<NotificationTransportObject>{});

            expect(component.loadSubmissions).toHaveBeenCalled();
        });

        it('should leave room on destroy', () => {
            notificationServiceStub._resetStubCalls();
            component.ngOnDestroy();

            const room =
                `${ConfigurationService.getConfiguration().configuration.websocket.rooms.notifications.canvas}` + `${mockCanvas.id}`;
            expect(notificationServiceStub._leaveRoomCalls.length).toEqual(1);
            expect(notificationServiceStub._leaveRoomCalls.pop().room).toEqual(room);
        });
    });

    describe('Submitter Dropdown', () => {
        beforeEach(() => {
            component.ngOnInit();
            fixture.detectChanges();
        });

        describe('loadSubmitterSelectionList', () => {
            it('should load teams for configuration Team Submissions and add ALL option for organizer', () => {
                teamServiceStub._resetStubCalls();
                component.format.me.userRole = UserRole.ORGANIZER;
                component.canvasInput.isOrganizer = true;
                component.activity.configuration.submissionModifySetting = SubmissionModifySetting.TEAM;
                component.submitterForm.valueChanges.subscribe((value) => {
                    expect(component.submitterSelectOptions.length).toEqual(mockTeamList.count + 1);
                    expect(value.submitter).toEqual(SubmissionSubmitter.ALL);
                });
                component.loadSubmitterSelectionList();
                expect(teamServiceStub._loadTeamsCalls.length).toEqual(1);
            });

            it('should load teams for configuration Team Submissions without ALL option for member', () => {
                teamServiceStub._resetStubCalls();
                component.format.me.userRole = UserRole.PARTICIPANT;
                component.canvasInput.isOrganizer = false;
                component.activity.configuration.submissionModifySetting = SubmissionModifySetting.TEAM;
                component.submitterForm.valueChanges.subscribe((value) => {
                    expect(component.submitterSelectOptions.length).toEqual(mockTeamList.count);
                    expect(value.submitter.id).toEqual(mockTeamList[0].id);
                });
                component.loadSubmitterSelectionList();
                expect(teamServiceStub._loadTeamsCalls.length).toEqual(1);
            });

            it('should load members for configuration Member Submissions and organizer and add ALL option for organizer', () => {
                formatServiceStub._resetStubCalls();
                component.format.me.userRole = UserRole.ORGANIZER;
                component.canvasInput.isOrganizer = true;
                component.activity.configuration.submissionModifySetting = SubmissionModifySetting.MEMBER;
                component.submitterForm.valueChanges.subscribe((value) => {
                    expect(component.submitterSelectOptions.length).toEqual(mockFormat.members.count + 1);
                    expect(value.submitter.id).toEqual(mockUserLuke.id);
                });
                component.loadSubmitterSelectionList();
                expect(formatServiceStub._loadFormatMembersCalls.length).toEqual(1);
            });

            it('should load members for configuration Member Submissions and View Setting Member with ALL option for participant', () => {
                formatServiceStub._resetStubCalls();
                component.format.me.userRole = UserRole.PARTICIPANT;
                component.canvasInput.isOrganizer = false;
                component.activity.configuration.submissionViewSetting = SubmissionViewSetting.MEMBER;
                component.activity.configuration.submissionModifySetting = SubmissionModifySetting.MEMBER;
                component.submitterForm.valueChanges.subscribe((value) => {
                    expect(component.submitterSelectOptions.length).toEqual(mockFormat.members.count + 1);
                    expect(component.submitterSelectOptions[0].value).toEqual(SubmissionSubmitter.ALL);
                    expect(value.submitter.id).toEqual(mockUserLuke.id);
                });
                component.loadSubmitterSelectionList();
                expect(formatServiceStub._loadFormatMembersCalls.length).toEqual(1);
            });

            it('should show own user as only option for configuration Member Submissions', () => {
                formatServiceStub._resetStubCalls();
                component.format.me.userRole = UserRole.PARTICIPANT;
                component.canvasInput.isOrganizer = false;
                component.activity.configuration.submissionViewSetting = SubmissionViewSetting.SUBMITTER;
                component.activity.configuration.submissionModifySetting = SubmissionModifySetting.MEMBER;
                component.submitterForm.valueChanges.subscribe((value) => {
                    expect(component.submitterSelectOptions.length).toEqual(1);
                    expect(value.submitter.id).toEqual(mockUserLuke.id);
                });
                component.loadSubmitterSelectionList();
                expect(formatServiceStub._loadFormatMembersCalls.length).toEqual(0);
            });
        });

        it('should load submissions on value change and update canvasInput', () => {
            const loadSpy = spyOn(component, 'loadSubmissions').and.callThrough();
            component.canvasInput.displaySubmitterName = false;
            component.canvasInput.isSubmissionCreatable = false;
            component.activity.configuration.submissionModifySetting = SubmissionModifySetting.MEMBER;
            component.submitterForm.valueChanges.subscribe(() => {
                expect(component.loadSubmissions).toHaveBeenCalled();
                expect(component.canvasInput.displaySubmitterName).toEqual(true);
                expect(component.canvasInput.isSubmissionCreatable).toEqual(true);
            });
            component.submitterForm.setValue({
                submitter: SubmissionSubmitter.ALL
            });
            expect(loadSpy).toHaveBeenCalled();
        });
    });

    describe('Canvas', () => {
        beforeEach(() => {
            component.ngOnInit();
            fixture.detectChanges();
            component.canvas = mockCanvas;
            canvasServiceStub._resetStubCalls();
        });

        it('should loadCanvas', () => {
            component.loadCanvas(mockCanvas.id);

            expect(canvasServiceStub._loadCanvasCalls.length).toEqual(1);
            const args = canvasServiceStub._loadCanvasCalls.pop();
            expect(args.formatId).toEqual(mockFormat.id);

            expect(args.phaseId).toEqual(mockPhase.id);
            expect(args.activityId).toEqual(mockActivity.id);
            expect(args.canvasId).toEqual(mockCanvas.id);
        });

        it('should editCanvas', () => {
            const updateEvent = <UpdateEventBody>{
                updatedFieldName: 'title',
                updatedFieldValue: 'My new Canvas Name'
            };

            component.editCanvas(updateEvent);

            expect(canvasServiceStub._updateCanvasCalls.length).toEqual(1);
            const args = canvasServiceStub._updateCanvasCalls.pop();

            expect(args.formatId).toEqual(mockFormat.id);
            expect(args.phaseId).toEqual(mockPhase.id);
            expect(args.activityId).toEqual(mockActivity.id);
            expect(args.canvasId).toEqual(mockCanvas.id);
            expect(args.body.title).toEqual(updateEvent.updatedFieldValue);
        });

        it('should editSlot', () => {
            const slotId = '123';
            const updateEvent = <UpdateEventBody>{
                updatedObjectId: slotId,
                updatedFieldName: 'title',
                updatedFieldValue: 'My new Slot Title'
            };

            component.editCanvasSlot(updateEvent);

            expect(canvasServiceStub._updateSlotCalls.length).toEqual(1);
            const args = canvasServiceStub._updateSlotCalls.pop();

            expect(args.formatId).toEqual(mockFormat.id);
            expect(args.phaseId).toEqual(mockPhase.id);
            expect(args.activityId).toEqual(mockActivity.id);
            expect(args.canvasId).toEqual(mockCanvas.id);
            expect(args.slotId).toEqual(slotId);
            expect(args.body.title).toEqual(updateEvent.updatedFieldValue);
        });
    });

    describe('Canvas Submissions', () => {
        beforeEach(() => {
            component.ngOnInit();
            fixture.detectChanges();
            component.canvas = mockCanvas;
            component.format = mockFormat;
            component.activity.configuration.submissionModifySetting = SubmissionModifySetting.MEMBER;
            canvasServiceStub._resetStubCalls();
        });

        describe('loadSubmissions', () => {
            it('should load all submissions for organizer and submitter option ALL', () => {
                component.format.me.userRole = UserRole.ORGANIZER;
                component.canvasInput.isOrganizer = true;
                component.canvasInput.isSubmissionEditable = false;
                component.submitterForm.setValue({
                    submitter: SubmissionSubmitter.ALL
                });
                canvasServiceStub._resetStubCalls();

                component.loadSubmissions();

                expect(component.canvasInput.isSubmissionEditable).toEqual(true);
                expect(canvasServiceStub._loadSubmissionsCalls.length).toEqual(1);
                const args = canvasServiceStub._loadSubmissionsCalls.pop();

                expect(args.formatId).toEqual(mockFormat.id);
                expect(args.phaseId).toEqual(mockPhase.id);
                expect(args.activityId).toEqual(mockActivity.id);
                expect(args.canvasId).toEqual(mockCanvas.id);
                expect(args.queryParams.filter).toBeUndefined();
            });

            it('should load submissions for a specific submitter', () => {
                component.format.me.userRole = UserRole.PARTICIPANT;
                component.canvasInput.isOrganizer = false;
                component.canvasInput.isSubmissionEditable = true;
                component.activity.configuration.submissionModifySetting = SubmissionModifySetting.MEMBER;
                component.submitterForm.setValue({
                    submitter: mockUserLeia
                });
                canvasServiceStub._resetStubCalls();

                component.loadSubmissions();

                expect(component.canvasInput.isSubmissionEditable).toEqual(false);
                expect(canvasServiceStub._loadSubmissionsCalls.length).toEqual(1);
                const args = canvasServiceStub._loadSubmissionsCalls.pop();

                expect(args.formatId).toEqual(mockFormat.id);
                expect(args.phaseId).toEqual(mockPhase.id);
                expect(args.activityId).toEqual(mockActivity.id);
                expect(args.canvasId).toEqual(mockCanvas.id);
                expect(args.queryParams.filter).toEqual(`submittedBy=${mockUserLeia.id}`);
            });
        });

        it('should addCanvasSubmission', () => {
            component.submitterForm.setValue({
                submitter: mockUserLeia
            });
            component.submissions = [];
            const submission: Partial<CanvasSubmission> = {
                slotId: '123',
                content: 'This is a new submission',
                color: 'rgba(0, 255, 200, 0.9)'
            };

            component.addCanvasSubmission(submission);

            expect(canvasServiceStub._createSubmissionCalls.length).toEqual(1);
            const args = canvasServiceStub._createSubmissionCalls.pop();

            expect(args.formatId).toEqual(mockFormat.id);
            expect(args.phaseId).toEqual(mockPhase.id);
            expect(args.activityId).toEqual(mockActivity.id);
            expect(args.canvasId).toEqual(mockCanvas.id);
            expect(args.slotId).toEqual(submission.slotId);
            expect(args.body.content).toEqual(submission.content);
            expect(args.body.color).toEqual(submission.color);
            expect(args.body.submittedById).toEqual(mockUserLeia.id);
            expect(component.submissions.length).toEqual(1);
        });

        it('should updateCanvasSubmissionContent', () => {
            component.submissions = mockCanvasSubmissions.entities;
            const submission = component.submissions[0];
            const updateEvent = <UpdateEventBody>{
                updatedObjectId: { slotId: submission.slotId, submissionId: submission.id },
                updatedFieldValue: 'This is an updated submission'
            };
            component.editCanvasSubmissionContent(updateEvent);

            expect(canvasServiceStub._updateSubmissionCalls.length).toEqual(1);
            const args = canvasServiceStub._updateSubmissionCalls.pop();

            expect(args.formatId).toEqual(mockFormat.id);
            expect(args.phaseId).toEqual(mockPhase.id);
            expect(args.activityId).toEqual(mockActivity.id);
            expect(args.canvasId).toEqual(mockCanvas.id);
            expect(args.submissionId).toEqual(submission.id);
            expect(args.body.content).toEqual(updateEvent.updatedFieldValue);
            expect(component.submissions[0].content).toEqual(updateEvent.updatedFieldValue);
        });

        it('should updateCanvasSubmissionColor', () => {
            component.submissions = mockCanvasSubmissions.entities;
            const submission = component.submissions[0];
            const updateEvent = <UpdateEventBody>{
                updatedObjectId: { slotId: submission.slotId, submissionId: submission.id },
                updatedFieldValue: 'rgba(0, 255, 200, 0.9)'
            };
            component.editCanvasSubmissionColor(updateEvent);

            expect(canvasServiceStub._updateSubmissionCalls.length).toEqual(1);
            const args = canvasServiceStub._updateSubmissionCalls.pop();

            expect(args.formatId).toEqual(mockFormat.id);
            expect(args.phaseId).toEqual(mockPhase.id);
            expect(args.activityId).toEqual(mockActivity.id);
            expect(args.canvasId).toEqual(mockCanvas.id);
            expect(args.submissionId).toEqual(submission.id);
            expect(args.body.color).toEqual(updateEvent.updatedFieldValue);
            expect(component.submissions[0].color).toEqual(updateEvent.updatedFieldValue);
        });

        it('should vote submission and then remove vote', () => {
            component.submissions = mockCanvasSubmissions.entities;
            const submission = component.submissions[0];
            submission.me = { isVotedByMe: false };
            submission.voteCount = 0;
            component.onVoteSubmissionClicked(submission);

            expect(canvasServiceStub._voteSubmissionCalls.length).toEqual(1);
            const args = canvasServiceStub._voteSubmissionCalls.pop();

            expect(args.formatId).toEqual(mockFormat.id);
            expect(args.phaseId).toEqual(mockPhase.id);
            expect(args.activityId).toEqual(mockActivity.id);
            expect(args.canvasId).toEqual(mockCanvas.id);
            expect(args.submissionId).toEqual(submission.id);
            expect(submission.me.isVotedByMe).toEqual(true);
            expect(submission.voteCount).toEqual(1);

            component.onVoteSubmissionClicked(submission);

            expect(canvasServiceStub._removeVoteSubmissionCalls.length).toEqual(1);
            const args2 = canvasServiceStub._removeVoteSubmissionCalls.pop();

            expect(args2.formatId).toEqual(mockFormat.id);
            expect(args2.phaseId).toEqual(mockPhase.id);
            expect(args2.activityId).toEqual(mockActivity.id);
            expect(args2.canvasId).toEqual(mockCanvas.id);
            expect(args2.submissionId).toEqual(submission.id);
            expect(component.submissions[0].me.isVotedByMe).toEqual(false);
            expect(component.submissions[0].voteCount).toEqual(0);
        });

        it('should deleteCanvasSubmission', () => {
            const slotId = '1';
            const submissionId = '123';

            component.deleteCanvasSubmission({ slotId: slotId, submissionId: submissionId });

            expect(canvasServiceStub._deleteSubmissionCalls.length).toEqual(1);
            const args = canvasServiceStub._deleteSubmissionCalls.pop();

            expect(args.formatId).toEqual(mockFormat.id);
            expect(args.phaseId).toEqual(mockPhase.id);
            expect(args.activityId).toEqual(mockActivity.id);
            expect(args.canvasId).toEqual(mockCanvas.id);
            expect(args.slotId).toEqual(slotId);
            expect(args.submissionId).toEqual(submissionId);
        });
    });
});
