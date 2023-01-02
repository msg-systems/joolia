import { Component, Input, OnInit } from '@angular/core';
import { ConfigurationService } from '../../../core/services';

@Component({
    selector: 'empty-state',
    templateUrl: './empty-state.component.html',
    styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent implements OnInit {
    emptyStateImgSrc: string;

    @Input() titleKey: string;
    @Input() contentKey: string;
    @Input() altTextKey: string;

    constructor() {}

    ngOnInit() {
        this.emptyStateImgSrc = ConfigurationService.getConfiguration().appBaseHref + 'assets/empty_state.png';
    }
}
