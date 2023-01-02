import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '..';
import { ConfigurationServiceStub, LoggerServiceStub, UserServiceStub } from '../../../../testing/unitTest';
import { SharedModule } from '../../../shared/shared.module';
import { ConfigurationService, LoggerService, UserService } from '../../services';

import { ErrorComponent } from './error.component';

const configurationServiceStub = new ConfigurationServiceStub();
const userServiceStub = new UserServiceStub();
const loggerServiceStub = new LoggerServiceStub();

describe('ErrorComponent', () => {
    let component: ErrorComponent;
    let fixture: ComponentFixture<ErrorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ErrorComponent],
            imports: [
                MaterialModule,
                TranslateModule.forRoot(),
                HttpClientTestingModule,
                RouterTestingModule,
                NoopAnimationsModule,
                SharedModule
            ],
            providers: [
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: LoggerService, useValue: loggerServiceStub }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ErrorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
