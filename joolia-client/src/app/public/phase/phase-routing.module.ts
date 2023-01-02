import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhaseDetailsComponent } from './phase-details/phase-details.component';
import { PhaseOverviewComponent } from './phase-overview/phase-overview.component';

/**
 * The PhaseRoutingModule handles all routes used for the navigation to and between phase pages.
 */
const phaseRoutes: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: PhaseOverviewComponent },
            {
                path: ':phaseId/activity/:activityId/canvas',
                loadChildren: () => import('../canvas/canvas.module').then((m) => m.CanvasModule)
            },
            {
                path: ':phaseId',
                component: PhaseDetailsComponent,
                children: [{ path: 'activity', loadChildren: () => import('../activity/activity.module').then((m) => m.ActivityModule) }]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(phaseRoutes)],
    exports: [RouterModule]
})
export class PhaseRoutingModule {}
