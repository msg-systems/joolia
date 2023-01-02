import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { SignUpConfirmationComponent } from './sign-up-confirmation/sign-up-confirmation.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../../core/components';
import { TranslateModule } from '@ngx-translate/core';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ForgotPasswordConfirmationComponent } from './forgot-password-confirmation/forgot-password-confirmation.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SsoSignInComponent } from './sso-sign-in/sso-sign-in.component';

@NgModule({
    declarations: [
        SignInComponent,
        SignUpComponent,
        SignUpConfirmationComponent,
        ForgotPasswordComponent,
        ForgotPasswordConfirmationComponent,
        ResetPasswordComponent,
        SsoSignInComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        AuthRoutingModule,
        MaterialModule,
        FlexLayoutModule,
        TranslateModule
    ],
    exports: [SignInComponent, SignUpComponent]
})
export class AuthModule {}
