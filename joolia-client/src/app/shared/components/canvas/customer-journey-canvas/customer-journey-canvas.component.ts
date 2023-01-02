import { Component, ViewEncapsulation } from '@angular/core';
import { BaseCanvasComponent } from '../base-canvas/base-canvas.component';
import { SnackbarService } from '../../../../core/services';
import { Slot } from '../../../../core/models';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'customer-journey-canvas',
    templateUrl: './customer-journey-canvas.component.html',
    styleUrls: ['../base-canvas-template/base-canvas-template.component.scss', './customer-journey-canvas.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CustomerJourneyCanvasComponent extends BaseCanvasComponent {
    constructor(snackbarService: SnackbarService, translate: TranslateService) {
        super(snackbarService, translate);
    }

    getSlotHeight(slot: Slot): string {
        let slotHeight = super.getSlotHeight(slot);

        if (slot.row === 1) {
            slotHeight = 'canvas-cell-height-arrow';
        }
        return slotHeight;
    }

    getSlotStyle(slot: Slot): string {
        let cssClasses = '';

        if (slot.row === 1) {
            cssClasses = 'canvas-cell-arrow canvas-cell-no-content';

            if (slot.column === 1) {
                cssClasses += ' first-arrow';
            }
        } else if (slot.column === 1) {
            cssClasses = 'canvas-cell-no-content';
        } else {
            cssClasses = 'canvas-cell-square ';
        }
        return cssClasses;
    }

    getArrowSlots(): Slot[] {
        return this.canvas.slots.filter((slot) => slot.column > 1 && slot.row === 1);
    }

    getRowTitleSlots(): Slot[] {
        return this.canvas.slots.filter((slot) => slot.column === 1 && slot.row > 1);
    }

    getContentSlot(col, row): Slot {
        return this.canvas.slots.find((slot) => slot.column === col && slot.row === row);
    }
}
