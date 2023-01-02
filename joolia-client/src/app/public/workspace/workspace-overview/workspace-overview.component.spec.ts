import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { of } from 'rxjs';
import { ActivatedRouteStub } from '../../../../testing/activated-route-stub';
import {
    ConfigurationServiceStub,
    DialogStub,
    getMockData,
    LoggerServiceStub,
    UserServiceStub,
    WorkspaceServiceStub
} from '../../../../testing/unitTest';
import { MaterialModule } from '../../../core/components';
import { ConfigurationService, LoggerService, UserService, WorkspaceService } from '../../../core/services';
import { SharedModule } from '../../../shared/shared.module';
import { WorkspaceOverviewComponent } from './workspace-overview.component';

const configurationServiceStub = new ConfigurationServiceStub();
const workspaceServiceStub = new WorkspaceServiceStub();
const userServiceStub = new UserServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const dialogStub = new DialogStub({ name: 'createdWorkspace', licensesCount: 10 });
const routeStub = new ActivatedRouteStub({ id: 99999 });
const routerSpy = {
    events: of(),
    navigate: jasmine.createSpy(),
    url: '',
    createUrlTree: (commands, navExtras = {}) => {},
    serializeUrl: () => ''
};

let mockWorkspaceList1;

describe('WorkspaceOverviewComponent', () => {
    let component: WorkspaceOverviewComponent;
    let fixture: ComponentFixture<WorkspaceOverviewComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WorkspaceOverviewComponent],
            imports: [
                MaterialModule,
                TranslateModule.forRoot(),
                SharedModule,
                NoopAnimationsModule,
                HttpClientTestingModule,
                InfiniteScrollModule,
                RouterTestingModule.withRoutes([])
            ],
            providers: [
                CookieService,
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: WorkspaceService, useValue: workspaceServiceStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: routeStub },
                { provide: MatDialog, useValue: dialogStub },
                { provide: LoggerService, useValue: loggerServiceStub }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(WorkspaceOverviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        workspaceServiceStub._resetStubCalls();

        mockWorkspaceList1 = getMockData('workspace.list.list1');
    });

    it('should load workspaces', () => {
        component.getInitialWorkspaces();
        expect(workspaceServiceStub._loadWorkspaceCalls.length).toBe(1);
    });

    it('should navigate to workspaces', () => {
        component.onWorkspaceClick('12345678');
        expect(routerSpy.navigate.calls.mostRecent().args[0][1]).toBe('12345678');
    });

    it('should create workspace', () => {
        component.onWorkspaceCreate();
        expect(workspaceServiceStub._createWorkspaceCalls.length).toBe(1);
        const createdWorkspace = workspaceServiceStub._createWorkspaceCalls.pop();
        expect(createdWorkspace.name).toBe('createdWorkspace');
        expect(createdWorkspace.licensesCount).toBe(10);
    });

    it('should update workspaces', () => {
        component.workspaceList = mockWorkspaceList1;
        component.onWorkspaceUpdate(mockWorkspaceList1.entities[0].id, 'test2');
        expect(workspaceServiceStub._patchWorkspaceCalls.length).toBe(1);
        expect(workspaceServiceStub._patchWorkspaceCalls.pop()).toEqual({
            workspaceId: mockWorkspaceList1.entities[0].id,
            updatedWorkspace: Object({ name: 'test2' })
        });
    });

    it('should delete workspaces', () => {
        component.workspaceList = mockWorkspaceList1;
        component.onWorkspaceDelete(mockWorkspaceList1.entities[0].id);
        expect(workspaceServiceStub._deleteWorkspaceCalls.length).toBe(1);
        expect(workspaceServiceStub._deleteWorkspaceCalls.pop()).toBe(mockWorkspaceList1.entities[0].id);
    });
});
