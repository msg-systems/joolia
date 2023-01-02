import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../core/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PhaseTemplateOverviewComponent } from './phase-template-overview/phase-template-overview.component';
import { PhaseTemplateDetailsComponent } from './phase-template-details/phase-template-details.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
    declarations: [PhaseTemplateOverviewComponent, PhaseTemplateDetailsComponent],
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
export class PhaseTemplateModule {}
