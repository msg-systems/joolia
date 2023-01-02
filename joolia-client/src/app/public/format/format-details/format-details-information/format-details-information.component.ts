import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    Action,
    Activity,
    CheckedBy,
    EntitySummaryItem,
    FileMeta,
    Format,
    FormatTemplate,
    KeyVisualUploadDialogDataModel,
    Library,
    List,
    MultiSelectOptionData,
    Permission,
    Phase,
    SelectOption,
    Step,
    Team,
    UserRole
} from '../../../../core/models';
import {
    ActivityService,
    ConfigurationService,
    FormatService,
    FormatTemplateService,
    IQueryParams,
    LibraryService,
    LoggerService,
    NgxUploadService,
    NotificationService,
    PhaseService,
    SnackbarService,
    TeamService,
    UserService
} from '../../../../core/services';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SelectionDialogComponent } from '../../../../shared/components/selection-dialog/selection-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { KeyVisualUploadDialogComponent } from '../../../../shared/components/key-visual-upload/key-visual-upload-dialog.component';
import { Router } from '@angular/router';
import { DescriptionDialogComponent } from '../../../../shared/components/description-dialog/description-dialog.component';
import { IDownloadOptions } from 'src/app/shared/components/file-list/file-list.component';
import { assign } from 'lodash-es';
import { SubmissionModifySetting } from '../../../../core/enum/global/submission.enum';
import { EditFileDialogComponent } from '../../../../shared/components/edit-file-dialog/edit-file-dialog.component';

@Component({
    selector: 'app-format-details-information',
    templateUrl: './format-details-information.component.html',
    styleUrls: ['./format-details-information.component.scss']
})
export class FormatDetailsInformationComponent implements OnInit, OnDestroy {
    actionBarActions: Action[] = [];
    keyVisualMenuActions: Action[] = [];

    format: Format;
    isEditAllowed = false;
    isOrganizer = false;
    currentPhases: Phase[] = [];
    currentActivites: Activity[];
    teams: Team[];
    progressEntities: CheckedBy[];
    formatNameMaxLength: number;
    formatShortDescriptionMaxLength: number;
    formatDescriptionMaxLength: number;
    categoryOptions: SelectOption[] = [];
    formatSummary: EntitySummaryItem[] = [];

    subscriptions: Subscription[] = [];

    notificationFormatWSPrefix: string;

    constructor(
        private formatService: FormatService,
        private libraryService: LibraryService,
        private userService: UserService,
        private formatTemplateService: FormatTemplateService,
        private ngxUS: NgxUploadService,
        private dialog: MatDialog,
        private router: Router,
        private snackbarService: SnackbarService,
        private translate: TranslateService,
        private logger: LoggerService,
        private teamService: TeamService,
        private phaseService: PhaseService,
        private activityService: ActivityService,
        private notificationService: NotificationService
    ) {}

    ngOnInit() {
        const characterLimits = ConfigurationService.getConfiguration().configuration.characterLimits.format;
        this.formatNameMaxLength = characterLimits.name;
        this.formatShortDescriptionMaxLength = characterLimits.shortDescription;
        this.formatDescriptionMaxLength = characterLimits.description;

        this.initNotifications();

        this.subscriptions.push(
            this.formatService.formatChanged.subscribe((format: Format) => {
                if (format.members) {
                    this.progressEntities = format.members.entities.filter(
                        (member) => member.role === UserRole.PARTICIPANT && !member.pending
                    );
                }
                this.initFormat(format);
                this.initUserView();
                this.categoryOptions = this.libraryService.getCategoryOptions();
            })
        );

        this.subscriptions.push(
            this.teamService.teamListChanged.subscribe((teamList: List<Team>) => {
                this.teams = teamList.entities;
                this.teams.forEach((team) => {
                    if (team.avatar) {
                        this.teamService.loadTeamAvatarMeta(team.id).subscribe((avatar) => assign(team.avatar, avatar));
                    }
                });
            })
        );

        this.subscriptions.push(
            this.notificationService.formatChangedWS.subscribe((a) => {
                this.logger.debug('[SOCKET] Format file notification received. Reloading files...');
                this.initFormatFiles();
            })
        );

        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().format.select.details
        };

        this.formatService.loadFormat(this.formatService.getCurrentFormat().id, queryParams).subscribe((format: Format) => {
            this.format = format;
            this.initCurrentStateComponent();
        });
    }

    private initNotifications() {
        this.notificationFormatWSPrefix = ConfigurationService.getConfiguration().configuration.websocket.rooms.notifications.format;

        const formatId = this.router.url.split('/')[2];
        this.notificationService.init().then(() => {
            this.notificationService.joinRoom(`${this.notificationFormatWSPrefix}${formatId}`);
        });
    }

    initFormat(format: Format) {
        this.format = format;

        this.isEditAllowed = this.formatService.hasPermission(Permission.UPDATE_FORMAT);

        if (format) {
            if (format.keyVisual && format.keyVisual.id && !format.keyVisual.linkUrl) {
                this.formatService.loadFormatKeyVisualMeta(format.id).subscribe((keyVisual: FileMeta) => {
                    this.format.keyVisual = keyVisual;
                });
            }

            if (format.createdBy && format.createdBy.avatar && format.createdBy.avatar.id && !format.createdBy.avatar.fileUrl) {
                this.userService.loadAvatarMeta(this.format.createdBy.id).subscribe((avatar) => {
                    this.format.createdBy.avatar = avatar;
                });
            }

            this.initFormatFiles();
        }
        this.formatSummary = [
            {
                key: 'labels.amountMembers',
                icon: 'people',
                amount: this.format.memberCount
            },
            {
                key: 'labels.amountTeams',
                icon: 'category_outline',
                amount: this.format.teamCount
            },
            {
                key: 'labels.amountSubmissions',
                icon: 'wb_incandescent',
                amount: this.format.submissionCount
            },
            {
                key: 'labels.amountPhases',
                icon: 'insert_invitation',
                amount: this.format.phaseCount
            },
            {
                key: 'labels.amountActivities',
                icon: 'view_agenda',
                amount: this.format.activityCount
            },
            {
                key: 'labels.amountComments',
                icon: 'chat_bubble_outline',
                amount: this.format.commentCount
            }
        ];
    }

    initFormatFiles() {
        this.formatService.loadFormatFilesMeta().subscribe((files) => {
            this.format.files = files;

            if (this.ngxUS.isUploadActive()) {
                const uploadingFiles = this.ngxUS.getUploadingFiles().filter((f) => {
                    return f.parent === '/format/' + this.format.id;
                });

                uploadingFiles.forEach((f) => {
                    if (!this.format.files.includes(f)) {
                        this.format.files.push(f);
                        this.logger.debug('Added Uploading Entry in format list: ' + f);
                    }
                });
            }
        });
    }

    initUserView() {
        if (this.isEditAllowed) {
            this.actionBarActions = [
                {
                    actionKey: 'buttons.storeAsFormatTemplate',
                    actionFunction: this.onTemplateSave.bind(this)
                }
            ];
            this.actionBarActions.push({
                actionKey: 'buttons.delete',
                actionFunction: this.onFormatDelete.bind(this)
            });
        } else {
            // all other
        }

        this.keyVisualMenuActions = this.isEditAllowed
            ? [
                  {
                      actionKey: 'buttons.addVisual',
                      actionFunction: this.onAddKeyVisual.bind(this)
                  }
              ]
            : [];
    }

    initCurrentStateComponent() {
        this.isOrganizer = this.format.me.userRole === UserRole.ORGANIZER;
        this.phaseService.loadCurrentPhases().subscribe((phases: Phase[]) => {
            this.currentPhases = phases;
            if (phases.length > 0) {
                this.activityService.loadCurrentActivities(this.format.id, phases[0]).subscribe((activities: Activity[]) => {
                    this.currentActivites = activities;
                    if (activities.length > 0 && this.isOrganizer) {
                        // load data for progress table
                        const queryParams: IQueryParams = {
                            select: 'id,description,checkedBy',
                            order: 'position'
                        };

                        if (activities[0].configuration.submissionModifySetting === SubmissionModifySetting.TEAM) {
                            this.teamService.loadTeams(this.format.id).subscribe();
                        } else {
                            this.formatService.loadFormatMembers().subscribe();
                        }
                        this.activityService
                            .loadSteps(this.format.id, phases[0].id, activities[0].id, queryParams)
                            .subscribe((stepList: List<Step>) => (activities[0].steps = stepList));
                    }
                });
            }
        });
        if (!this.isOrganizer) {
            this.teamService
                .loadTeams(this.format.id, {
                    select: 'id,name,avatar,members',
                    order: 'name'
                })
                .subscribe();
        }
    }

    ngOnDestroy() {
        this.notificationService.leaveRoom(`${this.notificationFormatWSPrefix}${this.format.id}`);
        this.notificationService.terminate();
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    onFormatUpdate(field, newValue) {
        if (this.format[field] !== newValue) {
            this.format[field] = newValue;
            const updatedFormat = {};

            updatedFormat[field] = newValue;
            this.formatService.patchFormat(this.format.id, updatedFormat).subscribe();
        }
    }

    onFormatDelete() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.formatDeletion',
                contentParams: { objectName: this.format.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.formatService.deleteFormat(this.format.id).subscribe(
                    () => {
                        this.snackbarService.openWithMessage('snackbar.formatDeleted', { objectName: this.format.name });
                        this.router.navigate(['format/overview']);
                    },
                    (err) => {
                        this.logger.debug(err.error, this, this.onFormatDelete);
                        this.snackbarService.openWithMessage('snackbar.formatDeletionError');
                    }
                );
            }
        });
    }

    onAddKeyVisual() {
        const parent = `/format/${this.format.id}`;
        const data: KeyVisualUploadDialogDataModel = {
            parent,
            onImageUploadOutput: this.formatService.onKeyVisualUploadOutput.bind(this.formatService),
            uploadLink: this.formatService.uploadKeyVisualLink.bind(this.formatService)
        };
        this.dialog.open(KeyVisualUploadDialogComponent, {
            data,
            minWidth: '320px'
        });
    }

    onTemplateSave() {
        const queryParams: IQueryParams = {
            select: 'id,name'
        };

        this.libraryService.loadLibraries(queryParams).subscribe(() => {
            const selectableLibraries: SelectOption[] = [];

            for (const library of this.libraryService.getCurrentLibraries().entities) {
                selectableLibraries.push({
                    display: library.name,
                    value: library
                });
            }
            const librarySelectionDetail: MultiSelectOptionData = {
                entityName: 'library',
                selectOptions: selectableLibraries,
                required: true
            };
            const categorySelectionDetail: MultiSelectOptionData = {
                entityName: 'category',
                selectOptions: this.categoryOptions,
                required: true
            };
            const dialogRef = this.dialog.open(SelectionDialogComponent, {
                width: '400px',
                data: {
                    headerKey: 'dialog.storeAsFormatTemplate.header',
                    contentKey: 'dialog.storeAsFormatTemplate.content',
                    cancelKey: 'buttons.cancel',
                    confirmKey: 'buttons.create',
                    selectionDetails: [librarySelectionDetail, categorySelectionDetail]
                }
            });

            dialogRef.afterClosed().subscribe((selectedValues: any) => {
                if (selectedValues && selectedValues['library'] && selectedValues['category']) {
                    const selectedLibrary: Library = selectedValues['library'];
                    const selectedCategory = selectedValues['category'];
                    this.formatTemplateService
                        .createFormatTemplate(selectedLibrary.id, this.format.id, selectedCategory)
                        .subscribe((formatTemplate: FormatTemplate) => {
                            this.snackbarService
                                .openWithMessage('snackbar.formatTemplateCreated', { libraryName: selectedLibrary.name }, 'buttons.show')
                                .onAction()
                                .subscribe(() => {
                                    this.router.navigate([`library/${selectedLibrary.id}/template/details/format/${formatTemplate.id}`]);
                                });
                        });
                }
            });
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
                this.formatService.updateFile(file.id, body).subscribe(
                    () => {},
                    () => {
                        this.snackbarService.openWithMessage('snackbar.fileUpdateError');
                    }
                );
            }
        });
    }

    onFileDelete(fileId: string) {
        const selectedFile = this.format.files.find((file) => file.id === fileId);
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
                this.formatService.deleteFile(this.ngxUS, fileId).subscribe(
                    () => {
                        this.snackbarService.openWithMessage('snackbar.fileDeleted', { objectName: selectedFile.name });
                    },
                    (err) => {
                        this.snackbarService.openWithMessage('snackbar.fileDeletionError');
                    }
                );
            }
        });
    }

    onUploadOutput(output) {
        this.formatService.onUploadOutput(this.ngxUS, output);
    }

    onFileDownloadClicked(options: IDownloadOptions) {
        this.formatService.getDownloadLink(options.fileId, options.download);
    }

    onInfoClicked() {
        this.dialog.open(DescriptionDialogComponent, {
            width: '536px',
            height: '816px',
            autoFocus: false
        });
    }
}
