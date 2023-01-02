import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileMeta, FilterToggleGroupItem, List, SelectTemplateDialogData, Template } from '../../../core/models';
import {
    ActivityTemplateService,
    ConfigurationService,
    FormatTemplateService,
    IQueryParams,
    LibraryService,
    PhaseTemplateService,
    UtilService
} from '../../../core/services';
import { TemplateType } from '../../../core/enum/global/template-type.enum';
import { capitalize } from 'lodash-es';

@Component({
    selector: 'app-select-template-dialog',
    templateUrl: './select-template-dialog.component.html',
    styleUrls: ['./select-template-dialog.component.scss']
})
export class SelectTemplateDialogComponent implements OnInit {
    constructor(
        private dialogRef: MatDialogRef<SelectTemplateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: SelectTemplateDialogData,
        private libraryService: LibraryService,
        private formatTemplateService: FormatTemplateService,
        private activityTemplateService: ActivityTemplateService,
        private phaseTemplateService: PhaseTemplateService
    ) {}

    libraryCategories: FilterToggleGroupItem[];
    templates: List<Template> = null;
    emptyStateData;
    infiniteScrollDistance: number;
    infiniteScrollThrottle: number;
    isLoading = false;
    noMoreLoadable = false;

    ngOnInit() {
        this.infiniteScrollDistance = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollDistance;
        this.infiniteScrollThrottle = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollThrottle;

        this.libraryCategories = this.libraryService.getCategories().map((category) => {
            return {
                value: category,
                label: 'labels.categoryValue.' + category,
                icon: this.libraryService.getCategoryIcon(category)
            };
        });
        this.libraryService.selectCategories([]);
        this.emptyStateData = {
            titleKey: `emptyStates.${this.data.templateType}Template.title`,
            contentKey: `emptyStates.${this.data.templateType}Template.shortContent`,
            altTextKey: `emptyStates.${this.data.templateType}Template.altText`
        };

        const initialAmout = ConfigurationService.getConfiguration().configuration.pagination[`${this.data.templateType}Template`]
            .initialAmount;

        this.libraryService.categorySelectionChanged.subscribe((categories) => {
            this.loadTemplates(0, initialAmout, categories);
        });

        this.loadTemplates(0, initialAmout);
    }

    onLoadMore() {
        this.loadTemplates(
            this.templates.entities.length,
            ConfigurationService.getConfiguration().configuration.pagination[`${this.data.templateType}Template`].loadMore,
            this.libraryService.getSelectedCategories(),
            true
        );
    }

    loadTemplates(skip: number, take: number, categories?: string[], loadMore?: boolean) {
        let queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams()[`${this.data.templateType}Template`].select.create
        };
        queryParams['skip'] = skip;
        queryParams['take'] = take;

        if (categories && categories.length > 0) {
            const filters = categories.map((s) => 'category=' + s);
            queryParams = UtilService.addFilterToQueryParams(queryParams, { 'category[]': filters.join(',') });
        }

        this.isLoading = true;
        this[`${this.data.templateType}TemplateService`]
            [`loadAll${capitalize(this.data.templateType)}Templates`](queryParams)
            .subscribe((templates: List<Template>) => {
                if (loadMore) {
                    this.templates.entities = this.templates.entities.concat(templates.entities);
                    this.templates.count = templates.count;
                } else {
                    this.templates = templates;
                }
                this.noMoreLoadable = this.templates.entities.length >= this.templates.count;
                this.isLoading = false;
                this.loadKeyVisuals();
            });
    }

    loadKeyVisuals() {
        if (this.data.templateType === TemplateType.ACTIVITY || this.data.templateType === TemplateType.FORMAT) {
            this.templates.entities.forEach((template: Template) => {
                if (template.keyVisual && template.keyVisual.id) {
                    if (!template.keyVisual.linkUrl && !template.keyVisual.fileUrl) {
                        this[`${this.data.templateType}TemplateService`]
                            [`load${capitalize(this.data.templateType)}TemplateKeyVisualMeta`](template.library.id, template.id)
                            .subscribe((keyVisual: FileMeta) => (template.keyVisual = keyVisual));
                    }
                }
            });
        }
    }

    onCategoryFilterChanged(categories: string[][]) {
        this.libraryService.selectCategories(categories[0]);
    }

    getCategoryIcon(category: string): string {
        return this.libraryService.getCategoryIcon(category);
    }

    onItemClick(templateId: string) {
        this.dialogRef.close(templateId);
    }
}
