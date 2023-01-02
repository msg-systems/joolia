import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from 'src/app/core/services';

@Component({
    selector: 'app-sso-sign-in',
    templateUrl: './sso-sign-in.component.html',
    styleUrls: ['./sso-sign-in.component.scss']
})
export class SsoSignInComponent implements OnInit {
    constructor(private config: ConfigurationService) {
        window.location.href = config.getServerConnection() + '/sso/signin';
    }

    ngOnInit() {}
}
