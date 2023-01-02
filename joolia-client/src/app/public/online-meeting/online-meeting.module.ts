import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/core/components';
import { SharedModule } from 'src/app/shared/shared.module';
import { OnlineMeetingRoutingModule } from './online-meeting-routing';

@NgModule({
    declarations: [AuthCallbackComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        SharedModule,
        FlexLayoutModule,
        TranslateModule,
        OnlineMeetingRoutingModule
    ]
})
export class OnlineMeetingModule {}
