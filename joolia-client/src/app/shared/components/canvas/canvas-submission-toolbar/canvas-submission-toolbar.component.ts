import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ColorPickerControl } from '@iplab/ngx-color-picker';
import { Subscription } from 'rxjs';
import { ConfigurationService } from 'src/app/core/services';

@Component({
    selector: 'app-canvas-submission-toolbar',
    templateUrl: './canvas-submission-toolbar.component.html',
    styleUrls: ['./canvas-submission-toolbar.component.scss']
})
export class CanvasSubmissionToolbarComponent implements OnInit, OnDestroy {
    @Input() editAllowed: boolean;
    @Input() voteCount: number;
    @Input() isVotedByMe: boolean;
    @Output() colorPicked = new EventEmitter<string>();
    @Output() deleted = new EventEmitter<void>();
    @Output() toggleVote = new EventEmitter<void>();
    colorPickerController: ColorPickerControl;
    private subscriptions: Subscription[] = [];

    constructor() {}

    ngOnInit() {
        this.colorPickerController = new ColorPickerControl();
        this.colorPickerController.setColorPresets(
            ConfigurationService.getConfiguration().configuration.canvas.canvasSubmissionColorPresents
        );

        this.subscriptions.push(
            this.colorPickerController.valueChanges.subscribe(() => {
                this.colorPicked.emit(this.colorPickerController.value.toRgbaString());
            })
        );
    }

    onDelete() {
        this.deleted.emit();
    }

    onVoteClicked() {
        this.toggleVote.emit();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
