import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { SessionStorageService } from 'ngx-webstorage';
import { Observable, of, Subscription } from 'rxjs';
import { first, mergeMap } from 'rxjs/operators';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { OrderBy } from '../../../core/enum/global/order-by.enum';
import {
    Action,
    FileMeta,
    Format,
    List,
    MultiSelectOptionData,
    OrderObject,
    Permission,
    SelectOption,
    SelectTemplateDialogData,
    SidenavItem,
    Workspace
} from '../../../core/models';
import {
    ConfigurationService,
    FormatService,
    FormatTemplateService,
    IQueryParams,
    LibraryService,
    SnackbarService,
    ViewTypeService,
    WorkspaceService
} from '../../../core/services';
import {
    FormatCreateDialogComponent,
    FormatCreationMethod
} from '../../../shared/components/format-create-dialog/format-create-dialog.component';
import { ViewType } from '../../../core/enum/global/view-type.enum';
import { SelectTemplateDialogComponent } from '../../../shared/components/select-template-dialog/select-template-dialog.component';
import { SelectionDialogComponent } from '../../../shared/components/selection-dialog/selection-dialog.component';
import { TemplateType } from '../../../core/enum/global/template-type.enum';
import { format } from 'path';

@Component({
    selector: 'app-format-overview',
    templateUrl: './format-overview.component.html',
    styleUrls: ['./format-overview.component.scss']
})
export class FormatOverviewComponent implements OnInit, OnDestroy {
    readonly actionBarActions: Action[] = [
        {
            actionKey: 'buttons.createFormat',
            actionFunction: this.onFormatCreate.bind(this)
        }
    ];

    public formatMenuActions: { format: Format; actions: Action[] }[] = [];

    formatList: List<Format>;
    formatViewType: ViewType;
    formatNameMaxLength: number;
    infiniteScrollDistance: number;
    infiniteScrollThrottle: number;
    subscriptions: Subscription[] = [];
    isLoading = false;
    noMoreLoadable = false;
    orderBy: OrderObject;
    orderObjects: OrderObject[] = [];

    constructor(
        private formatService: FormatService,
        private workspaceService: WorkspaceService,
        private translate: TranslateService,
        private libraryService: LibraryService,
        private formatTemplateService: FormatTemplateService,
        private snackbarService: SnackbarService,
        private storage: SessionStorageService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private viewTypeService: ViewTypeService
    ) {}

    ngOnInit() {
        this.storage.store('backTo', 'formats');
        const characterLimits = ConfigurationService.getConfiguration().configuration.characterLimits.format;
        this.formatNameMaxLength = characterLimits.name;
        this.infiniteScrollDistance = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollDistance;
        this.infiniteScrollThrottle = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollThrottle;

        this.orderObjects = [
            {
                key: OrderBy.NAME,
                queryParam: OrderBy.NAME,
                icon: 'keyboard_arrow_up'
            },
            {
                key: OrderBy.DATE,
                queryParam: OrderBy.DATE,
                icon: 'keyboard_arrow_up'
            }
        ];
        this.orderBy = this.orderObjects[0];

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
            select: ConfigurationService.getQueryParams().format.select.overview,
            order: this.orderBy.queryParam
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
        this.formatService.loadFormats(queryParams, loadMore).subscribe();
    }

    loadFormatMenuActions() {
        this.formatMenuActions = [];
        this.formatList.entities.forEach((f) => {
            this.formatMenuActions.push({
                format: f,
                actions: this.isEditAllowed(f)
                    ? [
                          {
                              actionKey: !f.containsTechnicalUser ? 'buttons.connectToTeams' : 'buttons.disconnectTeams',
                              actionFunction: this.onConnectTechnicalUser.bind(this)
                          },
                          {
                              actionKey: 'buttons.delete',
                              actionFunction: this.onFormatDelete.bind(this)
                          }
                      ]
                    : []
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
        const dialogRef = this.dialog.open(FormatCreateDialogComponent);

        dialogRef.afterClosed().subscribe((selectedFormatCreationMethod) => {
            if (selectedFormatCreationMethod === FormatCreationMethod.Template) {
                this.onTemplateFormatCreate();
            } else if (selectedFormatCreationMethod === FormatCreationMethod.Blank) {
                this.onBlankFormatCreate();
            }
        });
    }

    onBlankFormatCreate() {
        this.selectWorkspace('createBlankFormat').subscribe((selectedWorkspaceObject: any) => {
            if (selectedWorkspaceObject && selectedWorkspaceObject['workspace']) {
                const selectedWorkspace: Workspace = selectedWorkspaceObject['workspace'];
                const formatBody = {
                    name: this.translate.instant('labels.untitledFormat'),
                    workspace: selectedWorkspace.id
                };

                this.formatService.createFormat(formatBody).subscribe((createdFormat) => {
                    this.router.navigate(['format', createdFormat.id]);
                });
            }
        });
    }

    onTemplateFormatCreate() {
        const data: SelectTemplateDialogData = {
            headerKey: 'dialog.createFormatFromTemplate.header',
            templateType: TemplateType.FORMAT,
            submitKey: 'dialog.createFormatFromTemplate.confirm'
        };
        this.selectWorkspace('createFormatFromTemplate').subscribe((selectedObject: any) => {
            if (selectedObject && selectedObject['workspace']) {
                const selectedWorkspace: Workspace = selectedObject['workspace'];
                const dialogRef = this.dialog.open(SelectTemplateDialogComponent, {
                    width: '80vw',
                    minWidth: '320px',
                    maxWidth: '1410px',
                    maxHeight: '80vh',
                    data
                });

                dialogRef.afterClosed().subscribe((templateId?: string) => {
                    if (templateId) {
                        this.formatService.createFormatFromTemplate(templateId, selectedWorkspace.id).subscribe((createdFormat) => {
                            this.router.navigate(['format', createdFormat.id]);
                        });
                    }
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
                    () => {
                        this.snackbarService.openWithMessage('snackbar.formatDeletionError');
                    }
                );
            }
        });
    }

    onConnectTechnicalUser(formatId: string) {
        const index = this.formatList.entities.findIndex((format) => format.id === formatId);
        if (index === -1) {
            return;
        }
        if (!this.formatList.entities[index].containsTechnicalUser) {
            this.formatService
                .addFormatMember(formatId, [], ` ${this.translate.instant('dialog.sendMailTo.technical', { id: formatId })}`, true)
                .subscribe(
                    () => {
                        this.snackbarService.openWithMessage('snackbar.technicalUserAdded');
                        this.toggleActionKey(formatId, 'buttons.connectToTeams', 'buttons.disconnectTeams');
                        this.formatList.entities[index].containsTechnicalUser = true;
                    },
                    () => {
                        this.snackbarService.openWithMessage('snackbar.technicalUserAddedError');
                    }
                );
        } else {
            this.formatService.removeFormatMember(formatId, null, true).subscribe(
                () => {
                    this.snackbarService.openWithMessage('snackbar.technicalUserRemoved');
                    this.toggleActionKey(formatId, 'buttons.disconnectTeams', 'buttons.connectToTeams');
                    this.formatList.entities[index].containsTechnicalUser = false;
                },
                () => {
                    this.snackbarService.openWithMessage('snackbar.technicalUserRemovedError');
                }
            );
        }
    }

    onOrderFormats(key) {
        if (key === OrderBy.NAME) {
            if (this.isDescending(key)) {
                this.orderObjects[0].queryParam = OrderBy.NAME_DESC;
                this.orderObjects[0].icon = 'keyboard_arrow_down';
            } else {
                this.orderObjects[0].queryParam = OrderBy.NAME;
                this.orderObjects[0].icon = 'keyboard_arrow_up';
            }
            this.orderBy = this.orderObjects[0];
        } else {
            if (key === OrderBy.DATE) {
                if (this.isDescending(key)) {
                    this.orderObjects[1].queryParam = OrderBy.DATE_DESC;
                    this.orderObjects[1].icon = 'keyboard_arrow_down';
                } else {
                    this.orderObjects[1].queryParam = OrderBy.DATE;
                    this.orderObjects[1].icon = 'keyboard_arrow_up';
                }
                this.orderBy = this.orderObjects[1];
            }
        }

        this.getInitialFormats();
    }

    private isDescending(key: string) {
        return this.orderBy.queryParam === key;
    }

    private selectWorkspace(dialogKey: string): Observable<Workspace> {
        const queryParams: IQueryParams = {
            select: 'id,name'
        };

        return this.workspaceService.loadWorkspaces(queryParams).pipe(
            mergeMap(() => {
                if (this.workspaceService.getCurrentWorkspaces().entities.length === 1) {
                    return of({ workspace: this.workspaceService.getCurrentWorkspaces().entities[0] });
                }

                const selectableWorkspaces: SelectOption[] = [];

                for (const workspace of this.workspaceService.getCurrentWorkspaces().entities) {
                    selectableWorkspaces.push({
                        display: workspace.name,
                        value: workspace
                    });
                }

                const workspaceSelectionDetail: MultiSelectOptionData = {
                    entityName: 'workspace',
                    selectOptions: selectableWorkspaces,
                    required: true
                };

                const confirmKey = dialogKey === 'createBlankFormat' ? 'buttons.create' : 'buttons.confirm';
                const dialogRef = this.dialog.open(SelectionDialogComponent, {
                    width: '400px',
                    data: {
                        headerKey: 'dialog.' + dialogKey + '.header',
                        contentKey: 'dialog.' + dialogKey + '.content',
                        cancelKey: 'buttons.cancel',
                        confirmKey: confirmKey,
                        selectionDetails: [workspaceSelectionDetail]
                    }
                });

                return dialogRef.afterClosed();
            }),
            first()
        );
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

    private toggleActionKey(formatId: string, currentActionKey: string, newActionKey: string) {
        this.formatMenuActions.forEach((f) => {
            if (f.format.id === formatId) {
                f.actions.map((action) => {
                    if (action.actionKey === currentActionKey) {
                        action.actionKey = newActionKey;
                    }
                    return action;
                });
            }
        });
    }
}
