import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ActivityService, ConfigurationService, FormatService, PhaseService } from '../../../../core/services';
import { Action, Canvas } from '../../../../core/models';

@Component({
    selector: 'canvas-list',
    templateUrl: './canvas-list.component.html',
    styleUrls: ['./canvas-list.component.scss']
})
export class CanvasListComponent implements OnInit {
    @Input() canvases: Canvas[];
    @Input() editable = false;
    @Input() displayActions = true;
    @Output() add: EventEmitter<void> = new EventEmitter();
    @Output() delete: EventEmitter<Canvas> = new EventEmitter<Canvas>();

    deleteAction: Action = {
        actionKey: 'delete',
        icon: 'delete',
        actionFunction: this.deleteCanvas.bind(this)
    };

    navigateAction = {
        actionKey: 'show',
        icon: 'launch',
        actionFunction: this.navigateToCanvas.bind(this)
    };

    actions = [];

    phaseId: string;
    formatId: string;
    activityId: string;

    constructor(
        private formatService: FormatService,
        private phaseService: PhaseService,
        private activityService: ActivityService,
        private router: Router
    ) {}

    ngOnInit(): void {
        if (this.displayActions) {
            this.formatId = this.formatService.getCurrentFormat().id;
            this.phaseId = this.phaseService.getCurrentPhase().id;
            this.activityId = this.activityService.getCurrentActivity().id;

            if (this.editable) {
                this.actions.push(this.deleteAction);
            }

            this.actions.push(this.navigateAction);
        }
    }

    onAddCanvas() {
        this.add.emit();
    }

    deleteCanvas(canvas: Canvas) {
        this.delete.emit(canvas);
    }

    navigateToCanvas(canvas: Canvas) {
        const route = `/format/${this.formatId}/phase/${this.phaseId}/activity/${this.activityId}/canvas/${canvas.id}`;
        this.router.navigate([route]);
    }

    getImage(canvas: Canvas): string {
        const imageConfig = ConfigurationService.getConfiguration().configuration.canvas.canvasImages.find(
            (c) => c.canvasType === canvas.canvasType
        );

        return imageConfig ? ConfigurationService.getConfiguration().appBaseHref + 'assets/' + imageConfig.src : null;
    }
}
