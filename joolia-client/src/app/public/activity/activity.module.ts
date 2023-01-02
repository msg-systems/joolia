import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../../core/components';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { ActivityDetailsComponent } from './activity-details/activity-details.component';
import { ActivityRoutingModule } from './activity-routing.module';
import { ActivityDetailsMainComponent } from './activity-details/activity-details-main/activity-details-main.component';
import { ActivityDetailsProgressComponent } from './activity-details/activity-details-progress/activity-details-progress.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [ActivityDetailsComponent, ActivityDetailsMainComponent, ActivityDetailsProgressComponent],
    imports: [CommonModule, MaterialModule, SharedModule, FlexLayoutModule, TranslateModule, ActivityRoutingModule, ReactiveFormsModule],
    exports: [],
    providers: []
})
export class ActivityModule {}
