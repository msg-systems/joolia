import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { UserComponent } from './user.component';
import { SnackbarService, UserService } from '../../../core/services';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../core/components';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserServiceStub } from '../../../../testing/unitTest';

const userServiceStub = new UserServiceStub();

describe('UserComponent', () => {
    let component: UserComponent;
    let fixture: ComponentFixture<UserComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [UserComponent],
            imports: [MaterialModule, TranslateModule.forRoot(), BrowserAnimationsModule],
            providers: [
                { provide: UserService, useValue: userServiceStub },
                { provide: SnackbarService, useValue: {} }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(UserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        userServiceStub._resetStubCalls();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should only accept when name is not empty', () => {
        const name = component.userForm.controls['name'];
        name.setValue('');
        expect(name.valid).toBeFalsy();
        expect(name.errors.hasOwnProperty('required')).toBeTruthy();

        name.setValue('test');
        expect(name.errors).toBeFalsy();
        expect(name.valid).toBeTruthy();
    });

    it('should not accept when name is too long', () => {
        const name = component.userForm.controls['name'];
        name.setValue('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        expect(name.valid).toBeFalsy();
        expect(name.errors.hasOwnProperty('maxlength')).toBeTruthy();

        name.setValue('test');
        expect(name.errors).toBeFalsy();
        expect(name.valid).toBeTruthy();
    });

    it('should accept when company is empty', () => {
        const company = component.userForm.controls['company'];
        company.setValue('');
        expect(company.errors).toBeFalsy();
        expect(company.valid).toBeTruthy();

        company.setValue('test');
        expect(company.errors).toBeFalsy();
        expect(company.valid).toBeTruthy();
    });

    it('should accept valid inputs', fakeAsync(() => {
        component.userForm.controls['name'].setValue('Testy Mc Tester');
        component.userForm.controls['company'].setValue('Test GmbH');
        expect(component.userForm.valid).toBeTruthy();
        component.onSubmit();
        expect(userServiceStub._updateProfileCalls.length).toBe(1);
    }));
});
