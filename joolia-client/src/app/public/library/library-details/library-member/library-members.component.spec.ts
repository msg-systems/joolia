import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryMembersComponent } from './library-members.component';
import { LibraryService, UserService, ViewTypeService } from '../../../../core/services';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogStub, getMockData, LibraryServiceStub, ViewTypeServiceStub } from '../../../../../testing/unitTest';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ViewType } from '../../../../core/enum/global/view-type.enum';
import { UserStatusFilter } from '../../../../core/enum/global/filter.enum';

const libraryServiceStub = new LibraryServiceStub();
const viewTypeServiceStub = new ViewTypeServiceStub();
const dialogStub = new DialogStub({ emails: ['test@test.com', 'hans@test.de'] });
let _snackbarOpenMessage: string;
const snackbarStub = {
    open(message) {
        _snackbarOpenMessage = message;
    }
};

let mockLibrary1;
let mockUserLuke;

describe('LibraryMembersComponent', () => {
    let component: LibraryMembersComponent;
    let fixture: ComponentFixture<LibraryMembersComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LibraryMembersComponent],
            imports: [TranslateModule.forRoot(), InfiniteScrollModule],
            providers: [
                { provide: LibraryService, useValue: libraryServiceStub },
                { provide: MatDialog, useValue: dialogStub },
                { provide: MatSnackBar, useValue: snackbarStub },
                { provide: UserService, useValue: {} },
                { provide: ViewTypeService, useValue: viewTypeServiceStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(LibraryMembersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        libraryServiceStub._resetStubCalls();

        mockLibrary1 = getMockData('library.library1');
        mockUserLuke = getMockData('user.luke');
    }));

    it('should load library members onInit', () => {
        expect(component.library.members).toEqual(mockLibrary1.members);
    });

    it('should add library members when the input data is correct', () => {
        component.onAddMember();
        expect(libraryServiceStub._addLibraryMembersCalls.length).toBe(1);
        expect(libraryServiceStub._addLibraryMembersCalls[0].invitationBody.emails.length).toBe(2);
    });

    it('should remove exactly the correct user', () => {
        component.onRemoveMember(mockUserLuke.id);
        expect(libraryServiceStub._removeLibraryMemberCalls.length).toBe(1);
        expect(libraryServiceStub._removeLibraryMemberCalls[0].deletionBody).toEqual({ emails: [mockUserLuke.email] });
    });

    it('should load view type from ViewTypeService', () => {
        expect(component.memberViewType).toBe(ViewType.CARD_VIEW);
    });

    it('should switch between views', async () => {
        component.onViewTypeChanged(ViewType.LIST_VIEW);
        expect(viewTypeServiceStub._setMemberViewTypeChangedCalls.length).toBe(1);
        expect(viewTypeServiceStub._setMemberViewTypeChangedCalls.pop()).toBe(ViewType.LIST_VIEW);
    });

    it('should load filtered library members', () => {
        component.onFilterChange([[UserStatusFilter.PENDING]]);
        expect(libraryServiceStub._loadLibraryMembersCalls.length).toBe(1);
        const args = libraryServiceStub._loadLibraryMembersCalls.pop();
        expect(args.queryParams).toEqual(
            jasmine.objectContaining({
                filter: 'pending=true'
            })
        );
    });
});
