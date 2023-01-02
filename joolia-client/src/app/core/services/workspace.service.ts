import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigurationService } from './configuration.service';
import { AdminConsentEmail, Entity, FileMeta, InvitationData, List, Permission, User, Workspace } from '../models';
import { map, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { IQueryParams, UtilService } from './util.service';
import { UserService } from './user.service';
import { ReferenceResolverService } from './reference-resolver.service';
import { NgxUploadService } from './ngx-upload.service';
import { UploadOutput } from 'ngx-uploader';
import { NgxOutputEvents } from '../enum/global/upload.enum';
import { FileUsage } from '../enum/global/file-usage.enum';
import { FileService } from './file.service';
import { AuthorizationService } from './authorization.service';

/**
 * The WorkspaceService handles all http requests regarding loading and actions on workspaces.
 */
@Injectable({
    providedIn: 'root'
})
export class WorkspaceService {
    workspaceChanged = new Subject<Workspace>();
    workspaceListChanged = new Subject<List<Workspace>>();

    private readonly serverConnection: string;

    private loadedWorkspace: Workspace;
    private loadedWorkspaceList: List<Workspace> = { count: 0, entities: [] };

    constructor(
        private http: HttpClient,
        private config: ConfigurationService,
        private translate: TranslateService,
        private userService: UserService,
        private fileService: FileService,
        private refResolver: ReferenceResolverService,
        private authorizationService: AuthorizationService
    ) {
        this.serverConnection = this.config.getServerConnection();
    }

    loadWorkspaces(queryParams?: IQueryParams, loadMore?: boolean): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);

        return this.http
            .get<List<Workspace>>(this.serverConnection + '/workspace', { params: httpParams })
            .pipe(
                map((workspaces: List<Workspace>) => {
                    if (loadMore) {
                        this.loadedWorkspaceList.count = workspaces.count;
                        this.loadedWorkspaceList.entities = this.loadedWorkspaceList.entities.concat(workspaces.entities);
                    } else {
                        this.loadedWorkspaceList = workspaces;
                    }
                    this.workspaceListChanged.next(this.loadedWorkspaceList);
                })
            );
    }

    loadWorkspace(workspaceId: string, queryParams?: IQueryParams): Observable<Workspace> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);

        return this.http
            .get<Workspace>(`${this.serverConnection}/workspace/${workspaceId}`, { params: httpParams })
            .pipe(
                map((workspace: Workspace) => {
                    this.loadedWorkspace = workspace;
                    this.workspaceChanged.next(this.loadedWorkspace);

                    return workspace;
                })
            );
    }

    getCurrentWorkspaces() {
        return {
            count: this.loadedWorkspaceList.count,
            entities: this.loadedWorkspaceList.entities.slice()
        };
    }

    getCurrentWorkspace() {
        return this.loadedWorkspace;
    }

    createWorkspace(body: Partial<Workspace>): Observable<void> {
        return this.http.post<Workspace>(`${this.serverConnection}/workspace`, body).pipe(
            map((workspace: Workspace) => {
                this.loadedWorkspaceList.entities.push(workspace);
                this.loadedWorkspaceList.count++;
                this.workspaceListChanged.next(this.loadedWorkspaceList);
            })
        );
    }

    patchWorkspace(workspaceId: string, updatedWorkspace: Partial<Workspace>) {
        if (updatedWorkspace.name === '') {
            updatedWorkspace.name = this.translate.instant('labels.untitledWorkspace');
        }
        return this.http.patch<Workspace>(`${this.serverConnection}/workspace/${workspaceId}`, updatedWorkspace).pipe(
            map((respondedWorkspace: Workspace) => {
                this.loadedWorkspaceList.entities = this.loadedWorkspaceList.entities.map((workspace) => {
                    return workspace.id === respondedWorkspace.id ? Object.assign(workspace, respondedWorkspace) : workspace;
                });

                this.workspaceListChanged.next(this.loadedWorkspaceList);
            })
        );
    }

    deleteWorkspace(workspaceId: string): Observable<void> {
        return this.http.delete(`${this.serverConnection}/workspace/${workspaceId}`).pipe(
            map(() => {
                this.loadedWorkspaceList.entities = this.loadedWorkspaceList.entities.filter((workspace) => workspace.id !== workspaceId);
                this.loadedWorkspaceList.count--;
                this.workspaceListChanged.next(this.loadedWorkspaceList);
            })
        );
    }

    loadWorkspaceMembers(workspaceId: string, queryParams?: IQueryParams, loadMore?: boolean): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);

        return this.http
            .get<List<User>>(`${this.serverConnection}/workspace/${workspaceId}/member`, { params: httpParams })
            .pipe(
                tap({
                    next: (members) =>
                        members.entities.forEach((m) =>
                            this.userService.getSkills(m, { select: ConfigurationService.getQueryParams().workspace.select.members })
                        )
                }),
                map((memberList: List<User>) => {
                    if (loadMore) {
                        this.loadedWorkspace.members.count = memberList.count;
                        this.loadedWorkspace.members.entities = this.loadedWorkspace.members.entities.concat(memberList.entities);
                    } else {
                        this.loadedWorkspace.members = memberList;
                    }

                    this.loadedWorkspace.members.entities.forEach((e) => {
                        this.refResolver.resolveRef(e).subscribe();
                    });

                    this.workspaceChanged.next(this.loadedWorkspace);
                })
            );
    }

    addWorkspaceMembers(workspaceId: string, invitationBody: InvitationData) {
        return this.http.patch<void>(`${this.serverConnection}/workspace/${workspaceId}/member`, invitationBody);
    }

    patchWorkspaceMember(workspaceId: string, id: string, body: any): Observable<User> {
        return this.http.patch(`${this.serverConnection}/workspace/${workspaceId}/member/${id}`, body).pipe(
            map((respondedUser: User) => {
                if (this.loadedWorkspace && this.loadedWorkspace.members) {
                    this.loadedWorkspace.members.entities = this.loadedWorkspace.members.entities.map((user) => {
                        return user.id === respondedUser.id ? Object.assign(user, respondedUser) : user;
                    });

                    if (respondedUser.id === this.userService.getCurrentLoggedInUser().id) {
                        this.loadedWorkspace.me.userRole = respondedUser.role;
                    }

                    this.workspaceChanged.next(this.loadedWorkspace);
                }
                return respondedUser;
            })
        );
    }

    removeWorkspaceMember(workspaceId: string, deletionBody: { emails: string[] }): Observable<void> {
        return this.http.post(`${this.serverConnection}/workspace/${workspaceId}/member/_delete`, deletionBody).pipe(
            map(() => {
                if (this.loadedWorkspace && this.loadedWorkspace.members) {
                    this.loadedWorkspace.members.entities = this.loadedWorkspace.members.entities.filter(
                        (member) => deletionBody.emails.findIndex((deletedMail) => deletedMail === member.email) === -1
                    );
                    this.loadedWorkspace.members.count--;
                    this.workspaceChanged.next(this.loadedWorkspace);
                }
            })
        );
    }

    loadWorkspaceUsers(workspaceId: string, queryParams?: IQueryParams): Observable<List<User>> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http.get<List<User>>(`${this.serverConnection}/workspace/${workspaceId}/member`, { params: httpParams });
    }

    loadWorkspaceLogoMeta(workspaceId: string, queryParams?: IQueryParams): Observable<FileMeta> {
        return this.fileService.loadLogoMeta(`/workspace/${workspaceId}`, queryParams);
    }

    onLogoUploadOutput(ngxUS: NgxUploadService, output: UploadOutput) {
        const parent = `/workspace/${this.loadedWorkspace.id}`;
        switch (output.type) {
            case NgxOutputEvents.ALLADDEDTOQUEUE:
                ngxUS.onallAddedToQueue(
                    output,
                    [
                        {
                            id: output.file.id,
                            name: output.file.name,
                            upload: output.file,
                            fileUsage: FileUsage.LOGO
                        } as FileMeta
                    ],
                    parent
                );
                break;
            case NgxOutputEvents.DONE:
                ngxUS.ondone(output, []);
                this.loadWorkspaceLogoMeta(this.loadedWorkspace.id).subscribe((logo) => {
                    this.loadedWorkspace.logo = logo;
                    this.workspaceChanged.next(this.loadedWorkspace);
                });
                break;
            case NgxOutputEvents.REJECTED:
                ngxUS.onrejected(output, []);
                break;
        }
    }

    hasPermission(permission: Permission, workspace?: Workspace): boolean {
        const currentWorkspace = workspace ? workspace : this.loadedWorkspace;
        return this.authorizationService.hasPermission(Entity.WORKSPACE, currentWorkspace.me.userRole, permission);
    }

    sendAdminConsentEmail(workspaceId: string, adminConsentEmail: AdminConsentEmail) {
        return this.http.post<void>(`${this.serverConnection}/workspace/${workspaceId}/_consent`, adminConsentEmail);
    }
}
