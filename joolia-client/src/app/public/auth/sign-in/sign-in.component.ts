import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, ConfigurationService, ValidationService } from '../../../core/services';
import { Router } from '@angular/router';

/**
 * The SignInComponent stores the logic needed for the sign in page. It initializes the form needed for login as well as which validations
 * are needed for each input field.
 */
@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
    signInForm: FormGroup;
    signInServerError: string;
    passwordResetSuccess = false;
    pictureSrc: string;

    constructor(
        private authenticationService: AuthenticationService,
        private validationService: ValidationService,
        private router: Router
    ) {}

    ngOnInit() {
        if (history.state) {
            this.passwordResetSuccess = history.state.passwordReset;
        }

        this.signInForm = new FormGroup({
            email: new FormControl('', [Validators.required, this.validationService.validateEmail]),
            password: new FormControl('', [Validators.required])
        });

        this.pictureSrc = ConfigurationService.getConfiguration().appBaseHref + 'assets/joolia_header.png';
    }

    onSubmit() {
        Object.values(this.signInForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.signInForm.valid) {
            const email = this.signInForm.value['email'];
            const password = this.signInForm.value['password'];

            this.authenticationService.signIn(email, password).subscribe(
                () => {
                    this.router.navigate(['/format/overview']);
                },
                (error) => {
                    if (error.status !== 0) {
                        this.passwordResetSuccess = false;
                        this.signInServerError = 'errors.signIn.' + error.status;
                    }
                }
            );
        }
    }
}
