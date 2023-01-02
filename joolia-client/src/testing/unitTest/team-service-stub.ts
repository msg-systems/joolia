import { UploadOutput } from 'ngx-uploader';
import { Observable, of, Subject } from 'rxjs';
import { FileMeta, List, Team, User } from '../../app/core/models';
import { IQueryParams, NgxUploadService, TeamService } from '../../app/core/services';
import { getMockData } from './mock-data';

export class TeamServiceStub implements Partial<TeamService> {
    public _getPossibleNewMembersForTeamCalls: any[] = [];
    public _getPossibleTeamsToAddToCalls: any[] = [];
    public _addTeamMembersCalls: any[] = [];
    public _removeTeamMemberCalls: any[] = [];
    public _deleteTeamCalls: any[] = [];
    public _updateTeamCalls: any[] = [];
    public _loadTeamAvatarMetaCalls: any[] = [];
    public _loadTeamFilesMetaCalls: any[] = [];
    public _deleteFileCalls: any[] = [];
    public _getDownloadLinkCalls: any[] = [];
    public _onUploadOutputCalls: any[] = [];
    public _loadTeamsCalls: any[] = [];

    public addedTeamMembers: string[] = [];
    public deletedTeamMembers: string[] = [];
    public teamDeleted = false;
    public updatedTeamName = '';

    public teamChanged = new Subject<Team>();
    public teamListChanged = new Subject<List<Team>>();

    getPossibleNewMembersForTeam(formatId: string, teamId: string): Observable<List<User>> {
        this._getPossibleNewMembersForTeamCalls.push([formatId, teamId]);
        return of({ count: 2, entities: [getMockData('user.anakin') as User, getMockData('user.george') as User] });
    }

    loadTeam(teamId: string, queryParams?: IQueryParams): Observable<Team> {
        this.teamChanged.next(getMockData('team.team1') as Team);
        return of();
    }

    addTeamMembers(formatId, teamId, newUsers): Observable<User[]> {
        this._addTeamMembersCalls.push([formatId, teamId, newUsers]);
        this.addedTeamMembers.push(...newUsers);
        return of();
    }

    getPossibleTeamsToAddTo(formatId: string, memberId: string, queryParams?: IQueryParams): Observable<List<Team>> {
        this._getPossibleTeamsToAddToCalls.push([formatId, memberId]);
        return of({ count: 1, entities: [getMockData('team.team1') as Team] });
    }

    removeTeamMember(formatId, teamId, email): Observable<any> {
        this._removeTeamMemberCalls.push([formatId, teamId, email]);
        this.deletedTeamMembers.push(email);
        return of(true);
    }

    deleteTeam(formatId, teamId): Observable<any> {
        this._deleteTeamCalls.push([formatId, teamId]);
        this.teamDeleted = true;
        return of();
    }

    updateTeam(formatId, teamId, name: { name: string }): Observable<any> {
        this._updateTeamCalls.push([formatId, teamId, name]);
        this.updatedTeamName = name.name;
        return of();
    }

    loadTeamAvatarMeta(teamId: string, httpParams?): Observable<FileMeta> {
        this._loadTeamAvatarMetaCalls.push([teamId, httpParams]);
        return of();
    }

    loadTeamFilesMeta(queryParams?: IQueryParams) {
        this._loadTeamFilesMetaCalls.push([queryParams]);
        return of(getMockData('file.set.set1'));
    }

    deleteFile(ngxUS: NgxUploadService, fileId: FileMeta['id']) {
        this._deleteFileCalls.push([ngxUS, fileId]);
        return of<void>();
    }

    getDownloadLink(fileId: FileMeta['id'], download: boolean) {
        this._getDownloadLinkCalls.push([fileId]);
        return of().subscribe();
    }

    onUploadOutput(ngxUS: NgxUploadService, output: UploadOutput) {
        this._onUploadOutputCalls.push([ngxUS, output]);
        return;
    }

    loadTeams(formatId: string, queryParams?: IQueryParams, loadMore?: boolean): Observable<void> {
        this._loadTeamsCalls.push({ formatId: formatId, queryParams: queryParams, loadMore: loadMore });
        this.teamListChanged.next(getMockData('team.list.list1') as List<Team>);
        return of();
    }

    getCurrentTeams(): List<Team> {
        return getMockData('team.list.list1') as List<Team>;
    }

    _toHaveBeenCalledWith(method: string, params: any[]) {
        return !!this[`${'_' + method + 'Calls'}`.toString()].indexOf(params);
    }

    _resetStubCalls() {
        this._getPossibleNewMembersForTeamCalls.length = 0;
        this._getPossibleTeamsToAddToCalls.length = 0;
        this._addTeamMembersCalls.length = 0;
        this._removeTeamMemberCalls.length = 0;
        this._deleteTeamCalls.length = 0;
        this._updateTeamCalls.length = 0;
        this._loadTeamAvatarMetaCalls.length = 0;
        this._loadTeamFilesMetaCalls.length = 0;
        this._deleteFileCalls.length = 0;
        this._loadTeamAvatarMetaCalls.length = 0;
        this._getDownloadLinkCalls.length = 0;
        this._onUploadOutputCalls.length = 0;
        this._loadTeamsCalls.length = 0;
    }
}
