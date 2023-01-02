import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReferenceResolverService, UserService, WorkspaceService } from '../../../../core/services';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { getMockData, ReferenceResolverServiceStub, UserServiceStub, WorkspaceServiceStub } from '../../../../../testing/unitTest';
import { WorkspaceDetailsAdministrationComponent } from './workspace-details-administration.component';
import { MomentModule } from 'ngx-moment';
import { MomentPipe } from '../../../../shared/pipes';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { UserRole } from '../../../../core/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

const workspaceServiceStub = new WorkspaceServiceStub();
const userServiceStub = new UserServiceStub();
const referenceResolverStub = new ReferenceResolverServiceStub();
let _snackbarOpenMessage: string;
const snackbarStub = {
    open(message) {
        _snackbarOpenMessage = message;
    }
};

let mockUserLuke;
let mockLeiaUser;

describe('WorkspaceDetailsAdministrationComponent', () => {
    let component: WorkspaceDetailsAdministrationComponent;
    let fixture: ComponentFixture<WorkspaceDetailsAdministrationComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WorkspaceDetailsAdministrationComponent, MomentPipe],
            imports: [TranslateModule.forRoot(), MomentModule, MatMenuModule, MatTableModule, MatDialogModule],
            providers: [
                { provide: WorkspaceService, useValue: workspaceServiceStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: ReferenceResolverService, useValue: referenceResolverStub },
                { provide: MatSnackBar, useValue: snackbarStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(WorkspaceDetailsAdministrationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        workspaceServiceStub._resetStubCalls();

        mockUserLuke = getMockData('user.luke');
        mockLeiaUser = getMockData('user.leia');
    });

    it('should load workspace members', () => {
        component.loadUsers(0, 10);
        expect(workspaceServiceStub._loadWorkspaceUsersCalls.length).toBe(1);
    });

    it('should remove exactly the correct user', () => {
        component.onUserDelete(mockUserLuke.id);
        expect(workspaceServiceStub._removeWorkspaceMemberCalls.length).toBe(1);
        expect(workspaceServiceStub._removeWorkspaceMemberCalls[0].deletionBody).toEqual({ emails: [mockUserLuke.email] });
    });

    it('should update the role of the user', () => {
        component.onUserChangeRole(mockLeiaUser.id);
        expect(workspaceServiceStub._patchWorkspaceMemberCalls.length).toBe(1);
        expect(workspaceServiceStub._patchWorkspaceMemberCalls[0].body).toEqual({ role: UserRole.ADMIN });
    });
});
