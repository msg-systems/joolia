import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../../core/components';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { PhaseDetailsComponent } from './phase-details/phase-details.component';
import { PhaseRoutingModule } from './phase-routing.module';
import { PhaseOverviewComponent } from './phase-overview/phase-overview.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
    declarations: [PhaseDetailsComponent, PhaseOverviewComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        SharedModule,
        FlexLayoutModule,
        TranslateModule,
        PhaseRoutingModule,
        InfiniteScrollModule
    ],
    exports: [],
    providers: []
})
export class PhaseModule {}
