import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkspaceOverviewComponent } from './workspace-overview/workspace-overview.component';
import { WorkspaceDetailsComponent } from './workspace-details/workspace-details.component';
import { WorkspaceDetailsFormatsComponent } from './workspace-details/workspace-details-formats/workspace-details-formats.component';
import { WorkspaceDetailsMembersComponent } from './workspace-details/workspace-details-members/workspace-details-members.component';
// prettier-ignore
import {
    WorkspaceDetailsAdministrationComponent
} from './workspace-details/workspace-details-administration/workspace-details-administration.component';
// prettier-ignore
import {
    WorkspaceDetailsInformationComponent
} from './workspace-details/workspace-details-information/workspace-details-information.component';

/**
 * The WorkspaceRoutingModule handles all routes used for the navigation to and between workspace pages.
 */
const workspaceRoutes: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: WorkspaceOverviewComponent },
            {
                path: ':workspaceId',
                component: WorkspaceDetailsComponent,
                children: [
                    { path: '', redirectTo: 'information' },
                    { path: 'information', component: WorkspaceDetailsInformationComponent },
                    { path: 'formats', component: WorkspaceDetailsFormatsComponent },
                    { path: 'members', component: WorkspaceDetailsMembersComponent },
                    { path: 'admin', component: WorkspaceDetailsAdministrationComponent }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(workspaceRoutes)],
    exports: [RouterModule]
})
export class WorkspaceRoutingModule {}
