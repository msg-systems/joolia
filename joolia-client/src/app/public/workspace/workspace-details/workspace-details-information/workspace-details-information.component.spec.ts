import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigurationService, FormatService, ReferenceResolverService, WorkspaceService } from '../../../../core/services';
import { MatDialog } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    FormatServiceStub,
    getMockData,
    ReferenceResolverServiceStub,
    TranslateServiceStub,
    WorkspaceServiceStub
} from '../../../../../testing/unitTest';
import { DialogStub } from '../../../../../testing/unitTest';
import { Router } from '@angular/router';
import { WorkspaceDetailsInformationComponent } from './workspace-details-information.component';
import { FormatCreationMethod } from '../../../../shared/components/format-create-dialog/format-create-dialog.component';
const workspaceServiceStub = new WorkspaceServiceStub();
const formatServiceStub = new FormatServiceStub();
const dialogStub = new DialogStub(FormatCreationMethod.Template);
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
const translateServiceStub = new TranslateServiceStub();
const referenceResolverServiceStub = new ReferenceResolverServiceStub();

let mockUserLuke;
let mockWorkspace;
let mockFormat;

describe('WorkspaceDetailsInformationComponent', () => {
    let component: WorkspaceDetailsInformationComponent;
    let fixture: ComponentFixture<WorkspaceDetailsInformationComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WorkspaceDetailsInformationComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: WorkspaceService, useValue: workspaceServiceStub },
                { provide: FormatService, useValue: formatServiceStub },
                { provide: MatDialog, useValue: dialogStub },
                { provide: Router, useValue: routerSpy },
                { provide: TranslateService, useValue: translateServiceStub },
                { provide: ReferenceResolverService, useValue: referenceResolverServiceStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(WorkspaceDetailsInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mockUserLuke = getMockData('user.luke');
        mockWorkspace = getMockData('workspace.workspace1');
        mockFormat = getMockData('format.format1');

        translateServiceStub._resetStubCalls();
    });

    it('ngOnInit should load initial data', () => {
        const getWsSpy = spyOn(component, 'getInitialWorkspaceAdmins').and.callThrough();
        const getFSpy = spyOn(component, 'getInitialFormats').and.callThrough();
        workspaceServiceStub._resetStubCalls();
        component.ngOnInit();
        expect(component.workspace).toEqual(mockWorkspace);
        expect(workspaceServiceStub._hasPermissionCalls.length).toEqual(1);
        expect(getWsSpy).toHaveBeenCalled();
        expect(getFSpy).toHaveBeenCalled();
    });

    describe('', () => {
        beforeEach(() => {
            component.ngOnInit();
            fixture.detectChanges();
            formatServiceStub._resetStubCalls();
            workspaceServiceStub._resetStubCalls();
            referenceResolverServiceStub._resetStubCalls();
        });

        it('should load formats', () => {
            component.getInitialFormats();
            expect(formatServiceStub._loadWorkspaceFormatsCalls.length).toEqual(1);
            const args = formatServiceStub._loadWorkspaceFormatsCalls.pop();
            expect(args.workspaceId).toEqual(mockWorkspace.id);
            expect(args.loadMore).toEqual(false);
            expect(args.queryParams).toEqual(
                jasmine.objectContaining({
                    select: ConfigurationService.getConfiguration().configuration.queryParams.workspace.select.formatOverview,
                    order: 'name',
                    skip: 0,
                    take: ConfigurationService.getConfiguration().configuration.pagination.workspaceOverview.formatAmount
                })
            );
        });

        it('should load admins', () => {
            component.getInitialWorkspaceAdmins();
            expect(workspaceServiceStub._loadWorkspaceUsersCalls.length).toEqual(1);
            const args = workspaceServiceStub._loadWorkspaceUsersCalls.pop();
            expect(args.workspaceId).toEqual(mockWorkspace.id);
            expect(args.queryParams).toEqual(
                jasmine.objectContaining({
                    select: ConfigurationService.getConfiguration().configuration.queryParams.workspace.select.adminMembersOverview,
                    order: 'name',
                    filter: 'admin=true',
                    skip: 0,
                    take: ConfigurationService.getConfiguration().configuration.pagination.workspaceOverview.adminAmount
                })
            );

            expect(component.adminList.entities).toEqual(jasmine.arrayContaining(mockWorkspace.members.entities));
            expect(referenceResolverServiceStub._resolveRefCalls.length).toEqual(mockWorkspace.members.count);
        });

        it('should navigate to format', () => {
            component.onFormatClick(mockFormat.id);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['format', mockFormat.id]);
        });

        it('should update workspace', () => {
            component.onWorkspaceUpdate('name', 'New Workspace Name');
            expect(workspaceServiceStub._patchWorkspaceCalls.length).toEqual(1);
            const args = workspaceServiceStub._patchWorkspaceCalls.pop();
            expect(args.workspaceId).toEqual(mockWorkspace.id);
            expect(args.updatedWorkspace.name).toEqual('New Workspace Name');
        });
    });
});
