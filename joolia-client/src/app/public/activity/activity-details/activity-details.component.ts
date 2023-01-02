import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    ActivityService,
    ActivityTemplateService,
    ConfigurationService,
    FormatService,
    IQueryParams,
    LibraryService,
    PhaseService,
    SnackbarService,
    UtilService
} from '../../../core/services';
import {
    Activity,
    ActivityTemplate,
    Library,
    Permission,
    Phase,
    SelectOption,
    TabnavItem,
    MultiSelectOptionData
} from '../../../core/models';
import { Subscription } from 'rxjs';
import { DurationPipe } from '../../../shared/pipes';
import { SelectionDialogComponent } from '../../../shared/components/selection-dialog/selection-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-activity-details',
    templateUrl: './activity-details.component.html',
    styleUrls: ['./activity-details.component.scss'],
    providers: [DurationPipe]
})
export class ActivityDetailsComponent implements OnInit, OnDestroy {
    readonly tabNavbarItems: TabnavItem[] = [
        {
            tabKey: 'labels.details',
            path: 'details'
        },
        {
            tabKey: 'labels.progressCount',
            tabArgument: () => {
                return { count: this.getStepCount() };
            },
            path: 'progress'
        },
        {
            tabKey: 'labels.submissionsCount',
            tabArgument: () => {
                return { count: this.getSubmissionCount() };
            },
            path: 'submission'
        }
    ];

    phase: Phase;
    activity: Activity;
    activityNameMaxLength: number;
    activityShortDescriptionMaxLength: number;
    subscriptions: Subscription[] = [];
    durationDropdownValues: SelectOption[] = [];
    isEditAllowed = false;
    isTemplateSaveAllowed = false;
    categoryOptions: SelectOption[] = [];

    constructor(
        private formatService: FormatService,
        private phaseService: PhaseService,
        private activityService: ActivityService,
        private libraryService: LibraryService,
        private activityTemplateService: ActivityTemplateService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private durPipe: DurationPipe,
        private snackbarService: SnackbarService,
        private utilService: UtilService
    ) {}

    ngOnInit() {
        const characterLimits = ConfigurationService.getConfiguration().configuration.characterLimits.activity;

        this.activityNameMaxLength = characterLimits.name;
        this.activityShortDescriptionMaxLength = characterLimits.shortDescription;

        this.phase = this.phaseService.getCurrentPhase();

        this.getDurationDropdownValues();

        this.subscriptions.push(
            this.route.params.subscribe((params) => {
                if (!this.activity || this.activity.id !== params['activityId']) {
                    this.loadActivity();
                }
            })
        );

        this.subscriptions.push(
            this.activityService.activityChanged.subscribe((activity: Activity) => {
                this.activity = activity;
                this.categoryOptions = this.libraryService.getCategoryOptions();
            })
        );

        this.isEditAllowed = this.formatService.hasPermission(Permission.UPDATE_ACTIVITY);
        this.isTemplateSaveAllowed = this.formatService.hasPermission(Permission.UPDATE_ACTIVITY);

        this.loadActivity();
    }

    private loadActivity() {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().activity.select.details
        };

        this.activityService
            .loadActivity(
                this.formatService.getCurrentFormat().id,
                this.phaseService.getCurrentPhase().id,
                this.route.snapshot.params['activityId'],
                queryParams
            )
            .subscribe(
                (data) => {},
                (err) => {
                    this.utilService.logAndNavigate(
                        err.error,
                        this,
                        this.loadActivity,
                        'snackbar.activityNotFound',
                        `format/${this.formatService.getCurrentFormat().id}/phase/${this.phase.id}`
                    );
                }
            );
    }

    private getDurationDropdownValues() {
        const durationRanges = ConfigurationService.getConfiguration().configuration.ranges.duration.activity[this.phase.durationUnit];
        for (let i = durationRanges.from; i <= durationRanges.to; i = i + durationRanges.step) {
            this.durationDropdownValues.push(<SelectOption>{
                display: this.durPipe.transform(i, this.phase.durationUnit),
                value: i
            });
        }
    }

    private getStepCount() {
        if (this.activity) {
            if (this.activity.steps) {
                return this.activity.steps.count;
            }
            if (this.activity.stepCount !== undefined) {
                return this.activity.stepCount;
            }
        }
        return '?';
    }

    private getSubmissionCount() {
        if (this.activity && this.activity.submissionCount !== undefined) {
            return this.activity.submissionCount;
        }
        return '?';
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    onActivityUpdate(fieldName: string, updatedValue: any) {
        if (this.activity.hasOwnProperty(fieldName) && this.activity[fieldName] !== updatedValue) {
            this.activity[fieldName] = updatedValue;
            const updatedBody = {};
            updatedBody[fieldName] = updatedValue;

            this.activityService
                .updateActivity(
                    this.formatService.getCurrentFormat().id,
                    this.phaseService.getCurrentPhase().id,
                    this.activity.id,
                    updatedBody
                )
                .subscribe();
        }
    }

    onTemplateSave() {
        const queryParams: IQueryParams = {
            select: 'id,name'
        };

        this.libraryService.loadLibraries(queryParams).subscribe(() => {
            const selectableLibraries: SelectOption[] = [];

            for (const library of this.libraryService.getCurrentLibraries().entities) {
                selectableLibraries.push({
                    display: library.name,
                    value: library
                });
            }

            const librarySelectionDetail: MultiSelectOptionData = {
                entityName: 'library',
                selectOptions: selectableLibraries,
                required: true
            };
            const categorySelectionDetail: MultiSelectOptionData = {
                entityName: 'category',
                selectOptions: this.categoryOptions,
                required: true
            };

            const dialogRef = this.dialog.open(SelectionDialogComponent, {
                width: '400px',
                data: {
                    headerKey: 'dialog.storeAsMethodTemplate.header',
                    contentKey: 'dialog.storeAsMethodTemplate.content',
                    cancelKey: 'buttons.cancel',
                    confirmKey: 'buttons.create',
                    selectionDetails: [librarySelectionDetail, categorySelectionDetail]
                }
            });

            dialogRef.afterClosed().subscribe((selectedValues: any) => {
                if (selectedValues && selectedValues['library'] && selectedValues['category']) {
                    const selectedLibrary: Library = selectedValues['library'];
                    const selectedCategory = selectedValues['category'];
                    this.activityTemplateService
                        .createActivityTemplate(selectedLibrary.id, this.activity.id, selectedCategory)
                        .subscribe((activityTemplate: ActivityTemplate) => {
                            this.snackbarService
                                .openWithMessage('snackbar.methodTemplateCreated', { libraryName: selectedLibrary.name }, 'buttons.show')
                                .onAction()
                                .subscribe(() => {
                                    this.router.navigate([
                                        `library/${selectedLibrary.id}/template/details/activity/${activityTemplate.id}`
                                    ]);
                                });
                        });
                }
            });
        });
    }
}
