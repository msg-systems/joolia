import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    Activity,
    DurationUnit,
    Format,
    Library,
    List,
    MultiSelectOptionData,
    Permission,
    Phase,
    PhaseTemplate,
    SelectOption,
    SelectTemplateDialogData
} from '../../../core/models';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ActivityService,
    ConfigurationService,
    FormatService,
    IQueryParams,
    LibraryService,
    PhaseService,
    PhaseTemplateService,
    SnackbarService,
    UtilService
} from '../../../core/services';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs/internal/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SelectTemplateDialogComponent } from '../../../shared/components/select-template-dialog/select-template-dialog.component';
import { SelectionDialogComponent } from '../../../shared/components/selection-dialog/selection-dialog.component';
import { TemplateType } from '../../../core/enum/global/template-type.enum';

/**
 * The PhaseDetailsComponent displays a single phase and its content. This includes general information about the phase, an agenda holding
 * all activities of the phase and a detailed view of the currently selected activity.
 */
@Component({
    selector: 'app-phase-details',
    templateUrl: './phase-details.component.html',
    styleUrls: ['./phase-details.component.scss']
})
export class PhaseDetailsComponent implements OnInit, OnDestroy {
    readonly phaseDurationDaysType = DurationUnit.DAYS;
    readonly phaseDurationMinutesType = DurationUnit.MINUTES;

    format: Format;
    phase: Phase;
    activityList: List<Activity>;
    phaseNameMaxLength: number;
    phaseDatePickerType: string;

    private subscriptions: Subscription[] = [];
    isEditAllowed = false;
    isAddActivityAllowed = false;
    isDeleteActivityAllowed = false;
    isTemplateSaveAllowed = false;
    categoryOptions: SelectOption[] = [];

    phaseTypeOptions: SelectOption[] = [
        {
            display: 'buttons.changePhaseDurationUnit.minutes',
            value: DurationUnit.MINUTES,
            icon: 'schedule'
        },
        {
            display: 'buttons.changePhaseDurationUnit.days',
            value: DurationUnit.DAYS,
            icon: 'event'
        }
    ];
    selectedPhaseType: SelectOption;

    constructor(
        private formatService: FormatService,
        private phaseService: PhaseService,
        private activityService: ActivityService,
        private libraryService: LibraryService,
        private phaseTemplateService: PhaseTemplateService,
        private snackbarService: SnackbarService,
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private dialog: MatDialog,
        private utilService: UtilService
    ) {}

    ngOnInit() {
        this.phaseNameMaxLength = ConfigurationService.getConfiguration().configuration.characterLimits.phase.name;

        this.subscriptions.push(
            this.phaseService.phaseChanged.subscribe((phase: Phase) => {
                this.phase = phase;
                this.phaseDatePickerType = this.phaseService.getPhaseDatePickerType(this.phase.durationUnit);
                this.format = this.formatService.getCurrentFormat();
                this.isEditAllowed = this.formatService.hasPermission(Permission.UPDATE_PHASE);
                this.isAddActivityAllowed = this.formatService.hasPermission(Permission.ADD_ACTIVITY);
                this.isDeleteActivityAllowed = this.formatService.hasPermission(Permission.DELETE_ACTIVITY);
                this.isTemplateSaveAllowed = this.formatService.hasPermission(Permission.UPDATE_PHASE);

                if (this.phase.durationUnit === DurationUnit.MINUTES) {
                    this.selectedPhaseType = this.phaseTypeOptions[0];
                } else {
                    this.selectedPhaseType = this.phaseTypeOptions[1];
                }
            })
        );

        this.subscriptions.push(
            this.activityService.activityListChanged.subscribe((activityList: List<Activity>) => {
                this.activityList = activityList;
                this.categoryOptions = this.libraryService.getCategoryOptions();
            })
        );

        this.loadPhase();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });

        this.activityService.unsetLoadedActivity();
    }

    private loadPhase() {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().phase.select.details
        };

        this.phaseService.loadPhase(this.route.snapshot.params['phaseId'], queryParams).subscribe(
            (data) => {
                this.loadActivities();
            },
            (err) => {
                this.utilService.logAndNavigate(err.error, this, this.loadPhase, 'snackbar.phaseNotFound', 'overview');
            }
        );
    }

    loadActivities() {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().phase.select.detailsActivity,
            order: 'position'
        };

        this.activityService
            .loadActivities(this.formatService.getCurrentFormat().id, this.phaseService.getCurrentPhase().id, queryParams)
            .subscribe();
    }

    navigateToActivity(activityId: string) {
        if (this.activityService.getCurrentActivity() && this.activityService.getCurrentActivity().id !== activityId) {
            this.activityService.unsetLoadedActivity();
        }

        if (activityId === '') {
            this.router.navigate(['format', this.format.id, 'phase', this.phase.id]);
        } else {
            this.router.navigate(['format', this.format.id, 'phase', this.phase.id, 'activity', activityId, 'details']);
        }
    }

    isHourSchedule() {
        return this.phase.durationUnit === DurationUnit.MINUTES;
    }

    onPhaseUpdate(fieldName: string, updatedValue: any) {
        if (this.phase.hasOwnProperty(fieldName) && this.phase[fieldName] !== updatedValue) {
            this.phase[fieldName] = updatedValue;
            const updatedBody = {};
            updatedBody[fieldName] = updatedValue;

            this.phaseService.updatePhase(this.phase.id, updatedBody).subscribe();
        }
    }

    onActivityCreate(position: number) {
        const activityBody = {
            name: this.translate.instant('labels.blankMethod'),
            position: position,
            duration: this.phase.durationUnit === DurationUnit.MINUTES ? 15 : 1
        };

        this.activityService.createActivity(this.format.id, this.phase.id, activityBody).subscribe((createdActivity: Activity) => {
            this.navigateToActivity(createdActivity.id);
        });
    }

    onActivityCreateFromTemplate(position: number) {
        const data: SelectTemplateDialogData = {
            headerKey: 'dialog.addMethodFromTemplate.header',
            templateType: TemplateType.ACTIVITY,
            submitKey: 'dialog.addMethodFromTemplate.confirm'
        };
        const dialogRef = this.dialog.open(SelectTemplateDialogComponent, {
            width: '80vw',
            maxWidth: '1410px',
            maxHeight: '80vh',
            data
        });

        dialogRef.afterClosed().subscribe((templateId?: string) => {
            if (templateId) {
                this.activityService
                    .createActivityFromTemplate(this.format.id, this.phase.id, templateId, position)
                    .subscribe((createdActivity: Activity) => {
                        this.navigateToActivity(createdActivity.id);
                    });
            }
        });
    }

    onActivityClick(activityId: string) {
        this.navigateToActivity(activityId);
    }

    onActivityPositionChange(event: CdkDragDrop<string[]>) {
        if (event.previousIndex !== event.currentIndex) {
            const movedActivity = this.activityList.entities[event.previousIndex];

            this.activityService.updateActivityPosition(this.format.id, this.phase.id, movedActivity.id, event.currentIndex).subscribe();
        }
    }

    onActivityDelete(activity: Activity) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.activityDeletion',
                contentParams: { objectName: activity.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                const activityPosition = this.activityList.entities.indexOf(activity);
                let newActivityId;
                if (activityPosition + 1 < this.activityList.count) {
                    newActivityId = this.activityList.entities[activityPosition + 1].id;
                } else if (activityPosition > 0) {
                    newActivityId = this.activityList.entities[activityPosition - 1].id;
                } else {
                    newActivityId = '';
                }
                this.activityService.deleteActivity(this.format.id, this.phase.id, activity.id).subscribe(
                    () => {
                        this.snackbarService.openWithMessage('snackbar.activityDeleted', { objectName: activity.name });
                    },
                    (err) => {
                        this.snackbarService.openWithMessage('snackbar.activityDeletionError');
                    }
                );
                this.navigateToActivity(newActivityId);
            }
        });
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
                    headerKey: 'dialog.storeAsPhaseTemplate.header',
                    contentKey: 'dialog.storeAsPhaseTemplate.content',
                    cancelKey: 'buttons.cancel',
                    confirmKey: 'buttons.create',
                    selectionDetails: [librarySelectionDetail, categorySelectionDetail]
                }
            });

            dialogRef.afterClosed().subscribe((selectedValues: any) => {
                if (selectedValues && selectedValues['library'] && selectedValues['category']) {
                    const selectedLibrary: Library = selectedValues['library'];
                    const selectedCategory = selectedValues['category'];
                    this.phaseTemplateService
                        .createPhaseTemplate(selectedLibrary.id, this.phase.id, selectedCategory)
                        .subscribe((phaseTemplate: PhaseTemplate) => {
                            this.snackbarService
                                .openWithMessage('snackbar.phaseTemplateCreated', { libraryName: selectedLibrary.name }, 'buttons.show')
                                .onAction()
                                .subscribe(() => {
                                    this.router.navigate([`library/${selectedLibrary.id}/template/details/phase/${phaseTemplate.id}`]);
                                });
                        });
                }
            });
        });
    }

    onChangePhaseType() {
        const updatedBody = {
            durationUnit: this.selectedPhaseType.value
        };
        if (this.activityList.count === 0) {
            this.phaseService.updatePhase(this.phase.id, updatedBody).subscribe();
        }
    }
}
