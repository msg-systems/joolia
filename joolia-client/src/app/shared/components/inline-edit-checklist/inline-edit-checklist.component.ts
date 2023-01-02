import { Component, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { ChecklistItem, UpdateEventBody } from '../../../core/models';
import { ConfigurationService } from '../../../core/services';

@Component({
    selector: 'inline-edit-checklist',
    templateUrl: './inline-edit-checklist.component.html',
    styleUrls: ['./inline-edit-checklist.component.scss']
})
export class InlineEditChecklistComponent implements OnInit {
    @Input() items: ChecklistItem[];
    @Input() editable: boolean;
    @Input() checkable: boolean;
    @Input() itemMaxLength: number;
    @Output() addEntry: EventEmitter<string> = new EventEmitter<string>();
    @Output() editEntry: EventEmitter<UpdateEventBody> = new EventEmitter<UpdateEventBody>();
    @Output() checkEntry: EventEmitter<string> = new EventEmitter<string>();
    @Output() deleteEntry: EventEmitter<string> = new EventEmitter<string>();

    itemMaxLengthValue: number;
    newEntryText = '';

    constructor(private renderer: Renderer2) {}

    ngOnInit() {
        this.itemMaxLengthValue = this.itemMaxLength
            ? this.itemMaxLength
            : ConfigurationService.getConfiguration().configuration.supportedBrowserMaxLengthValue;
    }

    onAddEntry(newEntry: string) {
        this.addEntry.emit(newEntry);

        // Reset input field
        this.newEntryText = '';
    }

    // Refocus input field
    focusInput() {
        setTimeout(() => {
            this.renderer.selectRootElement('#addEntryInput').focus();
        }, 0);
    }

    onEditEntry(itemId: string, updatedEntry: string) {
        const updateBody = {
            updatedObjectId: itemId,
            updatedFieldValue: updatedEntry
        };

        this.editEntry.emit(updateBody);
    }

    onCheckEntry(itemId: string) {
        this.checkEntry.emit(itemId);
    }

    onDeleteEntry(itemId: string) {
        this.deleteEntry.emit(itemId);
    }
}
