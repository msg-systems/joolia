import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-forgot-password-confirmation',
    templateUrl: './forgot-password-confirmation.component.html',
    styleUrls: ['./forgot-password-confirmation.component.scss']
})
export class ForgotPasswordConfirmationComponent implements OnInit {
    email: string;

    constructor(private router: Router) {}

    ngOnInit() {
        this.email = history.state.email;

        if (!this.email) {
            this.router.navigate(['forgot-password']);
        }
    }
}
