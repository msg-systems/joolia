import { IQueryParams, WorkspaceService } from '../../app/core/services';
import { Observable, of, Subject } from 'rxjs';
import { AdminConsentEmail, Entity, InvitationData, List, Permission, User, Workspace } from '../../app/core/models';
import { getMockData } from './mock-data';

export class WorkspaceServiceStub implements Partial<WorkspaceService> {
    public _loadWorkspaceCalls: any[] = [];
    public _createWorkspaceCalls: any[] = [];
    public _patchWorkspaceCalls: any[] = [];
    public _deleteWorkspaceCalls: any[] = [];
    public _addWorkspaceMembersCalls: any[] = [];
    public _loadWorkspaceMembersCalls: any[] = [];
    public _loadWorkspaceUsersCalls: any[] = [];
    public _removeWorkspaceMemberCalls: any[] = [];
    public _patchWorkspaceMemberCalls: any[] = [];
    public _hasPermissionCalls: any[] = [];
    public _sendAdminConsentEmailCalls: any[] = [];

    workspaceListChanged = new Subject<List<Workspace>>();
    workspaceChanged = new Subject<Workspace>();

    hasPermission(permission: Permission, workspace?: Workspace): boolean {
        this._hasPermissionCalls.push({ permission, workspace });
        return true;
    }

    loadWorkspaces(queryParams?: IQueryParams): Observable<void> {
        this._loadWorkspaceCalls.push(queryParams);
        return of();
    }

    createWorkspace(body: Workspace): Observable<void> {
        this._createWorkspaceCalls.push(body);
        return of();
    }

    patchWorkspace(workspaceId: string, updatedWorkspace: Partial<Workspace>): Observable<void> {
        this._patchWorkspaceCalls.push({ workspaceId: workspaceId, updatedWorkspace: updatedWorkspace });
        return of();
    }

    deleteWorkspace(workspaceId: string): Observable<void> {
        this._deleteWorkspaceCalls.push(workspaceId);
        return of();
    }

    getCurrentWorkspace(): Workspace {
        return getMockData('workspace.workspace1');
    }

    loadWorkspaceMembers(workspaceId: string, queryParams?: IQueryParams): Observable<void> {
        this.workspaceChanged.next(getMockData('workspace.workspace1'));
        this._loadWorkspaceMembersCalls.push({ workspaceId: workspaceId, queryParams: queryParams });
        return of();
    }

    loadWorkspaceUsers(workspaceId: string, queryParams?: IQueryParams): Observable<List<User>> {
        this._loadWorkspaceUsersCalls.push({ workspaceId: workspaceId, queryParams: queryParams });
        return of(getMockData('workspace.workspace1').members);
    }

    addWorkspaceMembers(workspaceId: string, invitationBody: InvitationData): Observable<void> {
        this._addWorkspaceMembersCalls.push({ workspaceId: workspaceId, invitationBody: invitationBody });
        return of();
    }

    removeWorkspaceMember(workspaceId: string, deletionBody: { emails: string[] }): Observable<void> {
        this._removeWorkspaceMemberCalls.push({ workspaceId: workspaceId, deletionBody: deletionBody });
        return of();
    }

    patchWorkspaceMember(workspaceId: string, id: string, body: any): Observable<User> {
        this._patchWorkspaceMemberCalls.push({ workspaceId: workspaceId, id: id, body: body });
        return of();
    }

    sendAdminConsentEmail(workspaceId: string, adminConsentEmail: AdminConsentEmail): Observable<void> {
        this._sendAdminConsentEmailCalls.push({ workspaceId: workspaceId, adminConsentEmail: adminConsentEmail });
        return of();
    }

    _resetStubCalls() {
        this._loadWorkspaceCalls.length = 0;
        this._createWorkspaceCalls.length = 0;
        this._patchWorkspaceCalls.length = 0;
        this._deleteWorkspaceCalls.length = 0;
        this._addWorkspaceMembersCalls.length = 0;
        this._loadWorkspaceMembersCalls.length = 0;
        this._loadWorkspaceUsersCalls.length = 0;
        this._removeWorkspaceMemberCalls.length = 0;
        this._patchWorkspaceMemberCalls.length = 0;
        this._hasPermissionCalls.length = 0;
        this._sendAdminConsentEmailCalls.length = 0;
    }
}
