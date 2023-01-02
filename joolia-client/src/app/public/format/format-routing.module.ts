import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormatOverviewComponent } from './format-overview/format-overview.component';
import { FormatDetailsComponent } from './format-details/format-details.component';
import { FormatDetailsInformationComponent } from './format-details/format-details-information/format-details-information.component';
import { FormatDetailsMembersComponent } from './format-details/format-details-members/format-details-members.component';
import { FormatDetailsSubmissionsComponent } from './format-details/format-details-submissions/format-details-submissions.component';
import { FormatDetailsSubmissionsGuard } from '../../core/guards';
// tslint:disable-next-line:max-line-length
import { FormatDetailsMemberProfileComponent } from './format-details/format-details-member-profile/format-details-member-profile.component';

/**
 * The FormatRoutingModule handles all routes used for the navigation to and between format pages.
 */
const formatRoutes: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: FormatOverviewComponent },
            {
                path: ':formatId',
                component: FormatDetailsComponent,
                children: [
                    { path: '', redirectTo: 'information' },
                    { path: 'information', component: FormatDetailsInformationComponent },
                    { path: 'members', component: FormatDetailsMembersComponent },
                    { path: 'members/:memberId', component: FormatDetailsMemberProfileComponent },
                    {
                        path: 'teams',
                        loadChildren: () => import('../team/team.module').then((m) => m.TeamModule)
                    },
                    { path: 'submissions', component: FormatDetailsSubmissionsComponent, canActivate: [FormatDetailsSubmissionsGuard] },
                    {
                        path: 'phase',
                        loadChildren: () => import('../phase/phase.module').then((m) => m.PhaseModule)
                    }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(formatRoutes)],
    exports: [RouterModule]
})
export class FormatRoutingModule {}
