import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryCreateDialogComponent } from './library-create-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../../shared/shared.module';
import { Router } from '@angular/router';
import { LibraryService } from '../../../core/services';
import { ReactiveFormsModule } from '@angular/forms';

describe('LibraryCreateDialogComponent', () => {
    let component: LibraryCreateDialogComponent;
    let fixture: ComponentFixture<LibraryCreateDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), SharedModule, NoopAnimationsModule, MatDialogModule, ReactiveFormsModule],
            declarations: [LibraryCreateDialogComponent],
            providers: [
                { provide: LibraryService, useValue: {} },
                { provide: Router, useValue: {} },
                { provide: MatDialogRef, useValue: {} }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LibraryCreateDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', async(() => {
        expect(component).toBeTruthy();
    }));

    it('should not be valid without name', () => {
        const nameControl = component.libraryCreationForm.controls['name'];

        expect(nameControl.valid).toBeFalsy();
        expect(component.libraryCreationForm.valid).toBeFalsy();
    });

    it('should be valid with name', () => {
        const nameControl = component.libraryCreationForm.controls['name'];

        nameControl.setValue('Test-library');

        expect(nameControl.valid).toBeTruthy();
        expect(component.libraryCreationForm.valid).toBeTruthy();
    });
});
