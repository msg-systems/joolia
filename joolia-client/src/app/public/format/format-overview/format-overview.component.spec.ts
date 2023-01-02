import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SessionStorageService } from 'ngx-webstorage';
import { ActivatedRouteStub } from '../../../../testing/activated-route-stub';
import { FormatServiceStub, getMockData, SessionStorageServiceStub, ViewTypeServiceStub } from '../../../../testing/unitTest';
import { FormatService, FormatTemplateService, LibraryService, WorkspaceService, ViewTypeService } from '../../../core/services';
import { AddLinkTargetPipe, MomentPipe } from '../../../shared/pipes';
import { FormatOverviewComponent } from './format-overview.component';

const formatServiceStub = new FormatServiceStub();
const viewTypeServiceStub = new ViewTypeServiceStub();
const sessionStorageServiceStub = new SessionStorageServiceStub();
const activatedRouteStub = new ActivatedRouteStub();
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

let mockFormat1;
let mockFormatList1;

describe('FormatOverviewComponent', () => {
    let component: FormatOverviewComponent;
    let fixture: ComponentFixture<FormatOverviewComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), InfiniteScrollModule, MatMenuModule],
            declarations: [FormatOverviewComponent, MomentPipe, AddLinkTargetPipe],
            providers: [
                { provide: FormatService, useValue: formatServiceStub },
                { provide: ViewTypeService, useValue: viewTypeServiceStub },
                { provide: WorkspaceService, useValue: {} },
                { provide: LibraryService, useValue: {} },
                { provide: FormatTemplateService, useValue: {} },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: MatDialog, useValue: {} },
                { provide: MatSnackBar, useValue: {} },
                { provide: SessionStorageService, useValue: sessionStorageServiceStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(FormatOverviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        formatServiceStub._resetStubCalls();

        mockFormat1 = getMockData('format.format1');
        mockFormatList1 = getMockData('format.list.list1');
    });

    it('should navigate to formats', () => {
        component.onFormatClick(mockFormat1.id);
        expect(routerSpy.navigate.calls.mostRecent().args[0][1]).toBe(mockFormat1.id);
    });

    it('should update the name of a format', () => {
        component.formatList = mockFormatList1;
        component.onFormatUpdate(mockFormatList1.entities[0].id, 'Test');
        expect(formatServiceStub._patchFormatCalls.length).toBe(1);
        component.onFormatUpdate(mockFormatList1.entities[0].id, 'New Format');
        expect(formatServiceStub._patchFormatCalls.pop().updatedFormat.name).toBe('New Format');
    });
});
