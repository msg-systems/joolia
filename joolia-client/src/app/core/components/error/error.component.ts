import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from '../../services';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
    errorStateImgSrc: string;

    constructor() {}

    ngOnInit() {
        this.errorStateImgSrc = ConfigurationService.getConfiguration().appBaseHref + 'assets/error_state.png';
    }
}
