import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    ActivityService,
    CanvasService,
    ConfigurationService,
    FormatService,
    IQueryParams,
    LoggerService,
    NgxUploadService,
    NotificationService,
    PhaseService,
    SnackbarService
} from '../../../../core/services';
import {
    Action,
    Activity,
    Canvas,
    FileMeta,
    KeyVisualUploadDialogDataModel,
    LinkEntry,
    List,
    Permission,
    SelectOption,
    UpdateEventBody
} from '../../../../core/models';
import { Subscription } from 'rxjs';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, set } from 'lodash-es';
import { KeyVisualUploadDialogComponent } from '../../../../shared/components/key-visual-upload/key-visual-upload-dialog.component';
import { DescriptionDialogComponent } from '../../../../shared/components/description-dialog/description-dialog.component';
import { IDownloadOptions } from 'src/app/shared/components/file-list/file-list.component';
import { LinkCreateDialogComponent } from '../../../../shared/components/link-create-dialog/link-create-dialog.component';
import { Router } from '@angular/router';
import { EditFileDialogComponent } from '../../../../shared/components/edit-file-dialog/edit-file-dialog.component';
import { CanvasCreateDialogComponent } from '../../../../shared/components/canvas/canvas-create-dialog/canvas-create-dialog.component';

@Component({
    selector: 'app-activity-details-main',
    templateUrl: './activity-details-main.component.html',
    styleUrls: ['./activity-details-main.component.scss']
})
export class ActivityDetailsMainComponent implements OnInit, OnDestroy {
    activity: Activity;
    activityDescriptionMaxLength: number;
    canvasList: List<Canvas>;

    subscriptions: Subscription[] = [];

    isEditAllowed = false;

    submissionModifySettingOptions: SelectOption[] = [];
    submissionViewSettingOptions: SelectOption[] = [];

    menuActions: Action[] = [];

    notificationActivityWSPrefix: string;
    notificationActivityId: string;

    constructor(
        private activityService: ActivityService,
        private formatService: FormatService,
        private phaseService: PhaseService,
        private canvasService: CanvasService,
        private dialog: MatDialog,
        private translate: TranslateService,
        private ngxUS: NgxUploadService,
        private snackbarService: SnackbarService,
        private logger: LoggerService,
        private router: Router,
        private notificationService: NotificationService
    ) {}

    ngOnInit() {
        this.activityDescriptionMaxLength = ConfigurationService.getConfiguration().configuration.characterLimits.activity.description;

        // Initialization for the configuration options
        for (const modifyKey of Object.values(ConfigurationService.getConfiguration().configuration.icons.submissionModifyConfig)) {
            this.submissionModifySettingOptions.push({
                display: 'activity.submissionModifySetting.' + modifyKey.value,
                value: modifyKey.value,
                icon: modifyKey.icon
            });
        }

        for (const viewKey of Object.values(ConfigurationService.getConfiguration().configuration.icons.submissionViewConfig)) {
            this.submissionViewSettingOptions.push({
                display: 'activity.submissionViewSetting.' + viewKey.value,
                value: viewKey.value,
                icon: viewKey.icon
            });
        }

        this.initNotifications();

        this.subscriptions.push(
            this.activityService.activityChanged.subscribe((activity: Activity) => {
                this.initActivity(activity);
            })
        );

        this.subscriptions.push(
            this.canvasService.canvasListChanged.subscribe((canvasList: List<Canvas>) => {
                this.canvasList = canvasList;
            })
        );

        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().activity.select.detailsMain
        };

        this.activityService
            .loadActivity(
                this.formatService.getCurrentFormat().id,
                this.phaseService.getCurrentPhase().id,
                this.activityService.getCurrentActivity().id,
                queryParams
            )
            .subscribe();

        this.isEditAllowed = this.formatService.hasPermission(Permission.UPDATE_ACTIVITY);

        this.initMenuActions();

        this.subscriptions.push(
            this.notificationService.activityChangedWS.subscribe((a) => {
                this.logger.debug('[SOCKET] Activity file notification received. Reloading files...');
                this.initActivityFiles();
            })
        );
    }

    initActivity(activity: Activity) {
        this.activity = activity;

        if (activity) {
            if (activity.keyVisual && activity.keyVisual.id && !activity.keyVisual.linkUrl) {
                this.activityService
                    .loadActivityKeyVisualMeta(
                        this.formatService.getCurrentFormat().id,
                        this.phaseService.getCurrentPhase().id,
                        activity.id
                    )
                    .subscribe((keyVisual: FileMeta) => {
                        this.activity.keyVisual = keyVisual;
                    });
            }

            this.initActivityFiles();

            this.activityService
                .loadActivityDetails(
                    this.formatService.getCurrentFormat().id,
                    this.phaseService.getCurrentPhase().id,
                    this.activityService.getCurrentActivity().id
                )
                .subscribe((data) => {
                    this.activity.submissionCount = data.submissionCount;
                    this.activity.stepCount = data.stepCount;
                    if (this.activity.configuration) {
                        this.activity.configuration.blocked = data.configuration.blocked;
                    }
                });

            this.canvasService.loadCanvasList().subscribe();
        }
    }

    private initNotifications() {
        this.notificationActivityWSPrefix = ConfigurationService.getConfiguration().configuration.websocket.rooms.notifications.activity;

        this.notificationActivityId = this.router.url.split('/')[6];
        this.notificationService.init().then(() => {
            this.notificationService.joinRoom(`${this.notificationActivityWSPrefix}${this.notificationActivityId}`);
        });
    }

    initActivityFiles() {
        this.activityService
            .loadActivityFilesMeta(this.formatService.getCurrentFormat().id, this.phaseService.getCurrentPhase().id)
            .subscribe((files) => {
                this.activity.files = files || [];
                if (this.ngxUS.isUploadActive()) {
                    const uploadingFiles = this.ngxUS.getUploadingFiles().filter((f) => {
                        const currentParent =
                            '/format/' +
                            this.formatService.getCurrentFormat().id +
                            '/phase/' +
                            this.phaseService.getCurrentPhase().id +
                            '/activity/' +
                            this.activity.id;
                        return f.parent === currentParent;
                    });

                    uploadingFiles.forEach((f) => {
                        if (!this.activity.files.includes(f)) {
                            this.activity.files.push(f);
                            this.logger.debug('Added Uploading Entry in activity list: ' + f);
                        }
                    });
                }
            });
    }

    private initMenuActions() {
        this.menuActions = this.isEditAllowed
            ? [
                  {
                      actionKey: 'buttons.addVisual',
                      actionFunction: this.onOpenKeyVisualUploadDialog.bind(this)
                  }
              ]
            : [];
    }

    ngOnDestroy() {
        this.notificationService.leaveRoom(`${this.notificationActivityWSPrefix}${this.notificationActivityId}`);
        this.notificationService.terminate();
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    onActivityUpdate(path: string, updatedValue: any) {
        const updatedBody: Partial<Activity> = {};
        set(updatedBody, path, updatedValue);
        this.activityService
            .updateActivity(this.formatService.getCurrentFormat().id, this.phaseService.getCurrentPhase().id, this.activity.id, updatedBody)
            .subscribe();
    }

    onOpenKeyVisualUploadDialog() {
        let parent = `/format/${this.formatService.getCurrentFormat().id}`;
        parent += `/phase/${this.phaseService.getCurrentPhase().id}/activity/${this.activity.id}`;
        const data: KeyVisualUploadDialogDataModel = {
            parent,
            onImageUploadOutput: this.activityService.onKeyVisualUploadOutput.bind(this.activityService),
            uploadLink: this.activityService.uploadKeyVisualLink.bind(this.activityService)
        };
        this.dialog.open(KeyVisualUploadDialogComponent, {
            data,
            minWidth: '320px'
        });
    }

    onLinkClick(linkUrl: string) {
        const regex = new RegExp(ConfigurationService.getConfiguration().configuration.validations.protocol);
        if (!regex.test(linkUrl)) {
            linkUrl = 'http://' + linkUrl;
        }

        const win = window.open(linkUrl, '_blank');
        win.focus();
    }

    onLinkAdd() {
        const dialogRef = this.dialog.open(LinkCreateDialogComponent, {
            minWidth: '320px'
        });

        dialogRef.afterClosed().subscribe((link: LinkEntry) => {
            if (link) {
                this.activityService.addCollaborationLink(
                    this.formatService.getCurrentFormat().id,
                    this.phaseService.getCurrentPhase().id,
                    link
                );
            }
        });
    }

    onLinkDelete(position: number) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.linkDeletion',
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.activityService.deleteCollaborationLink(
                    this.formatService.getCurrentFormat().id,
                    this.phaseService.getCurrentPhase().id,
                    this.activity.collaborationLinks[position].id
                );
                this.activity.collaborationLinks.splice(position, 1);
            }
        });
    }

    onCanvasAdd() {
        const dialogRef = this.dialog.open(CanvasCreateDialogComponent, {
            minWidth: '320px'
        });

        dialogRef.afterClosed().subscribe((canvas: Canvas) => {
            if (canvas) {
                this.canvasService.createCanvas(canvas).subscribe((createdCanvas: Canvas) => {
                    const formatId = this.formatService.getCurrentFormat().id;
                    const phaseId = this.phaseService.getCurrentPhase().id;

                    this.router.navigate(['format', formatId, 'phase', phaseId, 'activity', this.activity.id, 'canvas', createdCanvas.id]);
                });
            }
        });
    }

    onCanvasDelete(canvas: Canvas) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.canvasDeletion',
                contentParams: { objectName: canvas.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.canvasService.deleteCanvas(canvas.id).subscribe();
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
                this.activityService
                    .updateFile(this.formatService.getCurrentFormat().id, this.phaseService.getCurrentPhase().id, file.id, body)
                    .subscribe(
                        () => {},
                        () => {
                            this.snackbarService.openWithMessage('snackbar.fileUpdateError');
                        }
                    );
            }
        });
    }

    onFileDelete(fileId: string) {
        const selectedFile = this.activity.files.find((file) => file.id === fileId);
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
                this.activityService
                    .deleteFile(this.ngxUS, this.formatService.getCurrentFormat().id, this.phaseService.getCurrentPhase().id, fileId)
                    .subscribe(
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
        this.activityService.onUploadOutput(
            this.ngxUS,
            this.formatService.getCurrentFormat().id,
            this.phaseService.getCurrentPhase().id,
            output
        );
    }

    onFileDownloadClicked(options: IDownloadOptions) {
        this.activityService.getDownloadLink(
            this.formatService.getCurrentFormat().id,
            this.phaseService.getCurrentPhase().id,
            options.fileId,
            options.download
        );
    }

    onInfoClicked() {
        this.dialog.open(DescriptionDialogComponent, {
            width: '536px',
            height: '716px',
            autoFocus: false
        });
    }
}
