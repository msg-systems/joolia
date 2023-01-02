import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormatDetailsInformationComponent } from './format-details-information.component';
import {
    ActivityService,
    ConfigurationService,
    FormatService,
    FormatTemplateService,
    LibraryService,
    LoggerService,
    NotificationService,
    NotificationTransportObject,
    PhaseService,
    TeamService,
    UserService
} from '../../../../core/services';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'ngx-moment';
import { HttpClient } from '@angular/common/http';
import { HasPermissionDirective } from '../../../../shared/directives';
import {
    ActivityServiceStub,
    ConfigurationServiceStub,
    DialogStub,
    FormatServiceStub,
    getMockData,
    LinkEditDialogStub,
    NotificationServiceStub,
    PhaseServiceStub,
    TeamServiceStub
} from '../../../../../testing/unitTest';
import { LinkEditDialogComponent } from '../../../../shared/components/link-edit-dialog/link-edit-dialog.component';
import { AddLinkTargetPipe } from '../../../../shared/pipes';
import { of } from 'rxjs';

const formatServiceStub = new FormatServiceStub();
const phaseServiceStub = new PhaseServiceStub();
const activityServiceStub = new ActivityServiceStub();
const teamServiceStub = new TeamServiceStub();
const configurationServiceStub = new ConfigurationServiceStub();
const notificationServiceStub = new NotificationServiceStub();

const mockFormat1 = getMockData('format.format1');
const dialogStub = new DialogStub(true);
const linkDialogStub = new LinkEditDialogStub(true);

const routerSpy = {
    events: of(),
    navigate: jasmine.createSpy(),
    url: `/format/${mockFormat1.id}/information`
};

describe('FormatDetailsInformationComponent', () => {
    let component: FormatDetailsInformationComponent;
    let fixture: ComponentFixture<FormatDetailsInformationComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MomentModule],
            declarations: [FormatDetailsInformationComponent, HasPermissionDirective, AddLinkTargetPipe],
            providers: [
                { provide: FormatService, useValue: formatServiceStub },
                { provide: PhaseService, useValue: phaseServiceStub },
                { provide: ActivityService, useValue: activityServiceStub },
                { provide: TeamService, useValue: teamServiceStub },
                { provide: LibraryService, useValue: {} },
                { provide: FormatTemplateService, useValue: {} },
                { provide: MatDialog, useValue: dialogStub },
                { provide: LinkEditDialogComponent, useValue: linkDialogStub },
                { provide: Router, useValue: routerSpy },
                { provide: MatSnackBar, useValue: {} },
                { provide: HttpClient, useValue: {} },
                { provide: LoggerService, useValue: {} },
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: UserService, useValue: {} },
                { provide: NotificationService, useValue: notificationServiceStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(FormatDetailsInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        formatServiceStub._resetStubCalls();
    });

    it('should update formats', () => {
        component.initFormat(mockFormat1);
        component.onFormatUpdate('name', mockFormat1.name);
        expect(formatServiceStub._patchFormatCalls.length).toBe(0);

        component.onFormatUpdate('shortDescription', 'Updated Description');
        expect(formatServiceStub._patchFormatCalls.length).toBe(1);

        const updatedFormat = formatServiceStub._patchFormatCalls.pop().updatedFormat;
        expect(Object.keys(updatedFormat).length).toBe(1);
        expect(updatedFormat.shortDescription).toBe('Updated Description');
    });

    describe('Notifications', () => {
        it('should join format notifications room', fakeAsync(() => {
            notificationServiceStub._resetStubCalls();
            component.ngOnInit();
            fixture.detectChanges();
            tick();

            const room =
                `${ConfigurationService.getConfiguration().configuration.websocket.rooms.notifications.format}` + `${mockFormat1.id}`;
            expect(notificationServiceStub._initCalls.length).toEqual(1);
            expect(notificationServiceStub._joinRoomCalls.length).toEqual(1);
            expect(notificationServiceStub._joinRoomCalls.pop().room).toEqual(room);
        }));

        it('should leave room on destroy', () => {
            notificationServiceStub._resetStubCalls();
            component.ngOnDestroy();

            const room =
                `${ConfigurationService.getConfiguration().configuration.websocket.rooms.notifications.format}` + `${mockFormat1.id}`;
            expect(notificationServiceStub._leaveRoomCalls.length).toEqual(1);
            expect(notificationServiceStub._leaveRoomCalls.pop().room).toEqual(room);
        });
    });
});
