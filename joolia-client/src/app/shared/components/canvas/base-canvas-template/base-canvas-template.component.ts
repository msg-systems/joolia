import { Component, Input } from '@angular/core';
import { BaseCanvasComponent } from '../base-canvas/base-canvas.component';

@Component({
    selector: 'base-canvas-template',
    templateUrl: './base-canvas-template.component.html',
    styleUrls: ['./base-canvas-template.component.scss']
})
export class BaseCanvasTemplateComponent {
    @Input() parent: BaseCanvasComponent;
    @Input() displaySorting = true;
}
