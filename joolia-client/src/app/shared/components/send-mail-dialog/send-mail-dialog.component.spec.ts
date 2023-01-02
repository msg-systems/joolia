import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../shared.module';
import { ConfigurationService, ValidationService } from '../../../core/services';
import { FormArray, FormBuilder } from '@angular/forms';
import { ConfigurationServiceStub, getMockData } from '../../../../testing/unitTest';
import { SendMailDialogComponent } from './send-mail-dialog.component';

const validationServiceSpy = jasmine.createSpyObj('ValidationService', ['validateEmails']);
const configurationServicesStub = new ConfigurationServiceStub();

describe('SendMailDialogComponent', () => {
    let component: SendMailDialogComponent;
    let fixture: ComponentFixture<SendMailDialogComponent>;
    const mailReceiver = getMockData('user.leia');
    const maxMailMessageLength = ConfigurationService.getConfiguration().configuration.characterLimits.mailMessage.text.max;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), SharedModule, NoopAnimationsModule],
            declarations: [],
            providers: [
                FormBuilder,
                { provide: MAT_DIALOG_DATA, useValue: { contentParams: { mailReceiver: mailReceiver } } },
                { provide: MatDialogRef, useValue: {} },
                { provide: ValidationService, useValue: validationServiceSpy },
                { provide: ConfigurationService, useValue: configurationServicesStub }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SendMailDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', async(() => {
        expect(component).toBeTruthy();
    }));

    it('should be invalid with too long text', () => {
        const sendMailMessageControl = component.sendMailForm.controls['mailMessage'];
        const repeatTimes = maxMailMessageLength + 1;
        const messageText = 'a'.repeat(repeatTimes);
        sendMailMessageControl.setValue(messageText);

        expect(sendMailMessageControl.valid).toBeFalsy();
        expect(component.sendMailForm.valid).toBeFalsy();
    });

    it('should be valid with message-text', () => {
        const sendMailMessageControl = component.sendMailForm.controls['mailMessage'];
        const repeatTimes = maxMailMessageLength - 1;
        const messageText = 'a'.repeat(repeatTimes);
        component.sendMailForm.controls['mailMessage'].setValue(messageText);

        expect(sendMailMessageControl.valid).toBeTruthy();
        expect(component.sendMailForm.valid).toBeTruthy();
    });

    it('should be invalid with empty message-text', () => {
        const sendMailMessageControl = component.sendMailForm.controls['mailMessage'];
        sendMailMessageControl.setValue('');

        expect(sendMailMessageControl.valid).toBeFalsy();
        expect(component.sendMailForm.valid).toBeFalsy();
    });
});
