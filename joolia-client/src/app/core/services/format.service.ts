import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Entity, FileMeta, Format, Link, List, Permission, User, UserRole } from '../models';
import { map, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigurationService } from './configuration.service';
import { FileService } from './file.service';
import { NgxUploadService } from './ngx-upload.service';
import { UploadFile, UploadOutput } from 'ngx-uploader';
import { AuthorizationService } from './authorization.service';
import { UserService } from './user.service';
import { TranslateService } from '@ngx-translate/core';
import { IQueryParams, UtilService } from './util.service';
import { NgxOutputEvents } from '../enum/global/upload.enum';
import { FileUsage } from '../enum/global/file-usage.enum';
import { ReferenceResolverService } from './reference-resolver.service';
import { FormatMember } from '../models/format-member.model';

/**
 * The FormatService handles all http requests regarding loading and actions on formats.
 */
@Injectable({
    providedIn: 'root'
})
export class FormatService {
    formatChanged = new Subject<Format>();
    formatListChanged = new Subject<List<Format>>();

    private readonly serverConnection: string;

    private loadedFormat: Format;
    private loadedFormatList: List<Format> = { count: 0, entities: [] };

    constructor(
        private http: HttpClient,
        private fileService: FileService,
        private userService: UserService,
        private authorizationService: AuthorizationService,
        private config: ConfigurationService,
        private translate: TranslateService,
        private ngxUploadService: NgxUploadService,
        private refResolver: ReferenceResolverService
    ) {
        this.serverConnection = this.config.getServerConnection();
    }

    loadFormats(queryParams?: IQueryParams, loadMore?: boolean): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<List<Format>>(this.serverConnection + '/format', { params: httpParams })
            .pipe(
                map((formats: List<Format>) => {
                    if (loadMore) {
                        this.loadedFormatList.count = formats.count;
                        this.loadedFormatList.entities = this.loadedFormatList.entities.concat(formats.entities);
                    } else {
                        this.loadedFormatList = formats;
                    }

                    this.loadedFormatList.entities.forEach((f) => {
                        this.refResolver.resolveRef(f).subscribe();
                    });

                    this.formatListChanged.next(this.loadedFormatList);
                })
            );
    }

    loadWorkspaceFormats(workspaceId: string, queryParams?: IQueryParams, loadMore?: boolean): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<List<Format>>(`${this.serverConnection}/workspace/${workspaceId}/format`, { params: httpParams })
            .pipe(
                map((formats: List<Format>) => {
                    if (loadMore) {
                        this.loadedFormatList.count = formats.count;
                        this.loadedFormatList.entities = this.loadedFormatList.entities.concat(formats.entities);
                    } else {
                        this.loadedFormatList = formats;
                    }

                    this.loadedFormatList.entities.forEach((f) => {
                        this.refResolver.resolveRef(f).subscribe();
                    });

                    this.formatListChanged.next(this.loadedFormatList);
                })
            );
    }

    loadFormat(id: string, queryParams?: IQueryParams): Observable<Format> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<Format>(`${this.serverConnection}/format/${id}`, { params: httpParams })
            .pipe(
                map((format: Format) => {
                    this.loadedFormat = format;

                    this.refResolver.resolveRef(format).subscribe((f: Format) => {
                        this.loadedFormat = f;
                        this.formatChanged.next(this.loadedFormat);
                    });
                    return this.loadedFormat;
                })
            );
    }

    getCurrentFormat(): Format {
        return this.loadedFormat;
    }

    hasPermission(permission: Permission, format?: Format): boolean {
        const currentFormat = format ? format : this.loadedFormat;
        return this.authorizationService.hasPermission(Entity.FORMAT, currentFormat.me.userRole, permission);
    }

    createFormat(body: Partial<Format> | { name: string; workspace: string }): Observable<Format> {
        return this.http.post<Format>(`${this.serverConnection}/format`, body);
    }

    createFormatFromTemplate(formatTemplateId: string, workspaceId: string): Observable<Format> {
        return this.http.post<Format>(`${this.serverConnection}/format/_template`, { formatTemplateId, workspaceId });
    }

    patchFormat(id: string, updatedFormat: Partial<Format>): Observable<void> {
        if (updatedFormat.name === '') {
            updatedFormat.name = this.translate.instant('labels.untitledFormat');
        }

        return this.http.patch<Format>(`${this.serverConnection}/format/${id}`, updatedFormat).pipe(
            map((respondedFormat: Format) => {
                // TODO: Potential refactoring. Split into two services
                if (this.loadedFormatList) {
                    this.loadedFormatList.entities = this.loadedFormatList.entities.map((format) => {
                        return format.id === respondedFormat.id ? Object.assign({}, format, respondedFormat) : format;
                    });

                    this.formatListChanged.next(this.loadedFormatList);
                }

                if (this.loadedFormat) {
                    Object.assign(this.loadedFormat, respondedFormat);

                    this.formatChanged.next(this.loadedFormat);
                }
            })
        );
    }

    deleteFormat(id: string): Observable<void> {
        return this.http.delete(`${this.serverConnection}/format/${id}`).pipe(
            map(() => {
                this.loadedFormatList.entities = this.loadedFormatList.entities.filter((format) => format.id !== id);
                this.loadedFormatList.count--;
                this.formatListChanged.next(this.loadedFormatList);
            })
        );
    }

    loadFormatMembers(queryParams?: IQueryParams, loadMore?: boolean): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);

        return this.http
            .get<List<User>>(`${this.serverConnection}/format/${this.loadedFormat.id}/member`, { params: httpParams })
            .pipe(
                tap({ next: (members: List<User>) => members.entities.forEach((m) => this.userService.getSkills(m, queryParams)) }),
                map((memberList: List<User>) => {
                    if (loadMore) {
                        this.loadedFormat.members.count = memberList.count;
                        this.loadedFormat.members.entities = this.loadedFormat.members.entities.concat(memberList.entities);
                    } else {
                        this.loadedFormat.members = memberList;
                    }
                    this.loadedFormat.memberCount = memberList.count;
                    this.formatChanged.next(this.loadedFormat);
                })
            );
    }

    addFormatMember(formatId: string, memberEmails: string[], invitationText: string, technicalUser?: boolean): Observable<void> {
        return this.http.patch<void>(`${this.serverConnection}/format/${formatId}/member`, {
            emails: memberEmails,
            invitationText: invitationText,
            role: technicalUser ? UserRole.TECHNICAL : UserRole.PARTICIPANT
        });
    }

    removeFormatMember(formatId: string, memberEmail: string, technicalUser?: boolean): Observable<any> {
        if (technicalUser) {
            return this.http.post(`${this.serverConnection}/format/${formatId}/member/_delete`, { emails: [], role: UserRole.TECHNICAL });
        } else {
            return this.http.post(`${this.serverConnection}/format/${formatId}/member/_delete`, { emails: [memberEmail] }).pipe(
                map(() => {
                    this.loadedFormat.members.entities = this.loadedFormat.members.entities.filter((user) => user.email !== memberEmail);
                    this.loadedFormat.members.count--;
                    this.loadedFormat.memberCount = this.loadedFormat.members.count;
                    this.formatChanged.next(this.loadedFormat);
                })
            );
        }
    }

    updateFormatMemberRole(memberId: string, role: string): Observable<void> {
        return this.http
            .patch<User>(`${this.serverConnection}/format/${this.loadedFormat.id}/member/${memberId}`, { role: role })
            .pipe(
                map((respondedUser: User) => {
                    this.loadedFormat.members.entities = this.loadedFormat.members.entities.map((user) => {
                        return user.id === respondedUser.id ? Object.assign(user, respondedUser) : user;
                    });
                    if (respondedUser.id === this.userService.getCurrentLoggedInUser().id) {
                        this.loadedFormat.me.userRole = respondedUser.role;
                    }
                    this.formatChanged.next(this.loadedFormat);
                })
            );
    }

    getUserDetails(memberId: string): Observable<FormatMember> {
        return this.http.get<FormatMember>(`${this.serverConnection}/format/${this.loadedFormat.id}/member/${memberId}`);
    }

    loadFormatFilesMeta(queryParams?: IQueryParams) {
        return this.fileService.loadFilesMeta('/format/' + this.loadedFormat.id, queryParams).pipe(
            map((files) => {
                files = files.length > 0 ? this.ngxUploadService.getUploadProgressForFiles(files) : files;
                return files;
            })
        );
    }

    loadFormatFileMeta(fileId: FileMeta['id'], queryParams?: IQueryParams) {
        return this.fileService.loadFileMeta('/format/' + this.loadedFormat.id, fileId, queryParams);
    }

    loadFormatKeyVisualMeta(formatId: string, queryParams?: IQueryParams) {
        return this.fileService.loadKeyVisualMeta('/format/' + formatId, queryParams);
    }

    getDownloadLink(fileId: FileMeta['id'], download: boolean) {
        const queryParams: IQueryParams = { download: download };

        return this.fileService
            .getDownloadFileMeta('/format/' + this.loadedFormat.id, fileId, queryParams)
            .subscribe((downloadMeta: FileMeta) => {
                this.loadedFormat.files = this.loadedFormat.files.map((file) => {
                    if (file.id === fileId) {
                        if (download) {
                            file.downloadUrl = downloadMeta.fileUrl;
                        } else {
                            file.tabUrl = downloadMeta.fileUrl;
                        }
                    }
                    return file;
                });
            });
    }

    updateFile(fileId: FileMeta['id'], body: Partial<FileMeta>) {
        return this.fileService.updateFile('/format/' + this.loadedFormat.id, fileId, body).pipe(
            map((updatedMeta: FileMeta) => {
                this.loadedFormat.files = this.loadedFormat.files.map((file) => {
                    if (file.id === fileId) {
                        Object.assign(file, updatedMeta);
                    }

                    return file;
                });
                this.formatChanged.next(this.loadedFormat);
            })
        );
    }

    deleteFile(ngxUS: NgxUploadService, fileId: FileMeta['id']) {
        if (this.loadedFormat.files.find((file) => file.id === fileId).upload) {
            ngxUS.abortFileUpload(this.loadedFormat.files.find((file) => file.id === fileId));
            this.loadedFormat.files = this.loadedFormat.files.filter((file) => file.id !== fileId);
        }

        // delete file from entity
        return this.fileService.deleteFile('/format/' + this.loadedFormat.id, fileId).pipe(
            map(() => {
                this.loadedFormat.files = this.loadedFormat.files.filter((file) => file.id !== fileId);
                this.formatChanged.next(this.loadedFormat);
            })
        );
    }

    onUploadOutput(ngxUS: NgxUploadService, output: UploadOutput) {
        if (output.type === NgxOutputEvents.ALLADDEDTOQUEUE) {
            const parent = '/format/' + this.loadedFormat.id;
            const result = ngxUS['on' + output.type](output, this.loadedFormat.files, parent);
        } else {
            const result = ngxUS['on' + output.type](output, this.loadedFormat.files);

            if (
                output.type === NgxOutputEvents.REMOVEDALL ||
                output.type === NgxOutputEvents.REMOVED ||
                output.type === NgxOutputEvents.UPLOADING ||
                output.type === NgxOutputEvents.ADDEDTOQUEUE
            ) {
                this.loadedFormat.files = result;
            } else if (output.type === NgxOutputEvents.DONE) {
                this.loadedFormat.files.forEach((f) => {
                    if (f.upload && f.upload.id === output.file.id) {
                        f.upload = <UploadFile>{};
                    }
                });
            }
        }
    }

    onKeyVisualUploadOutput(parent: string, ngxUS: NgxUploadService, output: UploadOutput) {
        switch (output.type) {
            case NgxOutputEvents.ALLADDEDTOQUEUE:
                ngxUS.onallAddedToQueue(
                    output,
                    [
                        {
                            id: output.file.id,
                            name: output.file.name,
                            upload: output.file,
                            fileUsage: FileUsage.KEYVISUAL
                        } as FileMeta
                    ],
                    parent
                );
                break;
            case NgxOutputEvents.DONE:
                ngxUS.ondone(output, []);
                this.loadFormatKeyVisualMeta(this.loadedFormat.id).subscribe((keyVisual) => {
                    this.loadedFormat.keyVisual = keyVisual;
                    this.formatChanged.next(this.loadedFormat);
                });
                break;
            case NgxOutputEvents.REJECTED:
                ngxUS.onrejected(output, []);
                break;
        }
    }

    uploadKeyVisualLink(parent: string, body: any) {
        return this.http.put<any>(`${this.serverConnection}${parent}/keyvisual`, body).pipe(
            map((keyVisual: Link) => {
                this.loadedFormat.keyVisual = keyVisual;
                this.formatChanged.next(this.loadedFormat);
            })
        );
    }

    sendMail(content: string, formatId: string, memberIds?: string[]) {
        const body: any = { message: content, memberIds: memberIds };

        return this.http.post(`${this.serverConnection}/format/${formatId}/member/_sendMail`, body);
    }

    // TO BE DISCUSSED IF WE STILL NEED IT
    // deleteFormatMeetingLink(): void {
    //     this.patchFormat(this.loadedFormat.id, { meetingLink: null } as Partial<Format>).subscribe();
    // }
    //
    // editFormatMeetingLink(newLink) {
    //     return this.patchFormat(this.loadedFormat.id, { meetingLink: newLink } as Partial<Format>);
    // }
}
