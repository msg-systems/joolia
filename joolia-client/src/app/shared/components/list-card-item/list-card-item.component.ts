import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Action, FileMeta, KeyVisual } from '../../../core/models';

/**
 * The ListCardItemComponent is a general card styled for a larger overview. On the lower right corner a menu is shown with specified
 * actions.
 */
@Component({
    selector: 'list-card-item',
    templateUrl: './list-card-item.component.html',
    styleUrls: ['./list-card-item.component.scss']
})
export class ListCardItemComponent {
    /**
     * itemId: Needed to identify which list item was clicked.
     */
    @Input() itemId: string;
    /**
     * menuActions: Actions in the menu. MUST have one parameter to identify which item was called. Always uses the specified itemId.
     */
    @Input() menuActions: Action[] = [];
    @Input() subContent = '';
    @Input() keyVisual: KeyVisual;
    @Input() showKeyVisual = false;
    @Input() showAvatar = false;
    @Input() user = null;
    @Input() clickable = false;
    @Input() showFooter = false;
    @Input() locked = false;
    @Input() showCheckbox = false;
    @Input() addCheckbox = false;
    @Output() itemClick: EventEmitter<void> = new EventEmitter();
    @Output() menuOpenClick: EventEmitter<string> = new EventEmitter();
    @Output() checkboxClick: EventEmitter<{ id: string; checked: boolean }> = new EventEmitter();

    constructor() {}

    onItemClick() {
        if (this.clickable) {
            this.itemClick.emit();
        }
    }

    onMenuOpenClick() {
        this.menuOpenClick.emit(this.itemId);
    }

    onCheckboxChanged(event: MatCheckboxChange) {
        this.checkboxClick.emit({ id: this.user.id, checked: event.checked });
    }
}
