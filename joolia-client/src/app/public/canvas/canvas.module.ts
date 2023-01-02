import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { CanvasDetailsComponent } from './canvas-details/canvas-details.component';
import { CanvasRoutingModule } from './canvas-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../../core/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FlexLayoutModule,
        TranslateModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        CanvasRoutingModule
    ],
    declarations: [CanvasDetailsComponent]
})
export class CanvasModule {}
