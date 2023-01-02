import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    PhaseTemplateService,
    LibraryService,
    UserService,
    ActivityTemplateService,
    IQueryParams,
    UtilService,
    ConfigurationService
} from '../../../core/services';
import { PhaseTemplate, Library, SelectOption } from '../../../core/models';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

/**
 * The PhaseTemplateDetailsComponent displays the details of a phase template
 */
@Component({
    selector: 'app-phase-template-details',
    templateUrl: './phase-template-details.component.html',
    styleUrls: ['./phase-template-details.component.scss']
})
export class PhaseTemplateDetailsComponent implements OnInit, OnDestroy {
    currentLibrary: Library;
    phaseTemplate: PhaseTemplate;

    categoryOptions: SelectOption[];
    categoryIcon: string;

    subscriptions: Subscription[] = [];

    constructor(
        private libraryService: LibraryService,
        private phaseTemplateService: PhaseTemplateService,
        private activityTemplateService: ActivityTemplateService,
        private userService: UserService,
        private route: ActivatedRoute,
        private utilService: UtilService
    ) {}

    ngOnInit() {
        this.currentLibrary = this.libraryService.getCurrentLibrary();
        this.categoryOptions = this.libraryService.getCategoryOptions();

        this.subscriptions.push(
            this.phaseTemplateService.phaseTemplateChanged.subscribe((phaseTemplate) => {
                this.phaseTemplate = phaseTemplate;
                this.categoryIcon = this.libraryService.getCategoryIcon(phaseTemplate.category);
            })
        );

        this.loadPhaseTemplate();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    private loadPhaseTemplate() {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().phaseTemplate.select.details
        };

        return this.phaseTemplateService
            .loadPhaseTemplate(this.libraryService.getCurrentLibrary().id, this.route.snapshot.params['phaseTemplateId'], queryParams)
            .subscribe(
                (phaseTemplate) => {
                    this.phaseTemplate = phaseTemplate;
                    this.loadPhaseTemplateFiles();
                },
                (err) => {
                    this.utilService.logAndNavigate(
                        err.error,
                        this,
                        this.loadPhaseTemplate,
                        'snackbar.phaseTemplateNotFound',
                        `library/${this.libraryService.getCurrentLibrary().id}/template/overview/phase`
                    );
                }
            );
    }

    private loadPhaseTemplateFiles() {
        if (this.phaseTemplate.createdBy.avatar && this.phaseTemplate.createdBy.avatar.id) {
            this.userService.loadAvatarMeta(this.phaseTemplate.createdBy.id).subscribe((avatar) => {
                this.phaseTemplate.createdBy.avatar = avatar;
            });
        }

        if (this.phaseTemplate.activityTemplates && this.phaseTemplate.activityTemplates.length > 0) {
            this.phaseTemplate.activityTemplates.forEach((activityTemplate) => {
                this.activityTemplateService
                    .loadActivityTemplateFilesMeta(this.currentLibrary.id, activityTemplate.id)
                    .subscribe((files) => (activityTemplate.files = files || []));
            });
        }
    }

    onCategoryUpdate(category: string) {
        this.phaseTemplateService.updatePhaseTemplate(this.currentLibrary.id, this.phaseTemplate.id, category).subscribe();
    }
}
