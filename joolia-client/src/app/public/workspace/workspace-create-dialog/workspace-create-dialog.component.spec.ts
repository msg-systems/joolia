import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkspaceCreateDialogComponent } from './workspace-create-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../../shared/shared.module';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../../core/services';
import { ReactiveFormsModule } from '@angular/forms';

describe('WorkspaceCreateDialogComponent', () => {
    let component: WorkspaceCreateDialogComponent;
    let fixture: ComponentFixture<WorkspaceCreateDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), SharedModule, NoopAnimationsModule, MatDialogModule, ReactiveFormsModule],
            declarations: [WorkspaceCreateDialogComponent],
            providers: [
                { provide: WorkspaceService, useValue: {} },
                { provide: Router, useValue: {} },
                { provide: MatDialogRef, useValue: {} }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkspaceCreateDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', async(() => {
        expect(component).toBeTruthy();
    }));

    it('should not be valid without name', () => {
        const nameControl = component.workspaceCreationForm.controls['name'];

        expect(nameControl.valid).toBeFalsy();
        expect(component.workspaceCreationForm.valid).toBeFalsy();
    });

    it('should be valid with name', () => {
        const nameControl = component.workspaceCreationForm.controls['name'];

        nameControl.setValue('Test-workspace');

        expect(nameControl.valid).toBeTruthy();
        expect(component.workspaceCreationForm.valid).toBeTruthy();
    });
});
