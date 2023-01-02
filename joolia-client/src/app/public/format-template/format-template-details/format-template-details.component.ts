import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    ConfigurationService,
    FormatTemplateService,
    IQueryParams,
    LibraryService,
    UserService,
    UtilService
} from '../../../core/services';
import { FileMeta, FormatTemplate, Library, SelectOption } from '../../../core/models';
import { IDownloadOptions } from 'src/app/shared/components/file-list/file-list.component';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

/**
 * The FormatTemplateDetailsComponent displays the details of a format template
 */
@Component({
    selector: 'app-format-template-details',
    templateUrl: './format-template-details.component.html',
    styleUrls: ['./format-template-details.component.scss']
})
export class FormatTemplateDetailsComponent implements OnInit, OnDestroy {
    currentLibrary: Library;
    formatTemplate: FormatTemplate;
    categoryOptions: SelectOption[];
    categoryIcon: string;
    subscriptions: Subscription[] = [];

    constructor(
        private libraryService: LibraryService,
        private formatTemplateService: FormatTemplateService,
        private userService: UserService,
        private route: ActivatedRoute,
        private utilService: UtilService
    ) {}

    ngOnInit() {
        this.currentLibrary = this.libraryService.getCurrentLibrary();
        this.categoryOptions = this.libraryService.getCategoryOptions();

        this.subscriptions.push(
            this.formatTemplateService.formatTemplateChanged.subscribe((formatTemplate) => {
                this.formatTemplate = formatTemplate;
                this.categoryIcon = this.libraryService.getCategoryIcon(formatTemplate.category);
            })
        );

        this.loadFormatTemplate();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    private loadFormatTemplate() {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().formatTemplate.select.details
        };

        this.formatTemplateService
            .loadFormatTemplate(this.libraryService.getCurrentLibrary().id, this.route.snapshot.params['formatTemplateId'], queryParams)
            .subscribe(
                (formatTemplate) => {
                    this.formatTemplate = formatTemplate;
                    this.loadFormatTemplateFiles();
                },
                (err) => {
                    this.utilService.logAndNavigate(
                        err.error,
                        this,
                        this.loadFormatTemplate,
                        'snackbar.formatTemplateNotFound',
                        `library/${this.libraryService.getCurrentLibrary().id}/template/overview/format`
                    );
                }
            );
    }

    private loadFormatTemplateFiles() {
        if (this.formatTemplate.createdBy.avatar && this.formatTemplate.createdBy.avatar.id) {
            this.userService.loadAvatarMeta(this.formatTemplate.createdBy.id).subscribe((avatar) => {
                this.formatTemplate.createdBy.avatar = avatar;
            });
        }

        if (this.formatTemplate.keyVisual && this.formatTemplate.keyVisual.id && !this.formatTemplate.keyVisual.linkUrl) {
            this.formatTemplateService
                .loadFormatTemplateKeyVisualMeta(this.currentLibrary.id, this.formatTemplate.id)
                .subscribe((keyVisual: FileMeta) => (this.formatTemplate.keyVisual = keyVisual));
        }

        this.formatTemplateService
            .loadFormatTemplateFilesMeta(this.currentLibrary.id, this.formatTemplate.id)
            .subscribe((files) => (this.formatTemplate.files = files || []));
    }

    onFileDownloadClicked(options: IDownloadOptions) {
        this.formatTemplateService
            .getDownloadLink(this.currentLibrary.id, this.formatTemplate.id, options.fileId, options.download)
            .subscribe((download) => {
                this.formatTemplate.files = this.formatTemplate.files.map((file) => {
                    if (file.id === options.fileId) {
                        if (options.download) {
                            file.downloadUrl = download.fileUrl;
                        } else {
                            file.tabUrl = download.fileUrl;
                        }
                    }
                    return file;
                });
            });
    }

    onCategoryUpdate(category: string) {
        this.formatTemplateService.updateFormatTemplate(this.currentLibrary.id, this.formatTemplate.id, category).subscribe();
    }
}
