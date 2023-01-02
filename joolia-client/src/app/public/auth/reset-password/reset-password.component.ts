import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, ValidationService } from '../../../core/services';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
    resetForm: FormGroup;

    constructor(
        private authService: AuthenticationService,
        private validationService: ValidationService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        this.resetForm = new FormGroup({
            password: new FormControl('', [Validators.required, this.validationService.validatePassword])
        });
    }

    onSubmit() {
        Object.values(this.resetForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.resetForm.valid) {
            const password = this.resetForm.value['password'];
            const token = this.route.snapshot.queryParams.token;

            this.authService.resetPassword(token, password).subscribe(() => {
                this.router.navigate(['signin'], { state: { passwordReset: true } });
            });
        }
    }
}
