import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FilterToggleGroupItem, Library } from '../../../../../core/models';
import {
    ActivityTemplateService,
    FormatTemplateService,
    LibraryService,
    PhaseTemplateService,
    ViewTypeService
} from '../../../../../core/services';
import { ViewType } from 'src/app/core/enum/global/view-type.enum';
import { Router } from '@angular/router';

@Component({
    selector: 'app-library-templates-overview',
    templateUrl: './library-template-overview.component.html',
    styleUrls: ['./library-template-overview.component.scss']
})
export class LibraryTemplateOverviewComponent implements OnInit, OnDestroy {
    library: Library;
    private loading: boolean;

    libraryViewType: ViewType;
    libraryCurrentCategory: string;

    private subscriptions: Subscription[] = [];
    libraryCategories: FilterToggleGroupItem[];

    constructor(
        private libraryService: LibraryService,
        private formatTemplateService: FormatTemplateService,
        private phaseTemplateService: PhaseTemplateService,
        private activityTemplateService: ActivityTemplateService,
        private router: Router,
        private viewTypeService: ViewTypeService
    ) {
        this.loading = false;
    }

    ngOnInit() {
        this.library = this.libraryService.getCurrentLibrary();
        this.libraryViewType = this.viewTypeService.getLibraryViewType();

        this.subscriptions.push(
            this.libraryService.libraryChanged.subscribe((library: Library) => {
                this.library = library;
                this.loading = false;
            })
        );

        this.subscriptions.push(this.formatTemplateService.formatTemplateListChanged.subscribe(() => (this.loading = false)));

        this.subscriptions.push(this.phaseTemplateService.phaseTemplateListChanged.subscribe(() => (this.loading = false)));

        this.subscriptions.push(this.activityTemplateService.activityTemplateListChanged.subscribe(() => (this.loading = false)));

        this.libraryCategories = this.libraryService.getCategories().map((category) => {
            return {
                value: category,
                label: 'labels.categoryValue.' + category,
                icon: this.libraryService.getCategoryIcon(category)
            };
        });
        this.libraryCurrentCategory = 'labels.formatTemplate';
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
        this.libraryService.selectCategories([]);
    }

    toggleEntity(target) {
        if (!this.router.url.endsWith(target)) {
            this.loading = true;
            this.libraryCurrentCategory = 'labels.' + target + 'Template';
        }
    }

    onCategoryFilterChanged(categories: string[][]) {
        this.libraryService.selectCategories(categories[0]);
    }

    onViewChanged(viewType: ViewType) {
        this.viewTypeService.setLibraryViewType(viewType);
    }
}
