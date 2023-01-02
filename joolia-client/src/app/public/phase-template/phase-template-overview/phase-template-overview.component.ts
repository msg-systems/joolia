import { Action, PhaseTemplate, List } from '../../../core/models';
import { Subscription } from 'rxjs';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {
    PhaseTemplateService,
    LibraryService,
    SnackbarService,
    UtilService,
    IQueryParams,
    ConfigurationService,
    ViewTypeService
} from '../../../core/services';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ViewType } from 'src/app/core/enum/global/view-type.enum';

@Component({
    selector: 'app-phase-template-overview',
    templateUrl: './phase-template-overview.component.html',
    styleUrls: ['./phase-template-overview.component.scss']
})
export class PhaseTemplateOverviewComponent implements OnInit, OnDestroy {
    phaseTemplateMenuActions: Action[] = [
        {
            actionKey: 'buttons.delete',
            actionFunction: this.onPhaseTemplateDelete.bind(this)
        }
    ];

    phaseTemplates: List<PhaseTemplate>;
    phaseViewType: ViewType;

    private subscriptions: Subscription[] = [];
    isLoading = false;
    noMoreLoadable = false;
    infiniteScrollDistance: number;
    infiniteScrollThrottle: number;

    constructor(
        private phaseTemplateService: PhaseTemplateService,
        private libraryService: LibraryService,
        private dialog: MatDialog,
        private router: Router,
        private translate: TranslateService,
        private snackbarService: SnackbarService,
        private viewTypeService: ViewTypeService
    ) {}

    ngOnInit() {
        this.infiniteScrollDistance = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollDistance;
        this.infiniteScrollThrottle = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollThrottle;

        this.subscriptions.push(
            this.phaseTemplateService.phaseTemplateListChanged.subscribe((phaseTemplates: List<PhaseTemplate>) => {
                this.phaseTemplates = phaseTemplates;
                this.noMoreLoadable = this.phaseTemplates.entities.length >= this.phaseTemplates.count;
                this.isLoading = false;
            })
        );

        this.subscriptions.push(
            this.libraryService.categorySelectionChanged.subscribe((categories) => {
                this.getInitialPhaseTemplates(categories);
            })
        );

        this.subscriptions.push(
            this.viewTypeService.libraryViewTypeChanged.subscribe((libraryViewType: ViewType) => {
                this.phaseViewType = libraryViewType;
            })
        );

        this.getInitialPhaseTemplates();
        this.phaseViewType = this.viewTypeService.getLibraryViewType();
    }

    getInitialPhaseTemplates(selectCategories?: string[]) {
        const queryParams = this.getQueryParams(selectCategories);

        queryParams['skip'] = 0;
        queryParams['take'] = ConfigurationService.getConfiguration().configuration.pagination.phaseTemplate.initialAmount;

        this.loadMore(queryParams);
    }

    onLoadMore() {
        const queryParams = this.getQueryParams();

        queryParams['skip'] = this.phaseTemplates.entities.length;
        queryParams['take'] = ConfigurationService.getConfiguration().configuration.pagination.phaseTemplate.loadMore;

        this.loadMore(queryParams, true);
    }

    getQueryParams(selectCategories?: string[]) {
        let queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().phaseTemplate.select.overview,
            order: 'name'
        };

        const selectedCategories = selectCategories ? selectCategories : this.libraryService.getSelectedCategories();

        if (selectedCategories && selectedCategories.length > 0) {
            const filters = selectedCategories.map((s) => 'category=' + s);
            queryParams = UtilService.addFilterToQueryParams(queryParams, { 'category[]': filters.join(',') });
        }

        return queryParams;
    }

    loadMore(queryParams: IQueryParams, loadMore?: boolean) {
        this.isLoading = true;
        this.phaseTemplateService.loadPhaseTemplates(this.libraryService.getCurrentLibrary().id, queryParams, loadMore).subscribe();
    }

    getCategoryIcon(category: string): string {
        return this.libraryService.getCategoryIcon(category);
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    onPhaseTemplateClick(id: string) {
        this.router.navigate([`library/${this.libraryService.getCurrentLibrary().id}/template/details/phase/${id}`]);
    }

    onPhaseTemplateDelete(templateId: string) {
        const selectedPhaseTemplate = this.phaseTemplates.entities.find((phaseTemplate) => phaseTemplate.id === templateId);
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.phaseTemplateDeletion',
                contentParams: { objectName: selectedPhaseTemplate.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.phaseTemplateService.deletePhaseTemplate(this.libraryService.getCurrentLibrary().id, templateId).subscribe(
                    () => {
                        this.snackbarService.openWithMessage('snackbar.phaseTemplateDeleted', { objectName: selectedPhaseTemplate.name });
                    },
                    (err) => {
                        this.snackbarService.openWithMessage('snackbar.phaseTemplateDeletionError');
                    }
                );
            }
        });
    }

    isCardViewType() {
        return this.phaseViewType === ViewType.CARD_VIEW;
    }

    isListViewType() {
        return this.phaseViewType === ViewType.LIST_VIEW;
    }
}
