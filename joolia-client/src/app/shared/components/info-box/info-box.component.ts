import { Component, Input } from '@angular/core';

/**
 * The InfoBoxComponent translates a given translation key and shows the translation as a differently styled message depending on the
 * specified display type (currently available: success, error).
 */
@Component({
    selector: 'info-box',
    templateUrl: './info-box.component.html',
    styleUrls: ['./info-box.component.scss']
})
export class InfoBoxComponent {
    @Input() infoKey: string;
    @Input() boxDisplay: string; // Valid values: success, error

    constructor() {}
}
