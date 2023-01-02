import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AuthenticationServiceStub, LoggerServiceStub, UserServiceStub } from 'src/testing/unitTest';
import { AppComponent } from './app.component';
import { AuthenticationService, LoggerService, NgxUploadService, UserService } from './core/services';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { Title } from '@angular/platform-browser';

const userServiceStub = new UserServiceStub();
const authenticationServiceStub = new AuthenticationServiceStub();
const loggerServiceStub = new LoggerServiceStub();

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), InfiniteScrollModule, MatMenuModule],
            declarations: [AppComponent],
            providers: [
                AppComponent,
                { provide: UserService, useValue: userServiceStub },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
                { provide: LocalStorageService, useValue: {} },
                { provide: MatDialog, useValue: {} },
                { provide: MatSnackBar, useValue: {} },
                { provide: MatBottomSheet, useValue: {} },
                { provide: SwUpdate, useValue: {} },
                { provide: Title, useValue: {} },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: NgxUploadService, useValue: {} }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        authenticationServiceStub._resetStubCalls();
    });

    it('should get the CSRF cookie and the refresh token when authenticated', fakeAsync(() => {
        authenticationServiceStub.authenticated = true;
        expect(component.ready).toBe(false);
        component['getTokens']();
        tick();
        expect(component.ready).toBe(true);
        expect(authenticationServiceStub._cookieCalls[0]).toBe('xsrfCookie');
        expect(authenticationServiceStub._cookieCalls[1]).toBe('refreshToken');
    }));

    it('should get only the CSRF cookie when not authenticated', fakeAsync(() => {
        authenticationServiceStub.authenticated = false;
        expect(component.ready).toBe(false);
        component['getTokens']();
        tick();
        expect(component.ready).toBe(true);
        expect(authenticationServiceStub._cookieCalls[0]).toBe('xsrfCookie');
        expect(authenticationServiceStub._cookieCalls[1]).toBeFalsy();
    }));
});
