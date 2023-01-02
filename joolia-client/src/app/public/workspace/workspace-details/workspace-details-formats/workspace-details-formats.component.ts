import { Component, OnDestroy, OnInit } from '@angular/core';
import { Action, FileMeta, Format, List, Permission, SelectTemplateDialogData, Workspace } from '../../../../core/models';
import { Subscription } from 'rxjs';
import {
    ConfigurationService,
    FormatService,
    IQueryParams,
    SnackbarService,
    ViewTypeService,
    WorkspaceService
} from '../../../../core/services';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { SelectTemplateDialogComponent } from '../../../../shared/components/select-template-dialog/select-template-dialog.component';
import {
    FormatCreateDialogComponent,
    FormatCreationMethod
} from '../../../../shared/components/format-create-dialog/format-create-dialog.component';
import { ViewType } from '../../../../core/enum/global/view-type.enum';
import { TemplateType } from '../../../../core/enum/global/template-type.enum';

/**
 * The WorkspaceDetailsFormatComponent displays an overview of all formats within a specific workspace.
 */
@Component({
    selector: 'app-workspace-details-formats',
    templateUrl: './workspace-details-formats.component.html',
    styleUrls: ['./workspace-details-formats.component.scss']
})
export class WorkspaceDetailsFormatsComponent implements OnInit, OnDestroy {
    readonly actionBarActions: Action[] = [
        {
            actionKey: 'buttons.createFormat',
            actionFunction: this.onFormatCreate.bind(this)
        }
    ];

    private formatMenuActions: { format: Format; actions: Action[] }[] = [];

    workspace: Workspace;
    formatList: List<Format>;
    formatViewType: ViewType;
    formatNameMaxLength: number;
    infiniteScrollDistance: number;
    infiniteScrollThrottle: number;
    subscriptions: Subscription[] = [];
    isLoading = false;
    noMoreLoadable = false;

    // TODO: Think about a way if and how we could unify both format overview pages
    constructor(
        private formatService: FormatService,
        private workspaceService: WorkspaceService,
        private translate: TranslateService,
        private snackbarService: SnackbarService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private viewTypeService: ViewTypeService
    ) {}

    ngOnInit() {
        this.workspace = this.workspaceService.getCurrentWorkspace();
        const characterLimits = ConfigurationService.getConfiguration().configuration.characterLimits.format;

        this.formatNameMaxLength = characterLimits.name;
        this.infiniteScrollDistance = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollDistance;
        this.infiniteScrollThrottle = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollThrottle;

        this.subscriptions.push(
            this.formatService.formatListChanged.subscribe((formatList: List<Format>) => {
                this.formatList = formatList;
                this.noMoreLoadable = this.formatList.entities.length >= this.formatList.count;
                this.isLoading = false;
                this.formatList.entities.forEach((format: Format) => {
                    if (format.keyVisual && format.keyVisual.id && !format.keyVisual.linkUrl) {
                        this.formatService
                            .loadFormatKeyVisualMeta(format.id)
                            .subscribe((keyVisual: FileMeta) => (format.keyVisual = keyVisual));
                    }
                });
                this.loadFormatMenuActions();
            })
        );

        this.subscriptions.push(
            this.route.queryParams.subscribe(() => {
                this.getInitialFormats();
            })
        );

        this.subscriptions.push(
            this.viewTypeService.formatViewTypeChanged.subscribe((formatViewType: ViewType) => {
                this.formatViewType = formatViewType;
            })
        );

        this.formatViewType = this.viewTypeService.getFormatViewType();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    setStartDateFormat(format: Format) {
        if (moment(format.startDate).isSame(format.endDate, 'day')) {
            // Format begins and ends the same day
            return 'L | LT';
        }
        if (moment(format.startDate).isSame(format.endDate, 'year')) {
            // Format begins and ends the same year
            return 'L';
        }

        return 'L';
    }

    setEndDateFormat(format: Format) {
        if (moment(format.startDate).isSame(format.endDate, 'day')) {
            // Format begins and ends the same day
            return 'LT';
        }

        return 'L';
    }

    getInitialFormats() {
        this.loadMore(0, ConfigurationService.getConfiguration().configuration.pagination.format.initialAmount);
    }

    onLoadMore() {
        this.loadMore(
            this.formatList.entities.length,
            ConfigurationService.getConfiguration().configuration.pagination.format.loadMore,
            true
        );
    }

    getQueryParams() {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().workspace.select.formatOverview,
            order: 'name'
        };

        if (this.route.snapshot.queryParams.recentlyUsed) {
            queryParams['order'] = '-updatedAt';
        }

        return queryParams;
    }

    loadMore(skip: number, take: number, loadMore?: boolean) {
        const queryParams = this.getQueryParams();

        queryParams['skip'] = skip;
        queryParams['take'] = take;

        this.isLoading = true;
        this.formatService.loadWorkspaceFormats(this.workspaceService.getCurrentWorkspace().id, queryParams, loadMore).subscribe();
    }

    loadFormatMenuActions() {
        this.formatMenuActions = [];
        this.formatList.entities.forEach((f) => {
            this.formatMenuActions.push({
                format: f,
                actions: this.isEditAllowed(f) ? [{ actionKey: 'buttons.delete', actionFunction: this.onFormatDelete.bind(this) }] : []
            });
        });
    }

    getFormatMenuActions(format: Format) {
        return this.formatMenuActions.find((f) => f.format === format).actions;
    }

    isEditAllowed(format: Format): boolean {
        return this.formatService.hasPermission(Permission.UPDATE_FORMAT, format);
    }

    onFormatClick(formatId: string) {
        this.router.navigate(['format', formatId]);
    }

    onFormatCreate() {
        const dialogRef = this.dialog.open(FormatCreateDialogComponent, { width: '440px' });

        dialogRef.afterClosed().subscribe((selectedFormatCreationMethod) => {
            if (selectedFormatCreationMethod === FormatCreationMethod.Template) {
                this.onTemplateFormatCreate();
            } else if (selectedFormatCreationMethod === FormatCreationMethod.Blank) {
                this.onBlankFormatCreate();
            }
        });
    }

    onBlankFormatCreate() {
        const formatBody = {
            name: this.translate.instant('labels.untitledFormat'),
            workspace: this.workspaceService.getCurrentWorkspace().id
        };

        this.formatService.createFormat(formatBody).subscribe((createdFormat) => {
            this.router.navigate(['format', createdFormat.id]);
        });
    }

    onTemplateFormatCreate() {
        const data: SelectTemplateDialogData = {
            headerKey: 'dialog.createFormatFromTemplate.header',
            templateType: TemplateType.FORMAT,
            submitKey: 'dialog.createFormatFromTemplate.confirm'
        };

        const dialogRef = this.dialog.open(SelectTemplateDialogComponent, {
            width: '80vw',
            maxWidth: '1410px',
            maxHeight: '80vh',
            data
        });

        dialogRef.afterClosed().subscribe((templateId?: string) => {
            if (templateId) {
                this.formatService
                    .createFormatFromTemplate(templateId, this.workspaceService.getCurrentWorkspace().id)
                    .subscribe((createdFormat) => {
                        this.router.navigate(['format', createdFormat.id]);
                    });
            }
        });
    }

    onFormatUpdate(formatId: string, newFormatName: string) {
        const format = this.formatList.entities.find((f) => f.id === formatId);
        if (format && format.name !== newFormatName) {
            format.name = newFormatName;
            const updatedFormat = {
                name: newFormatName
            };

            this.formatService.patchFormat(formatId, updatedFormat).subscribe();
        }
    }

    onFormatDelete(formatId: string) {
        const selectedFormat = this.formatList.entities.find((format) => format.id === formatId);
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.formatDeletion',
                contentParams: { objectName: selectedFormat.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.formatService.deleteFormat(formatId).subscribe(
                    () => {
                        this.snackbarService.openWithMessage('snackbar.formatDeleted', { objectName: selectedFormat.name });
                    },
                    (err) => {
                        this.snackbarService.openWithMessage('snackbar.formatDeletionError');
                    }
                );
            }
        });
    }

    onViewChanged(viewType: ViewType) {
        this.viewTypeService.setFormatViewType(viewType);
    }

    isCardViewType(): boolean {
        return this.formatViewType === ViewType.CARD_VIEW;
    }

    isListViewType(): boolean {
        return this.formatViewType === ViewType.LIST_VIEW;
    }
}
