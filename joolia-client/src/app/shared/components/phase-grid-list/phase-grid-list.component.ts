import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Action, DurationUnit, Phase, UpdateEventBody } from '../../../core/models';
import { ConfigurationService, PhaseService } from '../../../core/services';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
    selector: 'phase-grid-list',
    templateUrl: './phase-grid-list.component.html',
    styleUrls: ['./phase-grid-list.component.scss']
})
export class PhaseGridListComponent implements OnInit {
    @Input() headerText: string;
    @Input() phases: Phase[];
    @Input() editable = true;
    @Output() itemClick: EventEmitter<string> = new EventEmitter<string>();
    @Output() itemUpdate: EventEmitter<UpdateEventBody> = new EventEmitter<UpdateEventBody>();

    readonly phaseDurationDaysType = DurationUnit.DAYS;
    readonly phaseDurationMinutesType = DurationUnit.MINUTES;

    private phaseNameMaxLength: number;
    dateForm: FormGroup;

    constructor(private phaseService: PhaseService) {
        this.dateForm = new FormGroup({ start: new FormControl(moment(), [Validators.required]) });
    }

    ngOnInit(): void {
        this.phaseNameMaxLength = ConfigurationService.getConfiguration().configuration.characterLimits.phase.name;
    }

    getPhaseDatePickerType(durationUnit: DurationUnit) {
        return this.phaseService.getPhaseDatePickerType(durationUnit);
    }

    onPhaseClick(phaseId: string) {
        this.itemClick.emit(phaseId);
    }

    onPhaseUpdate(phaseId: string, updatedField: string, updatedValue: any) {
        const updateEvent: UpdateEventBody = {
            updatedObjectId: phaseId,
            updatedFieldName: updatedField,
            updatedFieldValue: updatedValue
        };

        this.itemUpdate.emit(updateEvent);
    }
}
