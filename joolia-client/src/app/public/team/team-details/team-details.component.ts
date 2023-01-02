import { Component, OnDestroy, OnInit } from '@angular/core';
import { AvatarUploadDialogDataModel, FileMeta, Format, Team, UpdateEventBody, User, UserRole } from 'src/app/core/models';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ConfigurationService,
    FormatService,
    LoggerService,
    NgxUploadService,
    SnackbarService,
    TeamService,
    UserService,
    UtilService
} from 'src/app/core/services';
import { TeamAddMembersDialogComponent } from 'src/app/shared/components/team-add-members-dialog/team-add-members-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { assign } from 'lodash';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { AvatarUploadDialogComponent } from '../../../shared/components/avatar-upload/avatar-upload-dialog.component';
import { Subscription } from 'rxjs';
import { IDownloadOptions } from '../../../shared/components/file-list/file-list.component';
import { set } from 'lodash-es';
import { EditFileDialogComponent } from '../../../shared/components/edit-file-dialog/edit-file-dialog.component';

@Component({
    selector: 'app-team-details',
    templateUrl: './team-details.component.html',
    styleUrls: ['./team-details.component.scss']
})
export class TeamDetailsComponent implements OnDestroy, OnInit {
    team: Team;
    format: Format;
    actionBarActions = [];
    userMenuActions = [];
    avatarMenuActions = [];
    subscriptions: Subscription[] = [];
    teamNameMaxLength: number;
    editable = true;

    constructor(
        private route: ActivatedRoute,
        private formatService: FormatService,
        private teamService: TeamService,
        private router: Router,
        private dialog: MatDialog,
        private userService: UserService,
        private snackbarService: SnackbarService,
        private translate: TranslateService,
        private ngxUS: NgxUploadService,
        private logger: LoggerService,
        private utilService: UtilService
    ) {}

    ngOnInit() {
        this.teamNameMaxLength = ConfigurationService.getConfiguration().configuration.characterLimits.team.name;

        this.format = this.formatService.getCurrentFormat();
        this.subscriptions.push(
            this.teamService.teamChanged.subscribe((team) => {
                this.initTeam(team);
                // TODO: Add infinite scroll for team members
                this.loadAvatars();
                this.loadTeamFiles();
            })
        );

        this.loadTeam();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    private loadTeam() {
        this.teamService.loadTeam(this.route.snapshot.params['teamId']).subscribe(
            (data) => {
                this.actionBarActions = [];
                this.initAction();
            },
            (err) => {
                this.utilService.logAndNavigate(err.error, this, this.loadTeam, 'snackbar.teamNotFound', 'overview');
            }
        );
    }

    initTeam(team: Team) {
        this.team = team;

        this.loadAvatars();
    }

    isEditAllowedByRole(): boolean {
        return this.format.me.userRole === UserRole.ORGANIZER || this.userService.isCreatorOf(this.team);
    }

    initAction() {
        if (this.isEditAllowedByRole()) {
            this.actionBarActions.push({
                actionKey: 'buttons.deleteTeam',
                actionFunction: this.onDeleteTeam.bind(this)
            });
            this.actionBarActions.push({
                actionKey: 'buttons.addMember',
                actionFunction: this.onAddTeamMembers.bind(this)
            });
            this.userMenuActions = [
                {
                    actionKey: 'buttons.deleteMember',
                    actionFunction: this.onRemoveTeamMember.bind(this)
                }
            ];
        }

        this.avatarMenuActions = [
            {
                actionKey: 'buttons.addTeamAvatar',
                actionFunction: this.onEditTeamAvatar.bind(this)
            }
        ];
    }

    onAddTeamMembers() {
        const dialogRef = this.dialog.open(TeamAddMembersDialogComponent, {
            width: '512px',
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe((result: { users: User[] }) => {
            if (result) {
                this.teamService.addTeamMembers(this.format.id, this.team.id, result.users).subscribe();
            }
        });
    }

    loadAvatars() {
        this.team.members.forEach((member) => {
            if (member.avatar && member.avatar.id && !member.avatar.fileUrl) {
                this.userService.loadAvatarMeta(member.id).subscribe((avatar) => assign(member.avatar, avatar));
            }
        });

        if (this.team.avatar && !this.team.avatar.fileUrl) {
            this.teamService.loadTeamAvatarMeta(this.team.id).subscribe((avatar) => assign(this.team.avatar, avatar));
        }
    }

    onEditTeamAvatar() {
        const parent = `/format/${this.format.id}/team/${this.team.id}`;
        const data: AvatarUploadDialogDataModel = {
            headingKey: 'dialog.uploadAvatar.header',
            roundAvatar: false,
            onImageUploadOutput: this.teamService.onTeamAvatarUploadOutput.bind(this.teamService, this.team, parent)
        };
        this.dialog.open(AvatarUploadDialogComponent, {
            minWidth: '320px',
            data
        });
    }

    onRemoveTeamMember(memberId: string) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.removeTeamMember.header',
                contentKey: 'dialog.removeTeamMember.content',
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.remove'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                const deletedUser = this.team.members.find((member) => member.id === memberId);
                const deletedUserName = deletedUser.name ? deletedUser.name : deletedUser.email;
                this.teamService.removeTeamMember(this.format.id, this.team.id, deletedUser.email).subscribe(
                    (data) => {
                        this.snackbarService.openWithMessage('snackbar.teamMemberDeleted', {
                            objectName: deletedUserName,
                            parentName: this.team.name
                        });
                    },
                    (err) => {
                        this.logger.debug(err.error, this, this.onRemoveTeamMember);
                        this.snackbarService.openWithMessage('snackbar.teamMemberDeletionError');
                    }
                );
            }
        });
    }

    onDeleteTeam() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.teamDeletion',
                contentParams: { objectName: this.team.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.teamService.deleteTeam(this.format.id, this.team.id).subscribe(
                    (data) => {
                        this.snackbarService.openWithMessage('snackbar.teamDeleted', { objectName: this.team.name });
                        this.router.navigate(['format', this.format.id, 'teams', 'overview']);
                    },
                    (err) => {
                        this.logger.debug(err.error, this, this.onDeleteTeam);
                        this.snackbarService.openWithMessage('snackbar.teamDeletionError');
                    }
                );
            }
        });
    }

    onTeamUpdate(name: string) {
        if (this.team.name !== name) {
            this.teamService.updateTeam(this.format.id, this.team.id, { name: name }).subscribe(
                (res) => {
                    this.team.name = name;
                },
                (err) => {
                    this.logger.debug(err.error, this, this.onTeamUpdate);
                    this.snackbarService.openWithMessage('snackbar.duplicateTeamName');
                }
            );
        }
    }

    loadTeamFiles() {
        this.teamService.loadTeamFilesMeta().subscribe((files) => {
            this.team.files = files;

            if (this.ngxUS.isUploadActive()) {
                const uploadingFiles = this.ngxUS.getUploadingFiles().filter((f) => {
                    return f.parent === '/format/' + this.format.id + '/team/' + this.team.id;
                });

                uploadingFiles.forEach((f) => {
                    if (!this.team.files.includes(f)) {
                        this.team.files.push(f);
                        this.logger.debug('Added Uploading Entry in team list: ' + f);
                    }
                });
            }
        });
    }

    onFileUpdate(file: FileMeta) {
        const dialogRef = this.dialog.open(EditFileDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.editFile.header',
                fileName: file.name,
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.save'
            }
        });

        dialogRef.afterClosed().subscribe((updatedName: string) => {
            if (updatedName) {
                const body: Partial<FileMeta> = {
                    name: updatedName
                };
                this.teamService.updateFile(file.id, body).subscribe(
                    () => {},
                    () => {
                        this.snackbarService.openWithMessage('snackbar.fileUpdateError');
                    }
                );
            }
        });
    }

    onFileDelete(fileId: string) {
        const selectedFile = this.team.files.find((file) => file.id === fileId);
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.fileDeletion',
                contentParams: { objectName: selectedFile.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.teamService.deleteFile(this.ngxUS, fileId).subscribe(
                    () => {
                        this.snackbarService.openWithMessage(
                            this.translate.instant('snackbar.fileDeleted', { objectName: selectedFile.name })
                        );
                    },
                    (err) => {
                        this.snackbarService.openWithMessage(this.translate.instant('snackbar.fileDeletionError'));
                    }
                );
            }
        });
    }

    onUploadOutput(output) {
        this.teamService.onUploadOutput(this.ngxUS, output);
    }

    onFileDownloadClicked(options: IDownloadOptions) {
        this.teamService.getDownloadLink(options.fileId, options.download);
    }
}
