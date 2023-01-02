import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    ActivityService,
    ConfigurationService,
    FormatService,
    CanvasService,
    LoggerService,
    NgxUploadService,
    PhaseService,
    SnackbarService,
    NotificationService,
    NotificationTransportObject
} from '../../../../core/services';
import { MatDialog } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
    ActivityServiceStub,
    ConfigurationServiceStub,
    FormatServiceStub,
    CanvasServiceStub,
    getMockData,
    LoggerServiceStub,
    NgxUploadServiceStub,
    PhaseServiceStub,
    TranslateServiceStub,
    LinkEditDialogStub,
    NotificationServiceStub
} from '../../../../../testing/unitTest';
import { ActivityDetailsMainComponent } from './activity-details-main.component';
import { Canvas, LinkEntry } from '../../../../core/models';
import { HasPermissionDirective } from '../../../../shared/directives';
import { HttpClient } from '@angular/common/http';
import { cloneDeep } from 'lodash-es';
import { AddLinkTargetPipe } from '../../../../shared/pipes';
import { Router } from '@angular/router';
import { of } from 'rxjs';

const formatServiceStub = new FormatServiceStub();
const activityServiceStub = new ActivityServiceStub();
const phaseServiceStub = new PhaseServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const configurationServiceStub = new ConfigurationServiceStub();
const translateServiceStub = new TranslateServiceStub();
const dialogStub = new LinkEditDialogStub({ linkUrl: 'www.test.de', description: 'test link' } as LinkEntry);
const ngxUploadServiceStub = new NgxUploadServiceStub();
const canvasServiceStub = new CanvasServiceStub();
const notificationServiceStub = new NotificationServiceStub();

const mockFormat = getMockData('format.format1');
const mockPhase = getMockData('phase.phase1');
const mockActivity = getMockData('activity.activity1');

const routerSpy = {
    events: of(),
    navigate: jasmine.createSpy(),
    url: `/format/dummyId/phase/dummyId/activity/${mockActivity.id}/details`
};

describe('ActivityDetailsMain', () => {
    let component: ActivityDetailsMainComponent;
    let fixture: ComponentFixture<ActivityDetailsMainComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            declarations: [ActivityDetailsMainComponent, HasPermissionDirective, AddLinkTargetPipe],
            providers: [
                { provide: FormatService, useValue: formatServiceStub },
                { provide: ActivityService, useValue: activityServiceStub },
                { provide: PhaseService, useValue: phaseServiceStub },
                { provide: HttpClient, useValue: {} },
                { provide: TranslateService, useValue: translateServiceStub },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: SnackbarService, useValue: {} },
                { provide: NgxUploadService, useValue: ngxUploadServiceStub },
                { provide: MatDialog, useValue: dialogStub },
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: CanvasService, useValue: canvasServiceStub },
                { provide: Router, useValue: routerSpy },
                { provide: NotificationService, useValue: notificationServiceStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ActivityDetailsMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        translateServiceStub._resetStubCalls();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
        component.initActivity(mockActivity);
    });

    it('should update activity description', () => {
        component.initActivity(mockActivity);
        component.onActivityUpdate('description', 'New description');
        expect(activityServiceStub._updateActivityCalls[0].updatedValue.description).toEqual('New description');
        expect(activityServiceStub._updateActivityCalls[0].formatId).toEqual(mockFormat.id);
        expect(activityServiceStub._updateActivityCalls[0].phaseId).toEqual(mockPhase.id);
        expect(activityServiceStub._updateActivityCalls[0].id).toEqual(mockActivity.id);
    });

    it('should add link', () => {
        dialogStub.setDefaultReplyAfterClosed({ linkUrl: 'www.test.de', description: 'test link' } as LinkEntry);
        component.initActivity(mockActivity);
        component.onLinkAdd();
        dialogStub.editLinkClicked.emit('www.test.de');
        expect(activityServiceStub._addLinkCalls[0].link.linkUrl).toEqual('www.test.de');
    });

    it('should delete link', () => {
        component.initActivity(cloneDeep(mockActivity));
        component.onLinkDelete(0);
        // mock ConfirmationDiag-Response
        expect(activityServiceStub._deleteLinkCalls[0].formatId).toEqual(mockFormat.id);
        expect(activityServiceStub._deleteLinkCalls[0].phaseId).toEqual(mockPhase.id);
        expect(activityServiceStub._deleteLinkCalls[0].linkId).toEqual(mockActivity.collaborationLinks[0].id);
    });

    it('should add canvas', () => {
        dialogStub.setDefaultReplyAfterClosed({ name: 'My Canvas Name', slots: [] } as Canvas);
        component.initActivity(mockActivity);
        component.onCanvasAdd();
        expect(canvasServiceStub._createCanvasCalls[0].canvas.name).toEqual('My Canvas Name');
        expect(
            routerSpy.navigate.calls
                .mostRecent()
                .args[0].pop()
                .toString()
        ).toBe('123');
    });

    describe('Notifications', () => {
        it('should join activity notifications room', fakeAsync(() => {
            notificationServiceStub._resetStubCalls();
            component.ngOnInit();
            component.initActivity(mockActivity);
            fixture.detectChanges();
            tick();

            const room =
                `${ConfigurationService.getConfiguration().configuration.websocket.rooms.notifications.activity}` + `${mockActivity.id}`;
            expect(notificationServiceStub._initCalls.length).toEqual(1);
            expect(notificationServiceStub._joinRoomCalls.length).toEqual(1);
            expect(notificationServiceStub._joinRoomCalls.pop().room).toEqual(room);
        }));

        it('should leave room on destroy', () => {
            notificationServiceStub._resetStubCalls();
            component.initActivity(mockActivity);
            component.ngOnDestroy();

            const room =
                `${ConfigurationService.getConfiguration().configuration.websocket.rooms.notifications.activity}` + `${mockActivity.id}`;
            expect(notificationServiceStub._leaveRoomCalls.length).toEqual(1);
            expect(notificationServiceStub._leaveRoomCalls.pop().room).toEqual(room);
        });
    });
});
