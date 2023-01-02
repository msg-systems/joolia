import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, ConfigurationService, ValidationService } from '../../../core/services';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { timer } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { UserSignUp } from '../../../core/models';

declare var grecaptcha;

/**
 * The SignUpComponent stores the logic needed for the sign in page. It initializes the form needed for registration as well as which
 * validations are needed for each input field.
 */
@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
    signUpForm: FormGroup;
    userNameMaxLength: number;
    companyNameMaxLength: number;
    pictureSrc: string;

    constructor(
        private authenticationService: AuthenticationService,
        private validationService: ValidationService,
        private route: ActivatedRoute,
        private router: Router,
        private translate: TranslateService
    ) {}

    ngOnInit() {
        const initialEmail = this.route.snapshot.queryParams.email || '';
        const characterLimits = ConfigurationService.getConfiguration().configuration.characterLimits.user;
        this.userNameMaxLength = characterLimits.name;
        this.companyNameMaxLength = characterLimits.company;

        this.signUpForm = new FormGroup({
            name: new FormControl('', [Validators.required]),
            email: new FormControl(
                { value: initialEmail, disabled: initialEmail.length > 0 },
                [Validators.required, this.validationService.validateEmail],
                [this.checkMailAvailability.bind(this)]
            ),
            password: new FormControl('', [Validators.required, this.validationService.validatePassword]),
            company: new FormControl(''),
            contact: new FormControl('', [Validators.required])
        });

        this.pictureSrc = ConfigurationService.getConfiguration().appBaseHref + 'assets/joolia_header.png';
    }

    checkMailAvailability(control: FormControl) {
        return timer(ConfigurationService.getConfiguration().configuration.validations.debounceTime).pipe(
            switchMap(() => {
                return this.authenticationService.checkMailAvailability(control.value).pipe(
                    map((res) => {
                        return res ? null : { taken: true };
                    })
                );
            })
        );
    }

    onSubmit() {
        Object.values(this.signUpForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.signUpForm.valid) {
            const reCaptchaConfig = ConfigurationService.getConfiguration().configuration.reCaptcha;
            if (reCaptchaConfig.enabled) {
                grecaptcha.ready(() => {
                    grecaptcha.execute(reCaptchaConfig.siteKey, { action: 'signup' }).then((token) => {
                        this.signUpForm.value['reCaptchaToken'] = token;
                        this.performSignUp();
                    });
                });
            } else {
                this.performSignUp();
            }
        }
    }

    private performSignUp() {
        const signUpUserData = this.signUpForm.value as UserSignUp;

        // Needs to be done like this since the email field can be already filled due to invitations. In reactive forms the
        // disabled-attribute is handled in the FormControl object.
        signUpUserData.email = this.signUpForm.controls['email'].value;

        // Max. length for workspace/library is 55, max. length for userName is 40, max. length of translation is 12, so this is no problem
        if (this.translate.getBrowserLang() === 'de' && /[sßzx]$/.test(signUpUserData.name.toLowerCase())) {
            // Special case for German genitive
            signUpUserData.privateWorkspaceName = this.translate.instant('labels.personalWorkspaceGenitive', {
                userName: signUpUserData.name
            });
            signUpUserData.privateLibraryName = this.translate.instant('labels.personalLibraryGenitive', { userName: signUpUserData.name });
        } else {
            signUpUserData.privateWorkspaceName = this.translate.instant('labels.personalWorkspace', { userName: signUpUserData.name });
            signUpUserData.privateLibraryName = this.translate.instant('labels.personalLibrary', { userName: signUpUserData.name });
        }

        this.authenticationService.signUp(signUpUserData).subscribe(() => {
            this.router.navigate(['/signup/confirmation']);
        });
    }
}
