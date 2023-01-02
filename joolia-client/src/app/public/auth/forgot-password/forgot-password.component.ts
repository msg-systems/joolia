import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, ValidationService } from '../../../core/services';
import { Router } from '@angular/router';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
    requestForm: FormGroup;

    constructor(private authService: AuthenticationService, private validationService: ValidationService, private router: Router) {}

    ngOnInit() {
        this.requestForm = new FormGroup({
            email: new FormControl('', [Validators.required, this.validationService.validateEmail])
        });
    }

    onSubmit() {
        Object.values(this.requestForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.requestForm.valid) {
            const email = this.requestForm.value['email'];

            this.authService.requestPasswordReset(email).subscribe(() => {
                this.router.navigate(['forgot-password/confirmation'], { state: { email } });
            });
        }
    }
}
