import { Component } from '@angular/core';
import { ConfigurationService } from '../../../core/services';

/**
 * The SignUpConfirmationComponent shows information after a successful registration of a new user.
 */
@Component({
    selector: 'app-sign-up-confirmation',
    templateUrl: './sign-up-confirmation.component.html',
    styleUrls: ['./sign-up-confirmation.component.scss']
})
export class SignUpConfirmationComponent {
    signUpConfirmImage: string;

    constructor() {
        this.signUpConfirmImage = ConfigurationService.getConfiguration().appBaseHref + 'assets/signup-confirm.png';
    }
}
