import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../core/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivityTemplateOverviewComponent } from './activity-template-overview/activity-template-overview.component';
import { ActivityTemplateDetailsComponent } from './activity-template-details/activity-template-details.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
    declarations: [ActivityTemplateOverviewComponent, ActivityTemplateDetailsComponent],
    imports: [
        CommonModule,
        SharedModule,
        FlexLayoutModule,
        TranslateModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        InfiniteScrollModule
    ],
    providers: []
})
export class ActivityTemplateModule {}
