import { Component } from '@angular/core';
import { BaseCanvasComponent } from '../base-canvas/base-canvas.component';
import { SnackbarService } from '../../../../core/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'business-canvas',
    templateUrl: '../base-canvas/base-canvas.component.html',
    styleUrls: ['../base-canvas/base-canvas.component.scss', './business-canvas.component.scss']
})
export class BusinessCanvasComponent extends BaseCanvasComponent {
    constructor(snackbarService: SnackbarService, translate: TranslateService) {
        super(snackbarService, translate);
    }
}
