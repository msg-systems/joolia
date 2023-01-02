import { Injectable } from '@angular/core';
import { FileMeta, Skill, User } from '../models';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from './configuration.service';
import { AuthenticationService } from './authentication.service';
import { map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { assign, cloneDeep } from 'lodash-es';
import { NgxUploadService } from './ngx-upload.service';
import { UploadOutput } from 'ngx-uploader';
import { FileService } from './file.service';
import { IQueryParams } from './util.service';
import { NgxOutputEvents } from '../enum/global/upload.enum';
import { FileUsage } from '../enum/global/file-usage.enum';

/**
 * The UserService is used to store the current user and stores all actions which can be performed on him.
 */
@Injectable()
export class UserService {
    loggedInUserChanged: Subject<User> = new Subject();
    userChanged: Subject<User> = new Subject();
    authenticationSubscription: Subscription;
    private readonly serverConnection: string;
    private availableSkills: Skill[];
    private loggedInUser: User;
    private currentUser: BehaviorSubject<User> = new BehaviorSubject(null);

    constructor(
        private authenticationService: AuthenticationService,
        private httpClient: HttpClient,
        private fileService: FileService,
        private cookieService: CookieService,
        private config: ConfigurationService
    ) {
        this.serverConnection = this.config.getServerConnection();

        this.authenticationSubscription = this.authenticationService.authenticationChanged.subscribe(() => {
            this.updateLocalUser();
        });
    }

    /**
     * Retrieves the current user
     * @returns The current user
     */
    getCurrentLoggedInUser(): User {
        return cloneDeep(this.loggedInUser);
    }

    loadLoggedInUser(): Observable<User> {
        return this.httpClient.get<User>(`${this.serverConnection}/profile`).pipe(
            tap({ next: () => this.loadLoggedInUserAvatar() }),
            tap({ next: (user: User) => this.getSkills(user, { select: 'skills' }) }),
            tap({ next: (user: User) => this.setLoggedInUser(user) }),
            tap({ next: () => this.triggerLoggedInUserChanged() }),
            map(() => this.loggedInUser)
        );
    }

    loadLoggedInUserAvatar(): void {
        this.httpClient
            .get<FileMeta>(`${this.serverConnection}/profile/avatar`)
            .pipe(tap({ next: (value) => (this.loggedInUser.avatar = value) }))
            .subscribe();
    }

    loadUser(userId: string): Observable<User> {
        return this.httpClient.get<User>(`${this.serverConnection}/user/${userId}/profile`).pipe(
            tap({ next: (user: User) => this.getAvatar(user) }),
            tap({ next: (user: User) => this.triggerUserChanged(user) }),
            map((user: User) => user)
        );
    }

    isCreatorOf(e: { id: string; createdBy: User }): boolean {
        return this.getCurrentLoggedInUser().id === e.createdBy.id;
    }

    updateProfile(body: any): Observable<void> {
        return this.httpClient.patch<User>(`${this.serverConnection}/user/${this.loggedInUser.id}/profile`, body).pipe(
            tap({ next: (user: User) => this.setLoggedInUser(user, true) }),
            map(() => this.loggedInUserChanged.next(cloneDeep(this.loggedInUser)))
        );
    }

    addSkill(skills: string[]): Observable<void> {
        const body = { skillIds: skills };
        return this.httpClient.put<any>(`${this.serverConnection}/user/${this.loggedInUser.id}/skill`, body).pipe(
            tap({ next: (respondedSkills: Skill[]) => (this.loggedInUser.skills = respondedSkills) }),
            map(() => this.triggerLoggedInUserChanged())
        );
    }

    deleteSkill(skillId: string): Observable<void> {
        return this.httpClient
            .delete<void>(`${this.serverConnection}/user/${this.loggedInUser.id}/skill/${skillId}`)
            .pipe(tap({ next: () => this.removeSkillFormUser(skillId) }), tap({ next: () => this.triggerLoggedInUserChanged() }));
    }

    loadAvatarMeta(userId: string, queryParams?: IQueryParams): Observable<FileMeta> {
        return this.fileService.loadAvatarMeta(`/user/${userId}/profile`, queryParams).pipe(
            tap((avatar) => {
                if (this.loggedInUser && userId === this.loggedInUser.id) {
                    this.loggedInUser.avatar = avatar;
                    this.triggerLoggedInUserChanged();
                }
            })
        );
    }

    // TODO refactor
    onAvatarUploadOutput(parent: string, ngxUS: NgxUploadService, output: UploadOutput): void {
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
                this.loggedInUser.avatar = avatarFile[0];
                break;
            case NgxOutputEvents.DONE:
                ngxUS.ondone(output, []);
                this.loadAvatarMeta(this.loggedInUser.id).subscribe(() => {
                    this.loggedInUserChanged.next(cloneDeep(this.loggedInUser));
                });
                break;
            case NgxOutputEvents.REJECTED:
                ngxUS.onrejected(output, []);
                break;
        }
    }

    getAllAvailableSkills(): Observable<Skill[]> {
        return this.httpClient
            .get<Skill[]>(`${this.serverConnection}/user/skill`)
            .pipe(tap({ next: (availableSkills: Skill[]) => (this.availableSkills = availableSkills) }));
    }

    getSkills(user: User, queryParams: IQueryParams): Subscription {
        const loadSkills = queryParams && queryParams.select ? queryParams.select.includes('skills') : false;

        if (user && loadSkills) {
            return this.httpClient.get<Skill[]>(`${this.serverConnection}/user/${user.id}/skill`).subscribe((skills: Skill[]) => {
                if (this.loggedInUser && user.id === this.loggedInUser.id) {
                    this.loggedInUser.skills = skills;
                    this.triggerLoggedInUserChanged();
                }
                user.skills = skills;
                this.triggerUserChanged(user);
            });
        }
    }

    updateLocalUser() {
        if (this.authenticationService.isAuthenticated()) {
            this.loadLoggedInUser().subscribe(() => {});
        } else {
            this.loggedInUser = null;
            this.loggedInUserChanged.next(null);
            this.currentUser.next(null);
        }
    }

    getCurrentUser(): Observable<User> {
        return this.currentUser;
    }

    private triggerUserChanged(user) {
        this.userChanged.next(user);
    }

    private setLoggedInUser(user: User, updateUser: boolean = false) {
        this.loggedInUser = updateUser ? assign(this.loggedInUser, user) : user;
    }

    private triggerLoggedInUserChanged() {
        this.loggedInUserChanged.next(this.loggedInUser);
        this.currentUser.next(this.loggedInUser);
    }

    private getAvatar(user: User) {
        if (user.avatar) {
            this.loadAvatarMeta(user.id).subscribe(
                (avatar) => {
                    user.avatar = avatar;
                },
                () => {
                    user.avatar = null;
                }
            );
        }
    }

    private removeSkillFormUser(skillId: string) {
        this.loggedInUser.skills = this.loggedInUser.skills.filter((s) => s.id !== skillId);
    }
}
