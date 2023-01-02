import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InvitationDialogComponent } from './invitation-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../shared.module';
import { ConfigurationService, ValidationService } from '../../../core/services';
import { FormArray, FormBuilder } from '@angular/forms';
import { ConfigurationServiceStub } from '../../../../testing/unitTest';

const validationServiceSpy = jasmine.createSpyObj('ValidationService', ['validateEmails']);
const configurationServicesStub = new ConfigurationServiceStub();

describe('InvitationDialogComponent', () => {
    let component: InvitationDialogComponent;
    let fixture: ComponentFixture<InvitationDialogComponent>;
    const maxAddresses = 5;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), SharedModule, NoopAnimationsModule],
            declarations: [],
            providers: [
                FormBuilder,
                { provide: MAT_DIALOG_DATA, useValue: { contentParams: { maxEmailAddresses: maxAddresses } } },
                { provide: MatDialogRef, useValue: {} },
                { provide: ValidationService, useValue: validationServiceSpy },
                { provide: ConfigurationService, useValue: configurationServicesStub }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InvitationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', async(() => {
        expect(component).toBeTruthy();
    }));

    it('should be valid without invitation-text', () => {
        const invitationTextControl = component.invitationForm.controls['invitationText'];
        (component.invitationForm.controls['emails'] as FormArray).push(component.initEmail('test@example.com'));

        expect(invitationTextControl.valid).toBeTruthy();
        expect(component.invitationForm.valid).toBeTruthy();
    });

    it('should be valid with invitation-text', () => {
        const invitationTextControl = component.invitationForm.controls['invitationText'];
        invitationTextControl.setValue('Test-invitation-text');
        (component.invitationForm.controls['emails'] as FormArray).push(component.initEmail('test@example.com'));

        expect(invitationTextControl.valid).toBeTruthy();
        expect(component.invitationForm.valid).toBeTruthy();
    });

    it('should be invalid with more addresses than allowed', () => {
        const invitationTextControl = component.invitationForm.controls['invitationText'];
        for (let i = 0; i <= maxAddresses + 1; i++) {
            (component.invitationForm.controls['emails'] as FormArray).push(component.initEmail('test@example.com'));
        }
        component.onSubmit();
        expect(invitationTextControl.valid).toBeTruthy();
        expect(component.invitationForm.valid).toBeFalsy();
    });
});
