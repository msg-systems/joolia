import { Action, FileMeta, FormatTemplate, List } from '../../../core/models';
import { Subscription } from 'rxjs';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {
    ConfigurationService,
    FormatTemplateService,
    IQueryParams,
    LibraryService,
    SnackbarService,
    UtilService,
    ViewTypeService
} from '../../../core/services';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ViewType } from 'src/app/core/enum/global/view-type.enum';

@Component({
    selector: 'app-format-template-overview',
    templateUrl: './format-template-overview.component.html',
    styleUrls: ['./format-template-overview.component.scss']
})
export class FormatTemplateOverviewComponent implements OnInit, OnDestroy {
    formatTemplateMenuActions: Action[] = [
        {
            actionKey: 'buttons.delete',
            actionFunction: this.onFormatTemplateDelete.bind(this)
        }
    ];

    formatTemplates: List<FormatTemplate>;

    private subscriptions: Subscription[] = [];
    formatViewType: ViewType;
    isLoading = false;
    noMoreLoadable = false;
    infiniteScrollDistance: number;
    infiniteScrollThrottle: number;

    constructor(
        private formatTemplateService: FormatTemplateService,
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
            this.formatTemplateService.formatTemplateListChanged.subscribe((formatTemplates: List<FormatTemplate>) => {
                this.formatTemplates = formatTemplates;
                this.noMoreLoadable = this.formatTemplates.entities.length >= this.formatTemplates.count;
                this.isLoading = false;
                this.formatTemplates.entities.forEach((template: FormatTemplate) => {
                    if (template.keyVisual && template.keyVisual.id) {
                        if (!template.keyVisual.fileUrl && !template.keyVisual.linkUrl) {
                            const libraryId = this.libraryService.getCurrentLibrary().id;
                            this.formatTemplateService
                                .loadFormatTemplateKeyVisualMeta(libraryId, template.id)
                                .subscribe((keyVisual: FileMeta) => (template.keyVisual = keyVisual));
                        }
                    }
                });
            })
        );

        this.subscriptions.push(
            this.libraryService.categorySelectionChanged.subscribe((categories) => {
                this.getInitialFormatTemplates(categories);
            })
        );

        this.subscriptions.push(
            this.viewTypeService.libraryViewTypeChanged.subscribe((libraryViewType: ViewType) => {
                this.formatViewType = libraryViewType;
            })
        );

        this.getInitialFormatTemplates();
        this.formatViewType = this.viewTypeService.getLibraryViewType();
    }

    getInitialFormatTemplates(selectCategories?: string[]) {
        const queryParams = this.getQueryParams(selectCategories);

        queryParams['skip'] = 0;
        queryParams['take'] = ConfigurationService.getConfiguration().configuration.pagination.formatTemplate.initialAmount;

        this.loadMore(queryParams);
    }

    onLoadMore() {
        const queryParams = this.getQueryParams();

        queryParams['skip'] = this.formatTemplates.entities.length;
        queryParams['take'] = ConfigurationService.getConfiguration().configuration.pagination.formatTemplate.loadMore;

        this.loadMore(queryParams, true);
    }

    getQueryParams(categories?: string[]) {
        let queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().formatTemplate.select.overview,
            order: 'name'
        };

        const selectedCategories = categories ? categories : this.libraryService.getSelectedCategories();

        if (selectedCategories && selectedCategories.length > 0) {
            const filters = selectedCategories.map((s) => 'category=' + s);
            queryParams = UtilService.addFilterToQueryParams(queryParams, { 'category[]': filters.join(',') });
        }

        return queryParams;
    }

    loadMore(queryParams: IQueryParams, loadMore?: boolean) {
        this.isLoading = true;
        this.formatTemplateService.loadFormatTemplates(this.libraryService.getCurrentLibrary().id, queryParams, loadMore).subscribe();
    }

    getCategoryIcon(category: string): string {
        return this.libraryService.getCategoryIcon(category);
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    onFormatTemplateClick(id: string) {
        this.router.navigate([`library/${this.libraryService.getCurrentLibrary().id}/template/details/format/${id}`]);
    }

    onFormatTemplateDelete(templateId: string) {
        const selectedFormatTemplate = this.formatTemplates.entities.find((formatTemplate) => formatTemplate.id === templateId);
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.formatTemplateDeletion',
                contentParams: { objectName: selectedFormatTemplate.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.formatTemplateService.deleteFormatTemplate(this.libraryService.getCurrentLibrary().id, templateId).subscribe(
                    () => {
                        this.snackbarService.openWithMessage('snackbar.formatTemplateDeleted', { objectName: selectedFormatTemplate.name });
                    },
                    (err) => {
                        this.snackbarService.openWithMessage('snackbar.formatTemplateDeletionError');
                    }
                );
            }
        });
    }

    isCardViewType(): boolean {
        return this.formatViewType === ViewType.CARD_VIEW;
    }

    isListViewType(): boolean {
        return this.formatViewType === ViewType.LIST_VIEW;
    }
}
