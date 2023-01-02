import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityDetailsComponent } from './activity-details/activity-details.component';
import { ActivityDetailsMainComponent } from './activity-details/activity-details-main/activity-details-main.component';
import { ActivityDetailsProgressComponent } from './activity-details/activity-details-progress/activity-details-progress.component';

/**
 * The ActivityRoutingModule handles all routes used for the navigation to and between activity pages.
 */
const activityRoutes: Routes = [
    { path: '', redirectTo: '..', pathMatch: 'full' },
    {
        path: ':activityId',
        component: ActivityDetailsComponent,
        children: [
            { path: 'details', component: ActivityDetailsMainComponent },
            { path: 'progress', component: ActivityDetailsProgressComponent },
            {
                path: 'submission',
                loadChildren: () => import('../submission/submission.module').then((m) => m.SubmissionModule)
            },
            { path: '', redirectTo: 'details' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(activityRoutes)],
    exports: [RouterModule]
})
export class ActivityRoutingModule {}
