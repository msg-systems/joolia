import { Component, OnInit, Input } from '@angular/core';
import { ConfigurationService, SubmissionService, SnackbarService, IQueryParams } from 'src/app/core/services';
import { List, Submission, Team, Format } from 'src/app/core/models';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'team-submissions',
    templateUrl: './team-submissions.component.html',
    styleUrls: ['./team-submissions.component.scss']
})
export class TeamSubmissionsComponent implements OnInit {
    @Input() format: Format;
    @Input() team: Team;
    submissionList: List<Submission>;
    columnsToDisplay: string[];
    paginatorSizeOptions: number[];
    initialPaginatorSize: number;

    isLoadingContent = false;

    subscriptions: Subscription[] = [];

    constructor(
        private submissionService: SubmissionService,
        private router: Router,
        private dialog: MatDialog,
        private snackbarService: SnackbarService,
        private translate: TranslateService
    ) {}

    ngOnInit() {
        const configuration = ConfigurationService.getConfiguration().configuration.tableConfigs.teamSubmissions;

        this.columnsToDisplay = configuration.columns;
        this.initialPaginatorSize = configuration.defaultPaginationSize;
        this.paginatorSizeOptions = configuration.availablePaginationSizes;

        this.subscriptions.push(
            this.submissionService.submissionListChanged.subscribe((submissionList: List<Submission>) => {
                this.submissionList = submissionList;
                this.isLoadingContent = false;
            })
        );

        this.loadSubmissionData(0, this.initialPaginatorSize);
    }

    loadSubmissionData(skipAmount: number, takeAmount: number) {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().submission.select.teamOverview,
            order: 'createdAt',
            skip: skipAmount,
            take: takeAmount
        };

        this.isLoadingContent = true;

        this.submissionService.loadSubmissionsOfTeam(this.format.id, this.team.id, queryParams).subscribe();
    }

    navigateToSubmission(submissionId: string) {
        const submission = this.submissionList.entities.find((s) => s.id === submissionId);
        this.router.navigate([
            'format',
            this.format.id,
            'phase',
            submission.activity.phase.id,
            'activity',
            submission.activity.id,
            'submission',
            submissionId
        ]);
    }

    onSubmissionDelete(submissionId: string) {
        const submission = this.submissionList.entities.find((s) => s.id === submissionId);
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
                    .deleteSubmission(this.format.id, submission.activity.phase.id, submission.activity.id, submissionId)
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

        this.loadSubmissionData(contentOffset, event.pageSize);
    }
}
