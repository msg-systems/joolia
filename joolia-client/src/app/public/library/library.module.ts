import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryOverviewComponent } from './library-overview/library-overview.component';
import { SharedModule } from '../../shared/shared.module';
import { LibraryRoutingModule } from './library-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../core/components';
import { LibraryDetailsComponent } from './library-details/library-details.component';
import { LibraryCreateDialogComponent } from './library-create-dialog/library-create-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LibraryMembersComponent } from './library-details/library-member/library-members.component';
import { ActivityTemplateModule } from '../activity-template/activity-template.module';
import { FormatTemplateModule } from '../format-template/format-template.module';
import { PhaseTemplateModule } from '../phase-template/phase-template.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
// tslint:disable-next-line:max-line-length
import { LibraryTemplateOverviewComponent } from './library-details/library-template/library-template-overview/library-template-overview.component';
// tslint:disable-next-line:max-line-length
import { LibraryTemplateDetailsComponent } from './library-details/library-template/library-template-details/library-template-details.component';

@NgModule({
    declarations: [
        LibraryOverviewComponent,
        LibraryDetailsComponent,
        LibraryMembersComponent,
        LibraryCreateDialogComponent,
        LibraryTemplateOverviewComponent,
        LibraryTemplateDetailsComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        LibraryRoutingModule,
        FlexLayoutModule,
        TranslateModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        ActivityTemplateModule,
        FormatTemplateModule,
        PhaseTemplateModule,
        InfiniteScrollModule
    ],
    providers: []
})
export class LibraryModule {}
