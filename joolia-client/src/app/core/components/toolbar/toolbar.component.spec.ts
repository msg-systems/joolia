import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '..';
import { AuthenticationServiceStub, UserServiceStub } from '../../../../testing/unitTest';
import { AuthenticationService, UserService } from '../../services';

import { ToolbarComponent } from './toolbar.component';

const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
const authServiceStub = new AuthenticationServiceStub();
const userServiceStub = new UserServiceStub();

describe('ToolbarComponent', () => {
    let component: ToolbarComponent;
    let fixture: ComponentFixture<ToolbarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ToolbarComponent],
            imports: [MaterialModule, TranslateModule.forRoot()],
            providers: [
                { provide: AuthenticationService, useValue: authServiceStub },
                { provide: Router, useValue: routerSpy },
                { provide: UserService, useValue: userServiceStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should logout', () => {
        component.onLogout();
        expect(authServiceStub._logoutCalls.length).toBe(1);
        expect(routerSpy['navigate']).toHaveBeenCalled();
    });
});
