import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UploadFile, UploadOutput } from 'ngx-uploader';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FileUsage } from '../enum/global/file-usage.enum';
import { NgxOutputEvents } from '../enum/global/upload.enum';
import { FileMeta, List, Team, User } from '../models';
import { ConfigurationService } from './configuration.service';
import { FileService } from './file.service';
import { FormatService } from './format.service';
import { NgxUploadService } from './ngx-upload.service';
import { IQueryParams, UtilService } from './util.service';
import { UserService } from './user.service';

/**
 * The TeamService handles all http requests regarding loading and actions on teams within a format.
 */
@Injectable({
    providedIn: 'root'
})
export class TeamService {
    teamChanged = new Subject<Team>();
    teamListChanged = new Subject<List<Team>>();

    private readonly serverConnection: string;

    private loadedTeam: Team;
    private loadedTeamList: List<Team> = { count: 0, entities: [] };

    constructor(
        private http: HttpClient,
        private fileService: FileService,
        private formatService: FormatService,
        private config: ConfigurationService,
        private translate: TranslateService,
        private ngxUploadService: NgxUploadService,
        private userService: UserService
    ) {
        this.serverConnection = this.config.getServerConnection();
    }

    loadTeams(formatId: string, queryParams?: IQueryParams, loadMore?: boolean): Observable<void> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http
            .get<List<Team>>(`${this.serverConnection}/format/${formatId}/team`, { params: httpParams })
            .pipe(
                map((teamList: List<Team>) => {
                    if (loadMore) {
                        this.loadedTeamList.count = teamList.count;
                        this.loadedTeamList.entities = this.loadedTeamList.entities.concat(teamList.entities);
                    } else {
                        this.loadedTeamList = teamList;
                    }
                    this.teamListChanged.next(this.loadedTeamList);
                })
            );
    }

    loadTeam(teamId: string, queryParams?: IQueryParams): Observable<Team> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        const format = this.formatService.getCurrentFormat();

        return this.http
            .get<Team>(`${this.serverConnection}/format/${format.id}/team/${teamId}`, { params: httpParams })
            .pipe(
                tap((team) => this.loadSkillsForMembers(team.members)),
                map((team: Team) => {
                    this.loadedTeam = team;
                    this.sortMembers();
                    this.teamChanged.next(this.loadedTeam);

                    return team;
                })
            );
    }

    getCurrentTeams(): List<Team> {
        return this.loadedTeamList;
    }

    getCurrentTeam() {
        return this.loadedTeam;
    }

    createTeam(formatId: string, body: Partial<Team>): Observable<void> {
        return this.http.post<Team>(`${this.serverConnection}/format/${formatId}/team`, body).pipe(
            map((team: Team) => {
                this.loadedTeamList.entities.push(team);
                this.loadedTeamList.count++;
                this.teamListChanged.next(this.loadedTeamList);
            })
        );
    }

    updateTeam(formatId: string, teamId: string, body: Partial<Team>): Observable<void> {
        if (body.name === '') {
            body.name = this.translate.instant('labels.untitledTeam');
        }
        return this.http.put<Team>(`${this.serverConnection}/format/${formatId}/team/${teamId}`, body).pipe(
            map((respondedTeam: Team) => {
                this.loadedTeamList.entities = this.loadedTeamList.entities.map((team) => {
                    return team.id === respondedTeam.id ? Object.assign(team, respondedTeam) : team;
                });

                this.teamListChanged.next(this.loadedTeamList);

                if (this.loadedTeam.id === respondedTeam.id) {
                    this.loadedTeam = Object.assign(this.loadedTeam, respondedTeam);

                    this.teamChanged.next(this.loadedTeam);
                }
            })
        );
    }

    deleteTeam(formatId: string, teamId: string): Observable<void> {
        return this.http.delete<void>(`${this.serverConnection}/format/${formatId}/team/${teamId}`).pipe(
            map(() => {
                this.loadedTeamList.entities = this.loadedTeamList.entities.filter((team) => team.id !== teamId);
                this.loadedTeamList.count--;

                this.teamListChanged.next(this.loadedTeamList);
            })
        );
    }

    getPossibleNewMembersForTeam(formatId: string, teamId: string, queryParams?: IQueryParams): Observable<List<User>> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http.get<List<User>>(`${this.serverConnection}/format/${formatId}/team/${teamId}/availableNewMembers`, {
            params: httpParams
        });
    }

    getPossibleTeamsToAddTo(formatId: string, memberId: string, queryParams?: IQueryParams): Observable<List<Team>> {
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);
        return this.http.get<List<Team>>(`${this.serverConnection}/format/${formatId}/usersAvailableTeams/${memberId}`, {
            params: httpParams
        });
    }

    addTeamMembers(formatId: string, teamId: string, users: User[]): Observable<User[]> {
        const userEmails = users.map((user: User) => user.email);
        return this.http
            .patch<User[]>(`${this.serverConnection}/format/${formatId}/team/${teamId}`, { emails: userEmails })
            .pipe(
                tap((members) => this.loadSkillsForMembers(members)),
                map((newUsers) => {
                    if (this.loadedTeam) {
                        this.loadedTeam.members = this.loadedTeam.members.concat(newUsers);
                        this.sortMembers();
                        this.teamChanged.next(this.loadedTeam);

                        const index = this.loadedTeamList.entities.findIndex((team) => team.id === this.loadedTeam.id);
                        if (index > -1) {
                            this.loadedTeamList.entities.splice(index, 1, this.loadedTeam);
                            this.teamListChanged.next(this.loadedTeamList);
                        }
                    }

                    return newUsers;
                })
            );
    }

    removeTeamMember(formatId: string, teamId: string, deletedMemberMail: string): Observable<void> {
        return this.http
            .post<void>(`${this.serverConnection}/format/${formatId}/team/${teamId}/_delete`, { emails: [deletedMemberMail] })
            .pipe(
                map((deletedUser) => {
                    this.loadedTeam.members = this.loadedTeam.members.filter((member) => {
                        return member.email !== deletedMemberMail;
                    });

                    this.teamChanged.next(this.loadedTeam);

                    const index = this.loadedTeamList.entities.findIndex((team) => team.id === this.loadedTeam.id);
                    if (index > -1) {
                        this.loadedTeamList.entities.splice(index, 1, this.loadedTeam);
                        this.teamListChanged.next(this.loadedTeamList);
                    }

                    return deletedUser;
                })
            );
    }

    loadTeamFilesMeta(queryParams?: IQueryParams) {
        const formatId = this.formatService.getCurrentFormat().id;
        const teamId = this.getCurrentTeam().id;

        return this.fileService.loadFilesMeta(`/format/${formatId}/team/${teamId}`, queryParams).pipe(
            map((files) => {
                files = files.length > 0 ? this.ngxUploadService.getUploadProgressForFiles(files) : files;
                return files;
            })
        );
    }

    getDownloadLink(fileId: FileMeta['id'], download: boolean) {
        const formatId = this.formatService.getCurrentFormat().id;
        const teamId = this.getCurrentTeam().id;
        const queryParams: IQueryParams = { download: download };

        return this.fileService
            .getDownloadFileMeta(`/format/${formatId}/team/${teamId}`, fileId, queryParams)
            .subscribe((res: FileMeta) => {
                this.loadedTeam.files = this.loadedTeam.files.map((file) => {
                    if (file.id === fileId) {
                        if (download) {
                            file.downloadUrl = res.fileUrl;
                        } else {
                            file.tabUrl = res.fileUrl;
                        }
                    }
                    return file;
                });
            });
    }

    updateFile(fileId: FileMeta['id'], body: Partial<FileMeta>) {
        const formatId = this.formatService.getCurrentFormat().id;
        const teamId = this.getCurrentTeam().id;

        return this.fileService.updateFile(`/format/${formatId}/team/${teamId}`, fileId, body).pipe(
            map((updatedMeta: FileMeta) => {
                this.loadedTeam.files = this.loadedTeam.files.map((file) => {
                    if (file.id === updatedMeta.id) {
                        Object.assign(file, updatedMeta);
                    }

                    return file;
                });
                this.teamChanged.next(this.loadedTeam);
            })
        );
    }

    deleteFile(ngxUS: NgxUploadService, fileId: FileMeta['id']) {
        const formatId = this.formatService.getCurrentFormat().id;
        const teamId = this.getCurrentTeam().id;

        if (this.loadedTeam.files.find((file) => file.id === fileId).upload) {
            ngxUS.abortFileUpload(this.loadedTeam.files.find((file) => file.id === fileId));
            this.loadedTeam.files = this.loadedTeam.files.filter((file) => file.id !== fileId);
        }

        // delete file from entity
        return this.fileService.deleteFile(`/format/${formatId}/team/${teamId}`, fileId).pipe(
            map(() => {
                this.loadedTeam.files = this.loadedTeam.files.filter((file) => file.id !== fileId);
                this.teamChanged.next(this.loadedTeam);
            })
        );
    }

    onUploadOutput(ngxUS: NgxUploadService, output: UploadOutput) {
        if (output.type === NgxOutputEvents.ALLADDEDTOQUEUE) {
            const parent = `/format/${this.formatService.getCurrentFormat().id}/team/${this.getCurrentTeam().id}`;
            const result = ngxUS['on' + output.type](output, this.loadedTeam.files, parent);
        } else {
            const result = ngxUS['on' + output.type](output, this.loadedTeam.files);

            if (
                output.type === NgxOutputEvents.REMOVEDALL ||
                output.type === NgxOutputEvents.REMOVED ||
                output.type === NgxOutputEvents.UPLOADING ||
                output.type === NgxOutputEvents.ADDEDTOQUEUE
            ) {
                this.loadedTeam.files = result;
            } else if (output.type === NgxOutputEvents.DONE) {
                this.loadedTeam.files.forEach((f) => {
                    if (f.upload && f.upload.id === output.file.id) {
                        f.upload = <UploadFile>{};
                    }
                });
            }
        }
    }

    loadTeamAvatarMeta(teamId: string, httpParams?): Observable<FileMeta> {
        const formatId = this.formatService.getCurrentFormat().id;
        return this.fileService.loadAvatarMeta(`/format/${formatId}/team/${teamId}`, httpParams);
    }

    onTeamAvatarUploadOutput(team: Team, parent: string, ngxUS: NgxUploadService, output: UploadOutput) {
        switch (output.type) {
            case NgxOutputEvents.ALLADDEDTOQUEUE:
                const avatarFile = ngxUS.onallAddedToQueue(
                    output,
                    [
                        {
                            id: output.file.id,
                            name: output.file.name,
                            upload: output.file,
                            fileUsage: FileUsage.AVATAR
                        } as FileMeta
                    ],
                    parent
                );
                team.avatar = avatarFile[0];
                break;
            case NgxOutputEvents.DONE:
                ngxUS.ondone(output, []);
                this.loadTeamAvatarMeta(team.id).subscribe((avatar) => {
                    team.avatar = avatar;
                });
                break;
            case NgxOutputEvents.REJECTED:
                ngxUS.onrejected(output, []);
                break;
        }
    }

    private loadSkillsForMembers(members: User[]): void {
        if (members && members.length > 0) {
            members.forEach((m) => this.userService.getSkills(m, { select: ConfigurationService.getQueryParams().team.select.members }));
        }
    }

    private sortMembers(): void {
        this.loadedTeam.members = this.loadedTeam.members.sort((a, b) => {
            if (!b.name) {
                return 1;
            }
            if (!a.name) {
                return -1;
            }
            return a.name.localeCompare(b.name);
        });
    }
}
