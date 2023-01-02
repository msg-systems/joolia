import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../shared.module';
import { ConfigurationService, ValidationService } from '../../../core/services';
import { FormBuilder } from '@angular/forms';
import { ConfigurationServiceStub } from '../../../../testing/unitTest';
import { AdminConsentDialogComponent } from './admin-consent-request-dialog.component';

const validationServiceSpy = jasmine.createSpyObj('ValidationService', ['validateEmail']);
const configurationServicesStub = new ConfigurationServiceStub();

describe('AdminConsentRequestDialogComponent', () => {
    let component: AdminConsentDialogComponent;
    let fixture: ComponentFixture<AdminConsentDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), SharedModule, NoopAnimationsModule],
            declarations: [],
            providers: [
                FormBuilder,
                { provide: MatDialogRef, useValue: {} },
                { provide: ValidationService, useValue: validationServiceSpy },
                { provide: ConfigurationService, useValue: configurationServicesStub }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminConsentDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', async(() => {
        expect(component).toBeTruthy();
    }));
});
