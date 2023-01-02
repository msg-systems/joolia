import { TestBed } from '@angular/core/testing';

import { FormControl, FormGroup } from '@angular/forms';
import { UserService } from './user.service';
import { ValidationService } from './validation.service';

const userSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);

describe('ValidationService', () => {
    let service: ValidationService;
    let formGroup: FormGroup;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [{ provide: UserService, useValue: userSpy }]
        });
        service = TestBed.inject(ValidationService);
        formGroup = new FormGroup({
            email: new FormControl('', [service.validateEmail]),
            password: new FormControl('', [service.validatePassword]),
            videoURL: new FormControl('', [service.validateVideoUrl])
        });
    });

    it('should only accept valid emails', () => {
        const email = formGroup.controls['email'];
        email.setValue('');
        expect(email.valid).toBeFalsy();

        email.setValue('test');
        expect(email.valid).toBeFalsy();

        email.setValue('test@test.com');
        expect(email.valid).toBeTruthy();

        email.setValue('test@test@com');
        expect(email.valid).toBeFalsy();

        email.setValue('test.com');
        expect(email.valid).toBeFalsy();
    });

    it('should only accept valid passwords', () => {
        const password = formGroup.controls['password'];
        password.setValue('');
        expect(password.valid).toBeFalsy();

        password.setValue('abcde');
        expect(password.valid).toBeFalsy();

        password.setValue('abcde12');
        expect(password.valid).toBeFalsy();

        password.setValue('12345678');
        expect(password.valid).toBeTruthy();

        password.setValue('1234567a');
        expect(password.valid).toBeTruthy();

        password.setValue('abca#+123');
        expect(password.valid).toBeTruthy();

        password.setValue('abcäab123');
        expect(password.valid).toBeTruthy();
    });

    it('should only accept valid array of emails', () => {
        // TODO
    });

    it('should only accept valid video urls', () => {
        const videoURL = formGroup.controls['videoURL'];
        videoURL.setValue('');
        expect(videoURL.valid).toBeFalsy();

        videoURL.setValue('http://www.google.de');
        expect(videoURL.valid).toBeFalsy();

        videoURL.setValue('https://www.youtube.com');
        expect(videoURL.valid).toBeFalsy();

        videoURL.setValue('https://youtu.be/C1Aag-9Leb0');
        expect(videoURL.valid).toBeTruthy();

        videoURL.setValue('https://www.youtube.com/embed/C1Aag-9Leb0');
        expect(videoURL.valid).toBeTruthy();
    });
});
