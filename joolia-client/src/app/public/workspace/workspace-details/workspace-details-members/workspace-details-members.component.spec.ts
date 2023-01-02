import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkspaceDetailsMembersComponent } from './workspace-details-members.component';
import { UserService, ViewTypeService, WorkspaceService } from '../../../../core/services';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { getMockData, ViewTypeServiceStub, WorkspaceServiceStub } from '../../../../../testing/unitTest';
import { DialogStub } from '../../../../../testing/unitTest';
import { ViewType } from '../../../../core/enum/global/view-type.enum';
import { ActivatedRouteStub } from '../../../../../testing/activated-route-stub';
import { ActivatedRoute } from '@angular/router';
import { UserRoleFilter, UserStatusFilter } from '../../../../core/enum/global/filter.enum';

const workspaceServiceStub = new WorkspaceServiceStub();
const viewTypeServiceStub = new ViewTypeServiceStub();
const dialogStub = new DialogStub({ emails: ['test@test.com', 'hans@test.de'] });
let _snackbarOpenMessage: string;
const snackbarStub = {
    open(message) {
        _snackbarOpenMessage = message;
    }
};
const activatedRouteStub = new ActivatedRouteStub();

let mockUserLuke;

describe('WorkspaceDetailsMembersComponent', () => {
    let component: WorkspaceDetailsMembersComponent;
    let fixture: ComponentFixture<WorkspaceDetailsMembersComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WorkspaceDetailsMembersComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: WorkspaceService, useValue: workspaceServiceStub },
                { provide: MatDialog, useValue: dialogStub },
                { provide: MatSnackBar, useValue: snackbarStub },
                { provide: UserService, useValue: {} },
                { provide: ViewTypeService, useValue: viewTypeServiceStub },
                { provide: ActivatedRoute, useValue: activatedRouteStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(WorkspaceDetailsMembersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        workspaceServiceStub._resetStubCalls();

        mockUserLuke = getMockData('user.luke');
    });

    it('should load workspace members', () => {
        component.getInitialWorkspaceMembers();
        expect(workspaceServiceStub._loadWorkspaceMembersCalls.length).toBe(1);
    });

    it('should add workspace members when the input data is correct', () => {
        component.onAddMember();
        expect(workspaceServiceStub._addWorkspaceMembersCalls.length).toBe(1);
        expect(workspaceServiceStub._addWorkspaceMembersCalls[0].invitationBody.emails.length).toBe(2);
    });

    it('should remove exactly the correct user', () => {
        component.onRemoveMember(mockUserLuke.id);
        expect(workspaceServiceStub._removeWorkspaceMemberCalls.length).toBe(1);
        expect(workspaceServiceStub._removeWorkspaceMemberCalls[0].deletionBody).toEqual({ emails: [mockUserLuke.email] });
    });

    it('should load view type from ViewTypeService', () => {
        expect(component.memberViewType).toBe(ViewType.CARD_VIEW);
    });

    it('should switch between views', async () => {
        component.onViewTypeChanged(ViewType.LIST_VIEW);
        expect(viewTypeServiceStub._setMemberViewTypeChangedCalls.length).toBe(1);
        expect(viewTypeServiceStub._setMemberViewTypeChangedCalls.pop()).toBe(ViewType.LIST_VIEW);
    });

    it('should load filtered workspace members', () => {
        component.onFilterChange([[UserStatusFilter.REGISTERED], [UserRoleFilter.ADMIN]]);
        expect(workspaceServiceStub._loadWorkspaceMembersCalls.length).toBe(1);
        const args = workspaceServiceStub._loadWorkspaceMembersCalls.pop();
        expect(args.queryParams).toEqual(
            jasmine.objectContaining({
                filter: 'pending=false,admin=true'
            })
        );
    });
});
