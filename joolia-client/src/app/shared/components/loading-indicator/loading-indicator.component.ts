import { Component, Input } from '@angular/core';

/**
 * The LoadingIndicatorComponent shows a simple progress spinner in the center of the area.
 */
@Component({
    selector: 'loading-indicator',
    templateUrl: './loading-indicator.component.html',
    styleUrls: ['./loading-indicator.component.scss']
})
export class LoadingIndicatorComponent {
    @Input() diameter = 50;

    constructor() {}
}
