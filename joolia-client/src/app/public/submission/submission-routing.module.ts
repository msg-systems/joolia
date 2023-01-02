import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubmissionOverviewComponent } from './submission-overview/submission-overview.component';
import { SubmissionDetailsComponent } from './submission-details/submission-details.component';

/**
 * The SubmissionRoutingModule handles all routes used for the navigation to and between submission pages.
 */
const submissionRoutes: Routes = [
    { path: '', redirectTo: 'overview', pathMatch: 'full' },
    { path: 'overview', component: SubmissionOverviewComponent },
    { path: ':submissionId', component: SubmissionDetailsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(submissionRoutes)],
    exports: [RouterModule]
})
export class SubmissionRoutingModule {}
