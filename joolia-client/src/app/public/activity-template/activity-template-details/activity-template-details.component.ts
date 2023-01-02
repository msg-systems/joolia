import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivityTemplate, ChecklistItem, FileMeta, Library, SelectOption, Step } from '../../../core/models';
import {
    ActivityTemplateService,
    ConfigurationService,
    IQueryParams,
    LibraryService,
    UserService,
    UtilService
} from '../../../core/services';
import { TranslateService } from '@ngx-translate/core';
import { IDownloadOptions } from 'src/app/shared/components/file-list/file-list.component';
import { SubmissionModifySetting, SubmissionViewSetting } from '../../../core/enum/global/submission.enum';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

/**
 * The ActivityTemplateDetailsComponent displays the details of an activity template
 */
@Component({
    selector: 'app-activity-template-details',
    templateUrl: './activity-template-details.component.html',
    styleUrls: ['./activity-template-details.component.scss']
})
export class ActivityTemplateDetailsComponent implements OnInit, OnDestroy {
    currentLibrary: Library;
    activityTemplate: ActivityTemplate;
    stepList: ChecklistItem[];

    submissionModifySettingOptions: SelectOption[] = [];
    submissionViewSettingOptions: SelectOption[] = [];

    categoryOptions: SelectOption[];
    categoryIcon: string;

    subscriptions: Subscription[] = [];

    constructor(
        private libraryService: LibraryService,
        private activityTemplateService: ActivityTemplateService,
        private translate: TranslateService,
        private userService: UserService,
        private route: ActivatedRoute,
        private utilService: UtilService
    ) {}

    ngOnInit() {
        this.currentLibrary = this.libraryService.getCurrentLibrary();
        this.categoryOptions = this.libraryService.getCategoryOptions();

        // Initialization for the configuration options
        for (const modifyKey of Object.values(SubmissionModifySetting)) {
            this.submissionModifySettingOptions.push({
                display: 'activity.submissionModifySetting.' + modifyKey.toString().toLowerCase(),
                value: modifyKey
            });
        }

        for (const viewKey of Object.values(SubmissionViewSetting)) {
            this.submissionViewSettingOptions.push({
                display: 'activity.submissionViewSetting.' + viewKey.toString().toLowerCase(),
                value: viewKey
            });
        }

        this.subscriptions.push(
            this.activityTemplateService.activityTemplateChanged.subscribe((activityTemplate) => {
                this.activityTemplate = activityTemplate;
                this.categoryIcon = this.libraryService.getCategoryIcon(activityTemplate.category);
            })
        );

        this.loadActivityTemplate();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    private loadActivityTemplate() {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().activityTemplate.select.details,
            order: 'name'
        };

        return this.activityTemplateService
            .loadActivityTemplate(this.libraryService.getCurrentLibrary().id, this.route.snapshot.params['activityTemplateId'], queryParams)
            .subscribe(
                (activityTemplate) => {
                    this.activityTemplate = activityTemplate;
                    this.loadActivityTemplateFiles();
                },
                (err) => {
                    this.utilService.logAndNavigate(
                        err.error,
                        this,
                        this.loadActivityTemplate,
                        'snackbar.activityTemplateNotFound',
                        `library/${this.libraryService.getCurrentLibrary().id}/template/overview/activity`
                    );
                }
            );
    }

    private loadActivityTemplateFiles() {
        if (this.activityTemplate.createdBy.avatar && this.activityTemplate.createdBy.avatar.id) {
            this.userService.loadAvatarMeta(this.activityTemplate.createdBy.id).subscribe((avatar) => {
                this.activityTemplate.createdBy.avatar = avatar;
            });
        }

        this.stepList = this.activityTemplate.stepTemplates.map((step: Step) => {
            return { itemId: step.id, content: step.description, checked: false };
        });

        if (this.activityTemplate.keyVisual && this.activityTemplate.keyVisual.id && !this.activityTemplate.keyVisual.linkUrl) {
            this.activityTemplateService
                .loadActivityTemplateKeyVisualMeta(this.currentLibrary.id, this.activityTemplate.id)
                .subscribe((keyVisual: FileMeta) => (this.activityTemplate.keyVisual = keyVisual));
        }

        this.activityTemplateService
            .loadActivityTemplateFilesMeta(this.currentLibrary.id, this.activityTemplate.id)
            .subscribe((files) => (this.activityTemplate.files = files || []));
    }

    onFileDownloadClicked(options: IDownloadOptions) {
        this.activityTemplateService
            .getDownloadLink(this.currentLibrary.id, this.activityTemplate.id, options.fileId, options.download)
            .subscribe((download) => {
                this.activityTemplate.files = this.activityTemplate.files.map((file) => {
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
        this.activityTemplateService.updateActivityTemplate(this.currentLibrary.id, this.activityTemplate.id, category).subscribe();
    }
}
