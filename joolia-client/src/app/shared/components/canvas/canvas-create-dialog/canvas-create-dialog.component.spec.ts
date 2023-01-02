import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CanvasCreateDialogComponent } from './canvas-create-dialog.component';
import { ConfigurationService } from '../../../../core/services';

const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

describe('CanvasCreateDialogComponent', () => {
    let component: CanvasCreateDialogComponent;
    let fixture: ComponentFixture<CanvasCreateDialogComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatDialogRef, useValue: dialogRefSpy }],
            declarations: [CanvasCreateDialogComponent],
            imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        dialogRefSpy.close.calls.reset();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CanvasCreateDialogComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should init form', () => {
            component.ngOnInit();
            expect(component.selectableCanvases.length).toEqual(
                ConfigurationService.getConfiguration().configuration.canvas.selectableCanvases.length
            );
            expect(component.canvasNameMaxLength).toBe(ConfigurationService.getConfiguration().configuration.characterLimits.canvas.name);
            const nameCtrl = component.canvasCreationForm.get('name');
            expect(nameCtrl).toBeDefined();
            expect(nameCtrl.value).toEqual('');
            const canvasCtrl = component.canvasCreationForm.get('canvas');
            expect(canvasCtrl).toBeDefined();
            expect(canvasCtrl.value.name).toEqual(ConfigurationService.getConfiguration().configuration.canvas.selectableCanvases[0].name);
            expect(
                component.canvasImageSrc.endsWith(ConfigurationService.getConfiguration().configuration.canvas.canvasImages[0].src)
            ).toBeTruthy();
        });
    });

    describe('onSubmit', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should do nothing if form is invalid', () => {
            component.onSubmit();
            expect(dialogRefSpy.close.calls.count()).toEqual(0);
        });

        it('should close dialog if form is valid', () => {
            component.canvasCreationForm.setValue({
                name: 'My Canvas Name',
                canvas: ConfigurationService.getConfiguration().configuration.canvas.selectableCanvases[1]
            });
            component.onSubmit();
            const canvas = dialogRefSpy.close.calls.mostRecent().args[0];
            expect(canvas.name).toBe('My Canvas Name');
            expect(canvas.slots.length).toBe(
                ConfigurationService.getConfiguration().configuration.canvas.selectableCanvases[1].slots.length
            );
        });
    });

    describe('setImage', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should update image if value changes', () => {
            component.canvasCreationForm.valueChanges.subscribe(() => {
                expect(
                    component.canvasImageSrc.endsWith(ConfigurationService.getConfiguration().configuration.canvas.canvasImages[2].src)
                ).toBeTruthy();
            });
            component.canvasCreationForm.setValue({
                name: 'My Canvas Name',
                canvas: ConfigurationService.getConfiguration().configuration.canvas.selectableCanvases[2]
            });
        });
    });
});
