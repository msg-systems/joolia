import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../core/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SubmissionOverviewComponent } from './submission-overview/submission-overview.component';
import { SubmissionDetailsComponent } from './submission-details/submission-details.component';
import { SubmissionRoutingModule } from './submission-routing.module';

@NgModule({
    declarations: [SubmissionOverviewComponent, SubmissionDetailsComponent],
    imports: [
        CommonModule,
        SharedModule,
        FlexLayoutModule,
        TranslateModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        SubmissionRoutingModule
    ],
    providers: []
})
export class SubmissionModule {}
