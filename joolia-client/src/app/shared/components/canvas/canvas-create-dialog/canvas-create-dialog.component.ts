import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { cloneDeep } from 'lodash-es';
import { Canvas, SelectOption } from '../../../../core/models';
import { ConfigurationService } from '../../../../core/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-canvas-create-dialog',
    templateUrl: './canvas-create-dialog.component.html',
    styleUrls: ['./canvas-create-dialog.component.scss']
})
export class CanvasCreateDialogComponent implements OnInit {
    canvasCreationForm: FormGroup;
    canvasNameMaxLength: number;
    selectableCanvases: SelectOption[];
    canvasImageSrc: string = null;

    constructor(private dialogRef: MatDialogRef<CanvasCreateDialogComponent>, private translate: TranslateService) {}

    ngOnInit() {
        this.canvasNameMaxLength = ConfigurationService.getConfiguration().configuration.characterLimits.canvas.name;
        const canvases = cloneDeep(ConfigurationService.getConfiguration().configuration.canvas.selectableCanvases);
        this.selectableCanvases = canvases.map((c) => {
            return { display: this.translate.instant(`labels.canvasType.${c.name.toLowerCase()}`), value: c };
        });

        this.canvasCreationForm = new FormGroup({
            name: new FormControl('', [Validators.required]),
            canvas: new FormControl(this.selectableCanvases[0].value, [Validators.required])
        });

        this.setImage(this.selectableCanvases[0].value);
        this.canvasCreationForm.valueChanges.subscribe((value) => this.setImage(value.canvas));
    }

    onSubmit() {
        Object.values(this.canvasCreationForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.canvasCreationForm.valid) {
            const canvas = this.canvasCreationForm.get('canvas').value;
            canvas.name = this.canvasCreationForm.get('name').value;
            this.dialogRef.close(canvas);
        }
    }

    setImage(canvas: Canvas) {
        const imageConfig = ConfigurationService.getConfiguration().configuration.canvas.canvasImages.find(
            (c) => c.canvasType === canvas.canvasType
        );

        this.canvasImageSrc = imageConfig ? ConfigurationService.getConfiguration().appBaseHref + 'assets/' + imageConfig.src : null;
    }
}
