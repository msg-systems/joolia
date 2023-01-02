import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../../core/components';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceOverviewComponent } from './workspace-overview/workspace-overview.component';
import { WorkspaceRoutingModule } from './workspace-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { WorkspaceDetailsComponent } from './workspace-details/workspace-details.component';
import { WorkspaceDetailsFormatsComponent } from './workspace-details/workspace-details-formats/workspace-details-formats.component';
import { WorkspaceDetailsMembersComponent } from './workspace-details/workspace-details-members/workspace-details-members.component';
import { WorkspaceCreateDialogComponent } from './workspace-create-dialog/workspace-create-dialog.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
// prettier-ignore
import {
    WorkspaceDetailsInformationComponent
} from './workspace-details/workspace-details-information/workspace-details-information.component';
// prettier-ignore
import {
    WorkspaceDetailsAdministrationComponent
} from './workspace-details/workspace-details-administration/workspace-details-administration.component';

@NgModule({
    declarations: [
        WorkspaceOverviewComponent,
        WorkspaceCreateDialogComponent,
        WorkspaceDetailsComponent,
        WorkspaceDetailsInformationComponent,
        WorkspaceDetailsFormatsComponent,
        WorkspaceDetailsMembersComponent,
        WorkspaceDetailsAdministrationComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        SharedModule,
        FlexLayoutModule,
        TranslateModule,
        WorkspaceRoutingModule,
        InfiniteScrollModule
    ],
    exports: [],
    providers: []
})
export class WorkspaceModule {}
