import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { SignUpComponent } from './sign-up.component';
import { AuthenticationService, UserService } from '../../../core/services';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../../core/components';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRouteStub } from '../../../../testing/activated-route-stub';
import { AuthenticationServiceStub, UserServiceStub } from '../../../../testing/unitTest';

const userServiceStub = new UserServiceStub();
const authenticationServiceStub = new AuthenticationServiceStub();
const activeRouteServiceStub = new ActivatedRouteStub({ email: '' });
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

describe('SignUpComponent', () => {
    let component: SignUpComponent;
    let fixture: ComponentFixture<SignUpComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SignUpComponent],
            imports: [MaterialModule, TranslateModule.forRoot(), ReactiveFormsModule],
            providers: [
                { provide: AuthenticationService, useValue: authenticationServiceStub },
                { provide: Router, useValue: routerSpy },
                { provide: UserService, useValue: userServiceStub },
                { provide: ActivatedRoute, useValue: activeRouteServiceStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(SignUpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        authenticationServiceStub._resetStubCalls();
    });

    it('should be invalid when empty', () => {
        expect(component.signUpForm.valid).toBeFalsy();
    });

    it('should only accept when name is not empty', () => {
        const name = component.signUpForm.controls['name'];
        expect(name.valid).toBeFalsy();
        expect(name.errors.hasOwnProperty('required')).toBeTruthy();

        name.setValue('test');
        expect(name.errors).toBeFalsy();
        expect(name.valid).toBeTruthy();
    });

    it('should only accept correct email addresses', fakeAsync(() => {
        const email = component.signUpForm.controls['email'];
        expect(email.valid).toBeFalsy();
        expect(email.errors.hasOwnProperty('required')).toBeTruthy();

        email.setValue('test');
        expect(email.errors.hasOwnProperty('required')).toBeFalsy();
        expect(email.errors.hasOwnProperty('pattern')).toBeTruthy();

        email.setValue('test@test.com');
        tick(1000);
        expect(email.errors).toBeFalsy();
        expect(email.valid).toBeTruthy();
    }));

    it('should only accept correct passwords', () => {
        const password = component.signUpForm.controls['password'];
        expect(password.valid).toBeFalsy();
        expect(password.errors.hasOwnProperty('required')).toBeTruthy();

        password.setValue('abcde');
        expect(password.errors.hasOwnProperty('required')).toBeFalsy();
        expect(password.errors.hasOwnProperty('pattern')).toBeTruthy();

        password.setValue('12345678');
        expect(password.errors).toBeFalsy();
        expect(password.valid).toBeTruthy();
    });

    it('should accept when company is empty', () => {
        const company = component.signUpForm.controls['company'];
        expect(company.errors).toBeFalsy();
        expect(company.valid).toBeTruthy();

        company.setValue('test');
        expect(company.errors).toBeFalsy();
        expect(company.valid).toBeTruthy();
    });

    it('should only accept when contact checkbox is set', () => {
        const contact = component.signUpForm.controls['contact'];
        expect(contact.valid).toBeFalsy();
        expect(contact.errors.hasOwnProperty('required')).toBeTruthy();
        contact.patchValue(true);
        expect(contact.errors).toBeFalsy();
        expect(contact.valid).toBeTruthy();
    });

    it('should accept valid inputs', fakeAsync(() => {
        expect(component.signUpForm.valid).toBeFalsy();
        component.signUpForm.controls['name'].setValue('test');
        component.signUpForm.controls['email'].setValue('test@test.com');
        tick(1000);
        component.signUpForm.controls['password'].setValue('12345678');
        component.signUpForm.controls['contact'].patchValue(true);
        expect(component.signUpForm.valid).toBeTruthy();
        component.onSubmit();
        expect(authenticationServiceStub._signUpCalls.length).toBe(1);
        expect(routerSpy.navigate.calls.mostRecent().args.toString()).toBe('/signup/confirmation');
    }));

    it('should navigate to signin', () => {
        const link = fixture.debugElement.query(By.css('.sign-in-link a')).nativeElement.getAttribute('routerLink');

        expect(link).toBe('/signin');
    });
});
