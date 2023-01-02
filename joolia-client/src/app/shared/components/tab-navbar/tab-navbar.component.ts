import { Component, Input } from '@angular/core';
import { TabnavItem } from '../../../core/models';

@Component({
    selector: 'tab-navbar',
    templateUrl: './tab-navbar.component.html',
    styleUrls: ['./tab-navbar.component.scss']
})
export class TabNavbarComponent {
    @Input() tabLinks: TabnavItem[];

    constructor() {}
}
