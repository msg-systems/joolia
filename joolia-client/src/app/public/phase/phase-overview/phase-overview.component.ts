import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfigurationService, FormatService, IQueryParams, PhaseService, SnackbarService } from '../../../core/services';
import {
    Action,
    DurationUnit,
    Format,
    List,
    OrderObject,
    Permission,
    Phase,
    PhaseMap,
    PhaseState,
    SelectTemplateDialogData,
    UpdateEventBody
} from '../../../core/models';
import { EMPTY, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { catchError } from 'rxjs/operators';
import { ErrorDialogComponent } from '../../../shared/components/error-dialog/error-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { SelectTemplateDialogComponent } from 'src/app/shared/components/select-template-dialog/select-template-dialog.component';
import { OrderBy } from '../../../core/enum/global/order-by.enum';
import { TemplateType } from '../../../core/enum/global/template-type.enum';
import * as moment from 'moment';

/**
 * The PhaseOverviewComponent shows a separated view on the current phases of the currently loaded format. The HTML is divided into four
 * sections depending on the current status of each phase.
 */
@Component({
    selector: 'app-phase-overview',
    templateUrl: './phase-overview.component.html',
    styleUrls: ['./phase-overview.component.scss']
})
export class PhaseOverviewComponent implements OnInit, OnDestroy {
    actionBarActions: Action[] = [];

    format: Format;
    isEditAllowed = false;
    phaseListSorting: PhaseMap;
    phaseList: List<Phase>;
    isLoading = false;
    noMoreLoadable = false;
    infiniteScrollDistance: number;
    infiniteScrollThrottle: number;
    private subscription: Subscription;
    orderBy: OrderObject;
    orderObjects: OrderObject[] = [];

    constructor(
        private formatService: FormatService,
        private phaseService: PhaseService,
        private translate: TranslateService,
        private router: Router,
        private dialog: MatDialog,
        private snackbarService: SnackbarService
    ) {}

    ngOnInit() {
        this.infiniteScrollDistance = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollDistance;
        this.infiniteScrollThrottle = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollThrottle;
        this.format = this.formatService.getCurrentFormat();
        this.isEditAllowed = this.formatService.hasPermission(Permission.UPDATE_PHASE);
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
        this.orderBy = this.orderObjects[1];

        this.subscription = this.phaseService.phaseListChanged.subscribe((phaseList: List<Phase>) => {
            this.phaseList = phaseList;
            this.noMoreLoadable = this.phaseList.entities.length >= this.phaseList.count;
            this.isLoading = false;
            this.sortPhaseItems();
            this.addActionMenu();
        });
        this.getInitialPhases();

        this.initActions();
    }

    initActions() {
        this.actionBarActions = this.formatService.hasPermission(Permission.ADD_PHASE)
            ? [
                  {
                      actionKey: 'buttons.addPhase',
                      actionFunction: this.onPhaseCreate.bind(this)
                  },
                  {
                      actionKey: 'buttons.createTemplatePhase',
                      actionFunction: this.onTemplatePhaseCreate.bind(this)
                  }
              ]
            : [];
    }

    addActionMenu() {
        this.phaseList.entities.forEach((phase) => {
            phase['menuactions'] = this.formatService.hasPermission(Permission.DELETE_PHASE)
                ? [
                      {
                          actionKey: 'buttons.delete',
                          actionFunction: this.onPhaseDelete.bind(this)
                      },
                      {
                          actionKey: phase.visible ? 'buttons.hidePhase' : 'buttons.showPhase',
                          actionFunction: this.toggleVisibility.bind(this)
                      }
                  ]
                : [];
        });
    }

    getInitialPhases() {
        this.loadMore(0, ConfigurationService.getConfiguration().configuration.pagination.phase.initialAmount);
    }

    onLoadMore() {
        this.loadMore(
            this.phaseList.entities.length,
            ConfigurationService.getConfiguration().configuration.pagination.phase.loadMore,
            true
        );
    }

    loadMore(skip: number, take: number, loadMore?: boolean) {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().phase.select.overview,
            order: this.orderBy.queryParam
        };

        queryParams['skip'] = skip;
        queryParams['take'] = take;

        this.isLoading = true;
        this.phaseService.loadPhases(queryParams, loadMore).subscribe();
    }

    sortPhaseItems() {
        const newListSorting: PhaseMap = {
            activePhases: [],
            plannedPhases: [],
            unplannedPhases: [],
            pastPhases: []
        };

        for (const phase of this.phaseList.entities) {
            switch (phase.status) {
                case PhaseState.ACTIVE:
                    newListSorting.activePhases.push(phase);
                    break;
                case PhaseState.PLANNED:
                    newListSorting.plannedPhases.push(phase);
                    break;
                case PhaseState.UNPLANNED:
                    newListSorting.unplannedPhases.push(phase);
                    break;
                case PhaseState.PAST:
                    newListSorting.pastPhases.push(phase);
                    break;
            }
        }

        this.phaseListSorting = newListSorting;
    }

    onOrderPhases(key) {
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
        this.getInitialPhases();
    }

    private isDescending(key: string) {
        return this.orderBy.queryParam === key;
    }

    navigateToPhase(phaseId: string) {
        this.router.navigate(['format', this.format.id, 'phase', phaseId]);
    }

    onPhaseCreate() {
        const createBody = {
            name: this.translate.instant('labels.untitledPhase'),
            durationUnit: DurationUnit.MINUTES,
            startDate: moment().add(1, 'days')
        };

        this.phaseService.createPhase(createBody).subscribe(() => {
            this.onOrderPhases(this.orderBy);
            this.snackbarService.openWithMessage('snackbar.phaseCreated');
        });
    }

    onTemplatePhaseCreate() {
        const data: SelectTemplateDialogData = {
            headerKey: 'dialog.createPhaseFromTemplate.header',
            templateType: TemplateType.PHASE,
            submitKey: 'dialog.createPhaseFromTemplate.confirm'
        };
        const dialogRef = this.dialog.open(SelectTemplateDialogComponent, {
            width: '80vw',
            maxWidth: '1410px',
            maxHeight: '80vh',
            data
        });

        dialogRef.afterClosed().subscribe((templateId?: string) => {
            if (templateId) {
                this.phaseService.createPhaseFromTemplate(templateId).subscribe(() => {
                    this.onOrderPhases(this.orderBy);
                    this.snackbarService.openWithMessage('snackbar.phaseCreated');
                });
            }
        });
    }

    onPhaseClick(phaseId: string) {
        this.navigateToPhase(phaseId);
    }

    onPhaseUpdate(updateEvent: UpdateEventBody) {
        const updatedPhase = this.phaseList.entities.find((phase) => phase.id === updateEvent.updatedObjectId);

        if (updatedPhase[updateEvent.updatedFieldName] !== updateEvent.updatedFieldValue) {
            updatedPhase[updateEvent.updatedFieldName] = updateEvent.updatedFieldValue;
            const updateBody = {};
            updateBody[updateEvent.updatedFieldName] = updateEvent.updatedFieldValue;

            this.phaseService
                .updatePhase(updateEvent.updatedObjectId, updateBody)
                .pipe(
                    catchError(() => {
                        this.dialog.open(ErrorDialogComponent, {
                            width: '400px',
                            data: {
                                headerKey: 'dialog.errors.title',
                                contentKey: 'dialog.errors.content.phaseNotFound',
                                confirmKey: 'dialog.errors.confirm'
                            }
                        });
                        return EMPTY;
                    })
                )
                .subscribe();
        }
    }

    onPhaseDelete(phaseId: string) {
        const selectedPhase = this.phaseList.entities.find((phase) => phase.id === phaseId);
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.phaseDeletion',
                contentParams: { objectName: selectedPhase.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.phaseService.deletePhase(phaseId).subscribe(
                    () => {
                        this.snackbarService.openWithMessage('snackbar.phaseDeleted', { objectName: selectedPhase.name });
                    },
                    () => {
                        this.snackbarService.openWithMessage('snackbar.phaseDeletionError');
                    }
                );
            }
        });
    }

    toggleVisibility(phaseId: string) {
        const updatedPhase = this.phaseList.entities.find((phase) => phase.id === phaseId);
        this.phaseService.updatePhase(phaseId, { visible: !updatedPhase.visible }).subscribe();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
