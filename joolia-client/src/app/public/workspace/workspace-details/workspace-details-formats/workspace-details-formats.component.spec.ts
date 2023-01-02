import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormatService, SnackbarService, ViewTypeService, WorkspaceService } from '../../../../core/services';
import { MatDialog } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    FormatServiceStub,
    getMockData,
    SnackbarServiceStub,
    TranslateServiceStub,
    ViewTypeServiceStub,
    WorkspaceServiceStub
} from '../../../../../testing/unitTest';
import { DialogStub } from '../../../../../testing/unitTest';
import { ActivatedRoute, Router } from '@angular/router';
import { FormatCreationMethod } from '../../../../shared/components/format-create-dialog/format-create-dialog.component';
import { WorkspaceDetailsFormatsComponent } from './workspace-details-formats.component';
import { ActivatedRouteStub } from '../../../../../testing/activated-route-stub';
const workspaceServiceStub = new WorkspaceServiceStub();
const formatServiceStub = new FormatServiceStub();
const dialogStub = new DialogStub(FormatCreationMethod.Template);
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
const translateServiceStub = new TranslateServiceStub();
const snackbarServiceStub = new SnackbarServiceStub();
const activeRouteServiceStub = new ActivatedRouteStub();
const viewTypeServiceStub = new ViewTypeServiceStub();

let mockWorkspace;
let mockFormat;

describe('WorkspaceDetailsFormatComponent', () => {
    let component: WorkspaceDetailsFormatsComponent;
    let fixture: ComponentFixture<WorkspaceDetailsFormatsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WorkspaceDetailsFormatsComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: WorkspaceService, useValue: workspaceServiceStub },
                { provide: FormatService, useValue: formatServiceStub },
                { provide: MatDialog, useValue: dialogStub },
                { provide: Router, useValue: routerSpy },
                { provide: TranslateService, useValue: translateServiceStub },
                { provide: SnackbarService, useValue: snackbarServiceStub },
                { provide: ActivatedRoute, useValue: activeRouteServiceStub },
                { provide: ViewTypeService, useValue: viewTypeServiceStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(WorkspaceDetailsFormatsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mockWorkspace = getMockData('workspace.workspace1');
        mockFormat = getMockData('format.format1');

        translateServiceStub._resetStubCalls();
    });

    describe('', () => {
        beforeEach(() => {
            component.ngOnInit();
            fixture.detectChanges();
            formatServiceStub._resetStubCalls();
            workspaceServiceStub._resetStubCalls();
        });

        it('should navigate to format', () => {
            component.onFormatClick(mockFormat.id);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['format', mockFormat.id]);
        });

        describe('Create Format', () => {
            it('should create a blank format and navigate', () => {
                routerSpy.navigate.calls.reset();
                dialogStub.setDefaultReply(FormatCreationMethod.Blank);
                component.onFormatCreate();
                expect(formatServiceStub._createFormatCalls.length).toEqual(1);
                const body = formatServiceStub._createFormatCalls.pop().body;
                expect(body.workspace).toEqual(mockWorkspace.id);
                expect(routerSpy.navigate).toHaveBeenCalledWith(['format', mockFormat.id]);
            });

            it('should create format from template and navigate', () => {
                routerSpy.navigate.calls.reset();
                const dialogReply = FormatCreationMethod.Template;
                dialogStub.setDefaultReply(dialogReply);
                component.onFormatCreate();
                expect(formatServiceStub._createFormatFromTemplateCalls.length).toEqual(1);
                const args = formatServiceStub._createFormatFromTemplateCalls.pop();
                expect(args.formatTemplateId).toEqual(dialogReply);
                expect(args.workspaceId).toEqual(mockWorkspace.id);
                expect(routerSpy.navigate).toHaveBeenCalledWith(['format', mockFormat.id]);
            });
        });
    });
});
