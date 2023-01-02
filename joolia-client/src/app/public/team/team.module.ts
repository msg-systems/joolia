import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamOverviewComponent } from './team-overview/team-overview.component';
import { TeamDetailsComponent } from './team-details/team-details.component';
import { TeamRoutingModule } from './team-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/core/components';
import { SharedModule } from 'src/app/shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
    declarations: [TeamOverviewComponent, TeamDetailsComponent],
    imports: [
        CommonModule,
        TeamRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        SharedModule,
        FlexLayoutModule,
        TranslateModule,
        InfiniteScrollModule
    ],
    providers: []
})
export class TeamModule {}
