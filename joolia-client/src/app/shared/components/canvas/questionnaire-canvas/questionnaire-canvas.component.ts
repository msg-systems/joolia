import { Component, ViewEncapsulation } from '@angular/core';
import { BaseCanvasComponent } from '../base-canvas/base-canvas.component';
import { SnackbarService } from '../../../../core/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'questionnaire-canvas',
    templateUrl: '../base-canvas/base-canvas.component.html',
    styleUrls: ['./questionnaire-canvas.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class QuestionnaireCanvasComponent extends BaseCanvasComponent {
    constructor(snackbarService: SnackbarService, translate: TranslateService) {
        super(snackbarService, translate);
    }
}
