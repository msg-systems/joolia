import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthenticationService, UserService } from '../../../core/services';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../../core/components';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ActivatedRouteStub } from '../../../../testing/activated-route-stub';

const userSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
const authSpy = jasmine.createSpyObj('AuthenticationService', ['requestPasswordReset']);
const requestPasswordResetSpy = authSpy.requestPasswordReset.and.returnValue(of({}));
const activeRouteServiceStub = new ActivatedRouteStub({ email: '' });

describe('ForgotPasswordComponent', () => {
    let component: ForgotPasswordComponent;
    let fixture: ComponentFixture<ForgotPasswordComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ForgotPasswordComponent],
            imports: [MaterialModule, TranslateModule.forRoot(), ReactiveFormsModule],
            providers: [
                { provide: AuthenticationService, useValue: authSpy },
                { provide: Router, useValue: routerSpy },
                { provide: UserService, useValue: userSpy },
                { provide: ActivatedRoute, useValue: activeRouteServiceStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(ForgotPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be invalid when empty', () => {
        expect(component.requestForm.valid).toBeFalsy();
    });

    it('should only accept correct email addresses', fakeAsync(() => {
        const email = component.requestForm.controls['email'];
        expect(email.valid).toBeFalsy();
        expect(email.errors.hasOwnProperty('required')).toBeTruthy();

        email.setValue('test');
        expect(email.errors.hasOwnProperty('required')).toBeFalsy();
        expect(email.errors.hasOwnProperty('pattern')).toBeTruthy();

        email.setValue('test@test.com');
        expect(email.errors).toBeFalsy();
        expect(email.valid).toBeTruthy();
    }));

    it('should accept valid inputs', fakeAsync(() => {
        expect(component.requestForm.valid).toBeFalsy();
        component.requestForm.controls['email'].setValue('test@test.com');
        expect(component.requestForm.valid).toBeTruthy();
        component.onSubmit();
        expect(requestPasswordResetSpy.calls.count()).toBe(1);
        expect(
            routerSpy.navigate.calls
                .mostRecent()
                .args[0].pop()
                .toString()
        ).toBe('forgot-password/confirmation');
        expect(routerSpy.navigate.calls.mostRecent().args[1]).toEqual({ state: { email: 'test@test.com' } });
    }));
});
