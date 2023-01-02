import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LibraryOverviewComponent } from './library-overview/library-overview.component';
import { LibraryDetailsComponent } from './library-details/library-details.component';
import { LibraryMembersComponent } from './library-details/library-member/library-members.component';
import { ActivityTemplateOverviewComponent } from '../activity-template/activity-template-overview/activity-template-overview.component';
import { FormatTemplateOverviewComponent } from '../format-template/format-template-overview/format-template-overview.component';
import { ActivityTemplateDetailsComponent } from '../activity-template/activity-template-details/activity-template-details.component';
import { FormatTemplateDetailsComponent } from '../format-template/format-template-details/format-template-details.component';
import { PhaseTemplateDetailsComponent } from '../phase-template/phase-template-details/phase-template-details.component';
import { PhaseTemplateOverviewComponent } from '../phase-template/phase-template-overview/phase-template-overview.component';
// tslint:disable-next-line:max-line-length
import { LibraryTemplateOverviewComponent } from './library-details/library-template/library-template-overview/library-template-overview.component';
// tslint:disable-next-line:max-line-length
import { LibraryTemplateDetailsComponent } from './library-details/library-template/library-template-details/library-template-details.component';

/**
 * The LibraryRoutingModule handles all routes used for the navigation to and between library pages.
 */
const libraryRoutes: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: LibraryOverviewComponent },
            {
                path: ':libraryId',
                component: LibraryDetailsComponent,
                children: [
                    { path: '', redirectTo: 'template' },
                    {
                        path: 'template',
                        children: [
                            { path: '', redirectTo: 'overview' },
                            {
                                path: 'overview',
                                component: LibraryTemplateOverviewComponent,
                                children: [
                                    { path: '', redirectTo: 'activity' },
                                    { path: 'activity', component: ActivityTemplateOverviewComponent },
                                    { path: 'format', component: FormatTemplateOverviewComponent },
                                    { path: 'phase', component: PhaseTemplateOverviewComponent }
                                ]
                            },
                            {
                                path: 'details',
                                component: LibraryTemplateDetailsComponent,
                                children: [
                                    {
                                        path: 'activity/:activityTemplateId',
                                        component: ActivityTemplateDetailsComponent
                                    },
                                    {
                                        path: 'format/:formatTemplateId',
                                        component: FormatTemplateDetailsComponent
                                    },
                                    {
                                        path: 'phase/:phaseTemplateId',
                                        component: PhaseTemplateDetailsComponent
                                    }
                                ]
                            }
                        ]
                    },
                    { path: 'members', component: LibraryMembersComponent }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(libraryRoutes)],
    exports: [RouterModule]
})
export class LibraryRoutingModule {}
