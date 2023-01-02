import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavigationType } from 'src/app/core/enum/global/navigation-type.enum';
import { Workspace } from 'src/app/core/models';
import { IMeeting } from 'src/app/core/models/meeting.model';
import { LoggerService, MeetingService, SnackbarService, UtilService, WorkspaceService } from 'src/app/core/services';

@Component({
    selector: 'app-auth-callback',
    templateUrl: './auth-callback.component.html',
    styleUrls: ['./auth-callback.component.scss']
})
export class AuthCallbackComponent implements OnInit, OnDestroy {
    subscriptions: Subscription[] = [];

    constructor(
        private meetingService: MeetingService,
        private workspaceService: WorkspaceService,
        private router: Router,
        private route: ActivatedRoute,
        private snackbarService: SnackbarService,
        private logger: LoggerService
    ) {}

    ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    ngOnInit() {
        this.proceedBasedOnCallbackOrigin();
    }

    saveConsentAndRedirectToHomepage() {
        const params = this.route.snapshot.queryParams;
        const workspaceInformation = UtilService.decodeObjectBase64andURI(params.state);
        const workspaceId = workspaceInformation.workspaceId;
        if (params.admin_consent && !!params.tenant) {
            const currentDate = new Date();
            const workspacePatch: Partial<Workspace> = {
                consentDate: currentDate,
                domain: workspaceInformation.domain,
                tenant: params.tenant
            };
            this.subscriptions.push(
                this.workspaceService.patchWorkspace(workspaceId, workspacePatch).subscribe(
                    () => {
                        this.snackbarService.openWithMessage('snackbar.workspaceConsentUpdate');
                        this.router.navigate(['workspace', workspaceId, 'admin']);
                    },
                    (_error) => {
                        this.snackbarService.openWithMessage('snackbar.workspaceConsentUpdateError');
                        this.router.navigate(['workspace', workspaceId, 'admin']);
                    }
                )
            );
        } else {
            this.router.navigate(['workspace', workspaceId, 'admin']);
        }
    }

    proceedBasedOnCallbackOrigin() {
        const params = this.route.snapshot.queryParams;
        if (params.hasOwnProperty('admin_consent')) {
            this.saveConsentAndRedirectToHomepage();
        } else {
            this.createMeeting();
        }
    }

    createMeeting() {
        let meeting: IMeeting;
        const params = this.route.snapshot.queryParams;
        meeting = this.meetingService.decodeMeetingInformation(params.state);
        meeting.authorizationCode = params.code;
        this.subscriptions.push(
            this.meetingService.createMeeting(meeting).subscribe(
                (response) => {
                    this.meetingService.joinMeeting(response.url, NavigationType.SAME_TAB);
                },
                (_err) => {
                    this.snackbarService.openWithMessage('errors.meeting.unableToStart');
                    this.logger.error('[Meeting] not able to start meeting', this.createMeeting);
                }
            )
        );
    }
}
