import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamOverviewComponent } from './team-overview/team-overview.component';
import { TeamDetailsComponent } from './team-details/team-details.component';

/**
 * The TeamRoutingModule handles all routes used for the navigation to and between team pages.
 */
const teamRoutes: Routes = [
    { path: '', redirectTo: 'overview', pathMatch: 'full' },
    { path: 'overview', component: TeamOverviewComponent },
    { path: ':teamId', component: TeamDetailsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(teamRoutes)],
    exports: [RouterModule]
})
export class TeamRoutingModule {}
