import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    ConfigurationService,
    FormatService,
    IQueryParams,
    SnackbarService,
    SubmissionService,
    TeamService,
    UserService,
    UtilService
} from '../../../../core/services';
import { FileMeta, Format, List, Submission, TableFilter, UserRole } from '../../../../core/models';
import { Observable, of, Subscription } from 'rxjs';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { assign } from 'lodash-es';
import { IDownloadOptions } from 'src/app/shared/components/file-list/file-list.component';
import { detailExpandAnimation } from 'src/app/core/animations';
import { DataSource } from '@angular/cdk/collections';

export class SubmissionDataSource extends DataSource<Submission> {
    constructor(private submissionList: Submission[]) {
        super();
    }

    connect(): Observable<Submission[]> {
        const rows = [];
        this.submissionList.forEach((element) => rows.push(element, { detailRow: true, element }));
        return of(rows);
    }

    disconnect() {}
}

@Component({
    selector: 'app-format-details-submissions',
    templateUrl: './format-details-submissions.component.html',
    styleUrls: ['./format-details-submissions.component.scss'],
    animations: [detailExpandAnimation]
})
export class FormatDetailsSubmissionsComponent implements OnDestroy, OnInit {
    currentFormat: Format;
    submissionList: List<Submission>;
    columnsToDisplay: string[];
    initialPaginatorSize: number;
    paginatorSizeOptions: number[];
    defaultSortingKey: string;
    filtersConfig: TableFilter[];
    filters = {};
    paginatorSize: number;
    mutuallyExclusiveFilters: string[];

    dataSource: SubmissionDataSource;
    expandedSubmission: Submission;
    isExpansionDetailRow: (_i: number, row: Object) => boolean;
    isFileEditAllowed: boolean;

    autoCompleteData: { users: string[]; teams: string[]; phases: string[] };

    subscriptions: Subscription[] = [];

    constructor(
        private formatService: FormatService,
        private submissionService: SubmissionService,
        private teamService: TeamService,
        private dialog: MatDialog,
        private snackbarService: SnackbarService,
        private userService: UserService
    ) {}

    ngOnInit() {
        const configuration = ConfigurationService.getConfiguration().configuration.tableConfigs.formatSubmissions;
        this.columnsToDisplay = configuration.columns;
        this.initialPaginatorSize = configuration.defaultPaginationSize;
        this.paginatorSizeOptions = configuration.availablePaginationSizes;
        this.paginatorSize = configuration.defaultPaginationSize;
        this.filtersConfig = configuration.filters;
        this.defaultSortingKey = configuration.defaultSortingKey;

        this.mutuallyExclusiveFilters = ['submittedByUser', 'submittedByTeam'];

        this.currentFormat = this.formatService.getCurrentFormat();

        this.subscriptions.push(
            this.submissionService.loadFormatSubmissionFilterValues(this.currentFormat.id).subscribe((data) => {
                this.autoCompleteData = data;
                this.initAutocomplete();
            })
        );

        this.subscriptions.push(
            this.submissionService.submissionListChanged.subscribe((submissionList: List<Submission>) => {
                this.submissionList = submissionList;
                this.dataSource = new SubmissionDataSource(submissionList.entities);
            })
        );

        this.loadSubmissions(0, this.initialPaginatorSize);

        this.isExpansionDetailRow = (_i: number, row: Object) => row.hasOwnProperty('detailRow');
        this.isFileEditAllowed = false;

        if (this.currentFormat.me.userRole === UserRole.TECHNICAL) {
            this.columnsToDisplay = this.columnsToDisplay.filter((column) => column !== `action`);
        }
    }

    onSortChanged(sort: any) {
        if (sort.active && sort.direction !== '') {
            const isAsc = sort.direction === 'asc';
            const sortKey = (isAsc ? '' : '-') + sort.active;
            this.loadSubmissions(0, this.initialPaginatorSize, this.filters, sortKey);
        }
    }

    ngOnDestroy() {
        this.filtersConfig.forEach((filter) => {
            filter.valueList = null;
        });
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    initAutocomplete() {
        this.initAutocompleteBySubmitterUser();
        this.initAutocompleteBySubmitterTeam();
        this.initAutocompleteByPhase();
    }

    private initAutocompleteBySubmitterUser() {
        const submittedByUserFilter = this.filtersConfig.find((filter: TableFilter) => filter.key === 'submittedByUser');
        if (!submittedByUserFilter.valueList) {
            submittedByUserFilter.valueList = this.autoCompleteData.users;

            // trigger change detection
            this.filtersConfig = this.filtersConfig.slice();
        }
    }

    private initAutocompleteBySubmitterTeam() {
        const submittedByTeamFilter = this.filtersConfig.find((filter: TableFilter) => filter.key === 'submittedByTeam');
        if (!submittedByTeamFilter.valueList) {
            submittedByTeamFilter.valueList = this.autoCompleteData.teams;

            // trigger change detection
            this.filtersConfig = this.filtersConfig.slice();
        }
    }

    private initAutocompleteByPhase() {
        const phaseFilter = this.filtersConfig.find((filter: TableFilter) => filter.key === 'phase');
        if (!phaseFilter.valueList) {
            phaseFilter.valueList = this.autoCompleteData.phases;

            // trigger change detection
            this.filtersConfig = this.filtersConfig.slice();
        }
    }

    loadSubmissions(skipAmount: number, takeAmount: number, filters?: object, sortKey?: string) {
        sortKey = sortKey ? sortKey : this.defaultSortingKey;

        let queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().submission.select.overview,
            order: sortKey,
            skip: skipAmount,
            take: takeAmount
        };

        if (filters) {
            queryParams = UtilService.addFilterToQueryParams(queryParams, filters);
        }

        this.submissionService.loadSubmissionsOfFormat(this.currentFormat.id, queryParams).subscribe(() => {
            this.submissionList.entities.forEach((submission) => {
                const user = submission.submittedBy.user;
                const team = submission.submittedBy.team;

                if (user && user.avatar && user.avatar.id) {
                    this.userService.loadAvatarMeta(user.id).subscribe((avatar) => assign(user.avatar, avatar));
                }
                if (team && team.avatar && team.avatar.id) {
                    this.teamService.loadTeamAvatarMeta(team.id).subscribe((avatar) => assign(team.avatar, avatar));
                }
            });
        });
    }

    onSubmissionDelete(submission: Submission) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.submissionDeletion',
                contentParams: { objectName: submission.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.submissionService
                    .deleteSubmission(this.currentFormat.id, submission.activity.phase.id, submission.activity.id, submission.id)
                    .subscribe(
                        () => {
                            this.snackbarService.openWithMessage('snackbar.submissionDeleted', { objectName: submission.name });
                        },
                        (err) => {
                            this.snackbarService.openWithMessage('snackbar.submissionDeletionError');
                        }
                    );
            }
        });
    }

    onPaginationChange(event: PageEvent) {
        const contentOffset = event.pageIndex * event.pageSize;
        this.paginatorSize = event.pageSize;

        this.loadSubmissions(contentOffset, event.pageSize, this.filters);
    }

    getSubmissionFiles(submission: Submission) {
        if (this.expandedSubmission !== submission) {
            this.expandedSubmission = submission;

            const phaseId = submission.activity.phase.id;
            const activityId = submission.activity.id;

            this.submissionService.loadSubmissionFilesMeta(this.currentFormat.id, phaseId, activityId, submission.id).subscribe((files) => {
                this.expandedSubmission.files = files || [];
            });
        } else {
            // stop file download triggering
            this.expandedSubmission.files = null;
            this.expandedSubmission = null;
        }
    }

    onFileDownloadClicked(options: IDownloadOptions) {
        const phaseId = this.expandedSubmission.activity.phase.id;
        const activityId = this.expandedSubmission.activity.id;

        this.submissionService
            .getDownloadFile(this.currentFormat.id, phaseId, activityId, this.expandedSubmission.id, options.fileId, options.download)
            .subscribe((downloadMeta: FileMeta) => {
                this.expandedSubmission.files = this.expandedSubmission.files.map((file) => {
                    if (file.id === options.fileId) {
                        if (options.download) {
                            file.downloadUrl = downloadMeta.fileUrl;
                        } else {
                            file.tabUrl = downloadMeta.fileUrl;
                        }
                    }
                    return file;
                });
            });
    }

    onFiltersChanged(filters: object) {
        if (filters['submittedByUser'] || filters['submittedByTeam']) {
            const submitterFilter = filters['submittedByUser'] || filters['submittedByTeam'];
            filters['submittedBy'] = submitterFilter;
            delete filters['submittedByUser'];
            delete filters['submittedByTeam'];
        }

        this.filters = filters;
        this.loadSubmissions(0, this.paginatorSize, filters);
    }
}
