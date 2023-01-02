import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../core/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormatTemplateOverviewComponent } from './format-template-overview/format-template-overview.component';
import { FormatTemplateDetailsComponent } from './format-template-details/format-template-details.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
    declarations: [FormatTemplateOverviewComponent, FormatTemplateDetailsComponent],
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
export class FormatTemplateModule {}
