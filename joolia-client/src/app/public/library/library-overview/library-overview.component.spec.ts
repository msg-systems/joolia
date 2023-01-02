import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryOverviewComponent } from './library-overview.component';
import { LibraryService, UserService } from '../../../core/services';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRouteStub } from '../../../../testing/activated-route-stub';
import { DialogStub, getMockData, LibraryServiceStub, UserServiceStub } from '../../../../testing/unitTest';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

const activatedRouteStub = new ActivatedRouteStub();
const libraryServiceStub = new LibraryServiceStub();
const userServiceStub = new UserServiceStub();
const dialogStub = new DialogStub({ name: 'createdLibrary' });
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

let mockLibraryList1;

describe('LibraryOverviewComponent', () => {
    let component: LibraryOverviewComponent;
    let fixture: ComponentFixture<LibraryOverviewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), InfiniteScrollModule],
            declarations: [LibraryOverviewComponent],
            providers: [
                { provide: LibraryService, useValue: libraryServiceStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: MatDialog, useValue: dialogStub },
                { provide: MatSnackBar, useValue: {} }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(LibraryOverviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        libraryServiceStub._resetStubCalls();

        mockLibraryList1 = getMockData('library.list.list1');
    }));

    it('should load libraries', () => {
        component.getInitialLibraries();
        expect(libraryServiceStub._loadLibrariesCalls.length).toBe(1);
    });

    it('should navigate to libraries', () => {
        component.onLibraryClick('12345678');
        expect(routerSpy.navigate.calls.mostRecent().args[0][1]).toBe('12345678');
    });

    it('should create workspace', () => {
        component.onLibraryCreate();
        expect(libraryServiceStub._createLibraryCalls.length).toBe(1);
        const createdLibrary = libraryServiceStub._createLibraryCalls.pop();
        expect(createdLibrary.name).toBe('createdLibrary');
    });

    it('should update libraries', () => {
        component.libraryList = mockLibraryList1;
        component.onLibraryUpdate(mockLibraryList1.entities[0].id, 'test2');
        expect(libraryServiceStub._patchLibraryCalls.length).toBe(1);
        expect(libraryServiceStub._patchLibraryCalls.pop()).toEqual({
            libraryId: mockLibraryList1.entities[0].id,
            updatedLibrary: Object({ name: 'test2' })
        });
    });

    it('should delete libraries', () => {
        component.libraryList = mockLibraryList1;
        component.onLibraryDelete(mockLibraryList1.entities[0].id);
        expect(libraryServiceStub._deleteLibraryCalls.length).toBe(1);
        expect(libraryServiceStub._deleteLibraryCalls.pop()).toBe(mockLibraryList1.entities[0].id);
    });
});
