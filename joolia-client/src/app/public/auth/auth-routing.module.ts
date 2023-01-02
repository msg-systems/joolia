import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpConfirmationComponent } from './sign-up-confirmation/sign-up-confirmation.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ForgotPasswordConfirmationComponent } from './forgot-password-confirmation/forgot-password-confirmation.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SsoSignInComponent } from './sso-sign-in/sso-sign-in.component';
import { FooterComponent } from '../../core/components';
import { LoggedInGuard } from '../../core/guards';

/**
 * The AuthRoutingModule handles all routes used for the authentication of a user on the application.
 */
const authRoutes: Routes = [
    {
        path: '',
        component: FooterComponent,
        children: [
            { path: '', redirectTo: '/home', pathMatch: 'full' },
            { path: 'login', redirectTo: '/signin' },
            { path: 'signin', component: SignInComponent, canActivate: [LoggedInGuard] },
            {
                path: 'signup',
                canActivate: [LoggedInGuard],
                children: [
                    { path: '', component: SignUpComponent },
                    { path: 'confirmation', component: SignUpConfirmationComponent }
                ]
            },
            {
                path: 'forgot-password',
                children: [
                    { path: '', component: ForgotPasswordComponent },
                    { path: 'confirmation', component: ForgotPasswordConfirmationComponent }
                ]
            },
            {
                path: 'reset-password',
                children: [{ path: '', component: ResetPasswordComponent }]
            }
        ]
    },
    {
        path: 'rbi-signin',
        component: SsoSignInComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(authRoutes)],
    exports: [RouterModule]
})
export class AuthRoutingModule {}
