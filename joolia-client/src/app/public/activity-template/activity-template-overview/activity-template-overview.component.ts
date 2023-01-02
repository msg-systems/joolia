import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Action, ActivityTemplate, FileMeta, List } from '../../../core/models';
import {
    ActivityTemplateService,
    ConfigurationService,
    IQueryParams,
    LibraryService,
    SnackbarService,
    UtilService,
    ViewTypeService
} from '../../../core/services';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ViewType } from 'src/app/core/enum/global/view-type.enum';

/**
 * The ActivityTemplateOverviewComponent displays an overview of all activity templates related to the selected library.
 */
@Component({
    selector: 'app-activity-template-overview',
    templateUrl: './activity-template-overview.component.html',
    styleUrls: ['./activity-template-overview.component.scss']
})
export class ActivityTemplateOverviewComponent implements OnInit, OnDestroy {
    activityTemplateMenuActions: Action[] = [
        {
            actionKey: 'buttons.delete',
            actionFunction: this.onActivityTemplateDelete.bind(this)
        }
    ];

    activityTemplates: List<ActivityTemplate>;
    dummyImage: FileMeta;
    activityViewType: ViewType;

    private subscriptions: Subscription[] = [];
    isLoading = false;
    noMoreLoadable = false;
    infiniteScrollDistance: number;
    infiniteScrollThrottle: number;

    constructor(
        private libraryService: LibraryService,
        private activityTemplateService: ActivityTemplateService,
        private dialog: MatDialog,
        private router: Router,
        private translate: TranslateService,
        private snackbarService: SnackbarService,
        private viewTypeService: ViewTypeService
    ) {}

    ngOnInit() {
        this.dummyImage = <FileMeta>{ fileUrl: ConfigurationService.getConfiguration().appBaseHref + 'assets/dummy_keyvisual.jpg' };
        this.infiniteScrollDistance = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollDistance;
        this.infiniteScrollThrottle = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollThrottle;

        this.subscriptions.push(
            this.activityTemplateService.activityTemplateListChanged.subscribe((activityTemplates: List<ActivityTemplate>) => {
                this.activityTemplates = activityTemplates;
                this.noMoreLoadable = this.activityTemplates.entities.length >= this.activityTemplates.count;
                this.isLoading = false;
                this.activityTemplates.entities.forEach((template: ActivityTemplate) => {
                    if (template.keyVisual && template.keyVisual.id) {
                        if (!template.keyVisual.fileUrl && !template.keyVisual.linkUrl) {
                            const libraryId = this.libraryService.getCurrentLibrary().id;
                            this.activityTemplateService
                                .loadActivityTemplateKeyVisualMeta(libraryId, template.id)
                                .subscribe((keyVisual: FileMeta) => (template.keyVisual = keyVisual));
                        }
                    }
                });
            })
        );

        this.subscriptions.push(
            this.libraryService.categorySelectionChanged.subscribe((categories) => {
                this.getInitialActivityTemplates(categories);
            })
        );

        this.subscriptions.push(
            this.viewTypeService.libraryViewTypeChanged.subscribe((libraryViewType: ViewType) => {
                this.activityViewType = libraryViewType;
            })
        );

        this.getInitialActivityTemplates();
        this.activityViewType = this.viewTypeService.getLibraryViewType();
    }

    getInitialActivityTemplates(selectCategories?: string[]) {
        const queryParams = this.getQueryParams(selectCategories);

        queryParams['skip'] = 0;
        queryParams['take'] = ConfigurationService.getConfiguration().configuration.pagination.activityTemplate.initialAmount;

        this.loadMore(queryParams);
    }

    onLoadMore() {
        const queryParams = this.getQueryParams();

        queryParams['skip'] = this.activityTemplates.entities.length;
        queryParams['take'] = ConfigurationService.getConfiguration().configuration.pagination.activityTemplate.loadMore;

        this.loadMore(queryParams, true);
    }

    getQueryParams(selectCategories?: string[]) {
        let queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().activityTemplate.select.overview,
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
        this.activityTemplateService.loadActivityTemplates(this.libraryService.getCurrentLibrary().id, queryParams, loadMore).subscribe();
    }

    getCategoryIcon(category: string): string {
        return this.libraryService.getCategoryIcon(category);
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    onActivityTemplateClick(id: string) {
        this.router.navigate([`library/${this.libraryService.getCurrentLibrary().id}/template/details/activity/${id}`]);
    }

    onActivityTemplateDelete(templateId: string) {
        const selectedActivityTemplate = this.activityTemplates.entities.find((activityTemplate) => activityTemplate.id === templateId);
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.activityTemplateDeletion',
                contentParams: { objectName: selectedActivityTemplate.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.activityTemplateService.deleteActivityTemplate(this.libraryService.getCurrentLibrary().id, templateId).subscribe(
                    () => {
                        this.snackbarService.openWithMessage('snackbar.activityTemplateDeleted', {
                            objectName: selectedActivityTemplate.name
                        });
                    },
                    (err) => {
                        this.snackbarService.openWithMessage('snackbar.formatTemplateDeletionError');
                    }
                );
            }
        });
    }

    isCardViewType() {
        return this.activityViewType === ViewType.CARD_VIEW;
    }

    isListViewType() {
        return this.activityViewType === ViewType.LIST_VIEW;
    }
}
