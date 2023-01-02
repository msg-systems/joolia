import { FormatService, IQueryParams, UtilService } from '../../app/core/services';
import { FileMeta, Format, List, Permission, UserRole } from '../../app/core/models';
import { Observable, of, Subject } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { getMockData } from './mock-data';
import { FormatMember } from 'src/app/core/models/format-member.model';

export class FormatServiceStub implements Partial<FormatService> {
    formatChanged = new Subject<Format>();
    formatListChanged = new Subject<List<Format>>();

    public _patchFormatCalls: any[] = [];
    public _addFormatMembersCalls: any[] = [];
    public _loadFormatMembersCalls: any[] = [];
    public _removeFormatMemberCalls: any[] = [];
    public _updateFormatMemberRoleCalls: any[] = [];
    public _updateFormatLinkCalls: any[] = [];
    public _deleteFormatLinkCalls: any[] = [];
    public _loadWorkspaceFormatsCalls: any[] = [];
    public _createFormatCalls: any[] = [];
    public _createFormatFromTemplateCalls: any[] = [];
    public _sendMailCalls: any[] = [];
    public _getUserDetails: any[] = [];

    patchFormat(id: string, updatedFormat: Partial<Format>): Observable<void> {
        this._patchFormatCalls.push({ id: id, updatedFormat: updatedFormat });
        return of();
    }

    deleteFormat(id: string): Observable<void> {
        return of();
    }

    loadFormats(queryParams?: IQueryParams): Observable<void> {
        return of();
    }

    loadFormat(id: string, queryParams?: IQueryParams): Observable<Format> {
        return of(getMockData('format.format1'));
    }

    createFormat(body: Partial<Format>): Observable<Format> {
        this._createFormatCalls.push({ body });
        return of(<Format>{ id: getMockData('format.format1').id });
    }

    createFormatFromTemplate(formatTemplateId: string, workspaceId: string): Observable<Format> {
        this._createFormatFromTemplateCalls.push({ formatTemplateId, workspaceId });
        return of(<Format>{ id: getMockData('format.format1').id });
    }

    getCurrentFormat(): Format {
        return getMockData('format.format1');
    }

    hasPermission(permission: Permission, format?: Format): boolean {
        return true;
    }

    loadFormatMembers(queryParams?: IQueryParams): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        this.formatChanged.next(getMockData('format.format1'));
        this._loadFormatMembersCalls.push({ queryParams });
        return of();
    }

    addFormatMember(_formatId: string, memberEmails: string[], invitationText: string, _technicalUser?: boolean): Observable<void> {
        this._addFormatMembersCalls.push({ memberEmails: memberEmails, invitationText: invitationText });
        return of();
    }

    removeFormatMember(_formatId: string, memberEmail: string, _technicalUser?: boolean): Observable<void> {
        this._removeFormatMemberCalls.push({ memberEmail: memberEmail });
        return of();
    }

    updateFormatMemberRole(memberId: string, role: string): Observable<void> {
        this._updateFormatMemberRoleCalls.push({ memberId: memberId, role: role });

        const copiedMock = getMockData('format.format1');

        copiedMock.members.entities.map((member) => {
            if (member.id === memberId) {
                member.role = role === UserRole.ORGANIZER ? UserRole.ORGANIZER : UserRole.PARTICIPANT;
            }
            return member;
        });

        this.formatChanged.next(copiedMock);
        return of();
    }

    editFormatMeetingLink(link): Observable<void> {
        this._updateFormatLinkCalls.push(link);
        return of();
    }
    deleteFormatMeetingLink(): void {
        this._deleteFormatLinkCalls.push();
    }
    loadFormatFilesMeta(): Observable<FileMeta[]> {
        return of();
    }

    loadFormatKeyVisualMeta(formatId: string): Observable<FileMeta> {
        return of();
    }

    isTeamNameUnique(name: string): Observable<boolean> {
        const copiedMock = getMockData('format.format1');
        return of(!(copiedMock.teams.entities[0].name === name));
    }

    loadWorkspaceFormats(workspaceId: string, queryParams?: IQueryParams, loadMore?: boolean): Observable<void> {
        this._loadWorkspaceFormatsCalls.push({ workspaceId, queryParams, loadMore });
        return of();
    }

    sendMail(message, formatId, memberId?) {
        this._sendMailCalls.push({ message: 'message12345', formatId: formatId, memberId: memberId });
        return of();
    }

    getUserDetails(_memberId: string): Observable<FormatMember> {
        return of();
    }

    _resetStubCalls() {
        this._patchFormatCalls.length = 0;
        this._patchFormatCalls.length = 0;
        this._addFormatMembersCalls.length = 0;
        this._loadFormatMembersCalls.length = 0;
        this._removeFormatMemberCalls.length = 0;
        this._updateFormatMemberRoleCalls.length = 0;
        this._loadWorkspaceFormatsCalls.length = 0;
        this._createFormatCalls.length = 0;
        this._createFormatFromTemplateCalls.length = 0;
        this._sendMailCalls.length = 0;
    }
}
