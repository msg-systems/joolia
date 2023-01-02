import { Component, OnDestroy, OnInit } from '@angular/core';
import { Action, AvatarUploadDialogDataModel, FileMeta, Format, List, Permission, User, Workspace } from '../../../../core/models';
import { Subscription } from 'rxjs';
import { ConfigurationService, FormatService, IQueryParams, ReferenceResolverService, WorkspaceService } from '../../../../core/services';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AvatarUploadDialogComponent } from '../../../../shared/components/avatar-upload/avatar-upload-dialog.component';

/**
 * The WorkspaceDetailsInformationComponent displays an overview of a specific workspace with stats, admins, logo and formats.
 */
@Component({
    selector: 'app-workspace-details-information',
    templateUrl: './workspace-details-information.component.html',
    styleUrls: ['./workspace-details-information.component.scss']
})
export class WorkspaceDetailsInformationComponent implements OnInit, OnDestroy {
    workspace: Workspace;
    adminList: List<User>;
    formatList: List<Format>;
    workspaceNameMaxLength: number;
    subscriptions: Subscription[] = [];
    logoMenuActions;
    formatMenuActions: { format: Format; actions: Action[] }[] = [];
    workspaceSummary: any[] = [];
    isEditAllowed = false;

    constructor(
        private formatService: FormatService,
        private workspaceService: WorkspaceService,
        private translate: TranslateService,
        private router: Router,
        private dialog: MatDialog,
        private refResolver: ReferenceResolverService
    ) {}

    ngOnInit() {
        this.workspace = this.workspaceService.getCurrentWorkspace();
        this.isEditAllowed = this.workspaceService.hasPermission(Permission.UPDATE_WORKSPACE, this.workspace);

        if (this.workspace.logoId) {
            this.workspaceService.loadWorkspaceLogoMeta(this.workspace.id).subscribe((logo: FileMeta) => {
                this.workspace.logo = logo;
            });
        }

        this.workspaceSummary = [
            {
                key: 'labels.amountMembers',
                icon: 'people',
                amount: this.workspace.memberCount
            },
            {
                key: 'labels.amountFormats',
                icon: 'category_outline',
                amount: this.workspace.formatCount
            }
        ];

        this.workspaceNameMaxLength = ConfigurationService.getConfiguration().configuration.characterLimits.workspace.name;

        this.logoMenuActions = this.isEditAllowed
            ? [
                  {
                      actionKey: 'buttons.addLogo',
                      actionFunction: this.onAddLogo.bind(this)
                  }
              ]
            : [];

        this.subscriptions.push(
            this.formatService.formatListChanged.subscribe((formatList: List<Format>) => {
                this.formatList = formatList;
                this.formatList.entities.forEach((format: Format) => {
                    if (format.keyVisual && format.keyVisual.id && !format.keyVisual.linkUrl) {
                        this.formatService
                            .loadFormatKeyVisualMeta(format.id)
                            .subscribe((keyVisual: FileMeta) => (format.keyVisual = keyVisual));
                    }
                });
                this.formatMenuActions = this.formatList.entities.map((format) => {
                    return { format, actions: [] };
                });
            })
        );

        this.getInitialWorkspaceAdmins();
        this.getInitialFormats();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    getInitialFormats() {
        const loadAmount = ConfigurationService.getConfiguration().configuration.pagination.workspaceOverview.formatAmount;
        const select = ConfigurationService.getConfiguration().configuration.queryParams.workspace.select.formatOverview;
        const queryParams: IQueryParams = this.getQueryParam(loadAmount, select);
        this.formatService.loadWorkspaceFormats(this.workspaceService.getCurrentWorkspace().id, queryParams, false).subscribe();
    }

    getInitialWorkspaceAdmins() {
        const loadAmount = ConfigurationService.getConfiguration().configuration.pagination.workspaceOverview.adminAmount;
        const select = ConfigurationService.getConfiguration().configuration.queryParams.workspace.select.adminMembersOverview;
        const filter = 'admin=true';
        const queryParams: IQueryParams = this.getQueryParam(loadAmount, select, filter);

        this.workspaceService.loadWorkspaceUsers(this.workspace.id, queryParams).subscribe((users: List<User>) => {
            this.adminList = users;
            this.adminList.entities.forEach((u) => {
                this.refResolver.resolveRef(u).subscribe();
            });
        });
    }

    getQueryParam(loadAmount: number, select: string, filter?: string) {
        const queryParams: IQueryParams = {
            select: select,
            order: 'name'
        };
        if (filter) {
            queryParams['filter'] = filter;
        }
        queryParams['skip'] = 0;
        queryParams['take'] = loadAmount;

        return queryParams;
    }

    onFormatClick(formatId: string) {
        this.router.navigate(['format', formatId]);
    }

    onWorkspaceUpdate(field, newValue) {
        if (this.workspace[field] !== newValue) {
            this.workspace[field] = newValue;
            const updatedWorkspace = {};

            updatedWorkspace[field] = newValue;
            this.workspaceService.patchWorkspace(this.workspace.id, updatedWorkspace).subscribe();
        }
    }

    onAddLogo() {
        const data: AvatarUploadDialogDataModel = {
            headingKey: 'dialog.uploadAvatar.header',
            roundAvatar: false,
            onImageUploadOutput: this.workspaceService.onLogoUploadOutput.bind(this.workspaceService)
        };
        this.dialog.open(AvatarUploadDialogComponent, {
            minWidth: '320px',
            data
        });
    }
}
