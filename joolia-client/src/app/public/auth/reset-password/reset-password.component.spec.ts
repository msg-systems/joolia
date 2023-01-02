import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
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
const authSpy = jasmine.createSpyObj('AuthenticationService', ['resetPassword']);
const resetPasswordSpy = authSpy.resetPassword.and.returnValue(of({}));
const activeRouteServiceStub = new ActivatedRouteStub({ email: '' });

describe('ResetPasswordComponent', () => {
    let component: ResetPasswordComponent;
    let fixture: ComponentFixture<ResetPasswordComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ResetPasswordComponent],
            imports: [MaterialModule, TranslateModule.forRoot(), ReactiveFormsModule],
            providers: [
                { provide: AuthenticationService, useValue: authSpy },
                { provide: Router, useValue: routerSpy },
                { provide: UserService, useValue: userSpy },
                { provide: ActivatedRoute, useValue: activeRouteServiceStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(ResetPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be invalid when empty', () => {
        expect(component.resetForm.valid).toBeFalsy();
    });

    it('should only accept correct passwords', () => {
        const password = component.resetForm.controls['password'];
        expect(password.valid).toBeFalsy();
        expect(password.errors.hasOwnProperty('required')).toBeTruthy();

        password.setValue('abcde');
        expect(password.errors.hasOwnProperty('required')).toBeFalsy();
        expect(password.errors.hasOwnProperty('pattern')).toBeTruthy();

        password.setValue('12345678');
        expect(password.errors).toBeFalsy();
        expect(password.valid).toBeTruthy();
    });

    it('should accept valid inputs', fakeAsync(() => {
        expect(component.resetForm.valid).toBeFalsy();
        component.resetForm.controls['password'].setValue('12345678');
        expect(component.resetForm.valid).toBeTruthy();
        component.onSubmit();
        expect(resetPasswordSpy.calls.count()).toBe(1);
        expect(
            routerSpy.navigate.calls
                .mostRecent()
                .args[0].pop()
                .toString()
        ).toBe('signin');
        expect(routerSpy.navigate.calls.mostRecent().args[1]).toEqual({ state: { passwordReset: true } });
    }));
});
