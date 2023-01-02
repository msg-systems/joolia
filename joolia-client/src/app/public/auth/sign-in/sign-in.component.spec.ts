import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInComponent } from './sign-in.component';
import { AuthenticationService, UserService } from '../../../core/services';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../core/components';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AuthenticationServiceStub, UserServiceStub } from '../../../../testing/unitTest';

const userServiceStub = new UserServiceStub();
const authenticationServiceStub = new AuthenticationServiceStub();
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

describe('SigninComponent', () => {
    let component: SignInComponent;
    let fixture: ComponentFixture<SignInComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SignInComponent],
            imports: [MaterialModule, TranslateModule.forRoot()],
            providers: [
                { provide: AuthenticationService, useValue: authenticationServiceStub },
                { provide: Router, useValue: routerSpy },
                { provide: UserService, useValue: userServiceStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(SignInComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be invalid when empty', () => {
        expect(component.signInForm.valid).toBeFalsy();
    });

    it('should only accept correct email addresses', () => {
        const email = component.signInForm.controls['email'];
        expect(email.valid).toBeFalsy();
        expect(email.errors.hasOwnProperty('required')).toBeTruthy();

        email.setValue('test');
        expect(email.errors.hasOwnProperty('required')).toBeFalsy();
        expect(email.errors.hasOwnProperty('pattern')).toBeTruthy();

        email.setValue('test@test.com');
        expect(email.errors).toBeFalsy();
        expect(email.valid).toBeTruthy();
    });

    it('should only accept correct passwords', () => {
        const password = component.signInForm.controls['password'];
        expect(password.valid).toBeFalsy();
        expect(password.errors.hasOwnProperty('required')).toBeTruthy();

        password.setValue('12345678');
        expect(password.errors).toBeFalsy();
        expect(password.valid).toBeTruthy();
    });

    it('should accept valid inputs', () => {
        expect(component.signInForm.valid).toBeFalsy();
        component.signInForm.controls['email'].setValue('test@test.com');
        component.signInForm.controls['password'].setValue('12345678');
        expect(component.signInForm.valid).toBeTruthy();
        component.onSubmit();
        expect(authenticationServiceStub._signInCalls.length).toBe(1);
        expect(routerSpy.navigate.calls.mostRecent().args.toString()).toBe('/format/overview');
    });

    it('should navigate to signup', () => {
        const link = fixture.debugElement.query(By.css('.sign-up-link')).nativeElement.getAttribute('routerLink');

        expect(link).toBe('/signup');
    });
});
