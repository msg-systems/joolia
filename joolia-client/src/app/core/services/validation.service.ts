import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { ConfigurationService } from './configuration.service';

/**
 * The ValidationService stores all validation functions used on the client.
 */
@Injectable({
    providedIn: 'root'
})
export class ValidationService {
    constructor() {}

    validateEmail(control: AbstractControl): { [key: string]: any } | null {
        const regex = new RegExp(ConfigurationService.getConfiguration().configuration.validations.email);

        return regex.test(control.value) ? null : { pattern: true };
    }

    validatePassword(control: AbstractControl): { [key: string]: any } | null {
        const regex = new RegExp(ConfigurationService.getConfiguration().configuration.validations.password);

        return regex.test(control.value) ? null : { pattern: true };
    }

    validateEmails(control: FormArray): { [key: string]: any } | null {
        let errorFlag = false;
        const regex = new RegExp(ConfigurationService.getConfiguration().configuration.validations.email);
        for (const emailControl of control.controls) {
            if (!regex.test(emailControl.value)) {
                emailControl.setErrors({ pattern: true });
                errorFlag = true;
            }
        }

        return errorFlag ? { pattern: true } : null;
    }

    validateVideoUrl(control: AbstractControl): { [key: string]: any } | null {
        const regex = new RegExp(ConfigurationService.getConfiguration().configuration.validations.videoURL);

        return regex.test(control.value) ? null : { pattern: true };
    }

    validateUrl(control: AbstractControl): { [key: string]: any } | null {
        const regex = new RegExp(ConfigurationService.getConfiguration().configuration.validations.url);

        return regex.test(control.value) ? null : { pattern: true };
    }

    validateFileNameExtensionLength(formGroup: FormGroup): { [key: string]: any } | null {
        if (!(formGroup && formGroup.controls)) {
            return null;
        }

        const fileNameMaxLength = ConfigurationService.getConfiguration().configuration.characterLimits.file.name;
        const fileExtension = formGroup.controls['extension'].value;
        let fileName = formGroup.controls['fileName'].value;

        if (fileExtension && fileExtension.length > 0) {
            fileName = [fileName, fileExtension].join('.');
        }

        ['fileName', 'extension'].forEach((ctrlName) => {
            if (fileName.length > fileNameMaxLength) {
                formGroup.controls[ctrlName].setErrors({ length: true });
                formGroup.controls[ctrlName].markAsTouched();
            } else {
                let errors = formGroup.controls[ctrlName].errors;
                if (errors) {
                    delete errors.length;
                    if (Object.keys(errors).length === 0) {
                        errors = null;
                    }
                }
                formGroup.controls[ctrlName].setErrors(errors);
            }
        });

        return fileName.length > fileNameMaxLength ? { length: true } : null;
    }
}
