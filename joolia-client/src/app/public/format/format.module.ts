import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../../core/components';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { FormatRoutingModule } from './format-routing.module';
import { FormatDetailsComponent } from './format-details/format-details.component';
import { FormatDetailsInformationComponent } from './format-details/format-details-information/format-details-information.component';
import { FormatDetailsMembersComponent } from './format-details/format-details-members/format-details-members.component';
import { FormatDetailsSubmissionsComponent } from './format-details/format-details-submissions/format-details-submissions.component';
import { FormatOverviewComponent } from './format-overview/format-overview.component';
import { MomentModule } from 'ngx-moment';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
// tslint:disable-next-line:max-line-length
import { FormatDetailsMemberProfileComponent } from './format-details/format-details-member-profile/format-details-member-profile.component';

@NgModule({
    declarations: [
        FormatOverviewComponent,
        FormatDetailsComponent,
        FormatDetailsInformationComponent,
        FormatDetailsMembersComponent,
        FormatDetailsSubmissionsComponent,
        FormatDetailsMemberProfileComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        SharedModule,
        FlexLayoutModule,
        TranslateModule,
        FormatRoutingModule,
        MomentModule,
        InfiniteScrollModule
    ],
    exports: [],
    providers: []
})
export class FormatModule {}
