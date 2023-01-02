import { Component } from '@angular/core';
import { ListCardItemComponent } from '../list-card-item/list-card-item.component';

/**
 * The ListRowItemComponent is a general list-row styled for a narrower overview. On the right side a menu is shown with specified
 * actions.
 */
@Component({
    selector: 'list-row-item',
    templateUrl: './list-row-item.component.html',
    styleUrls: ['./list-row-item.component.scss']
})
export class ListRowItemComponent extends ListCardItemComponent {
    /* Following content is inherited,
        as the component represents a different view for the same logic.

    @Input() itemId: string;
    @Input() menuActions: Action[] = [];
    @Input() subContent = '';
    @Input() keyVisual: KeyVisual;
    @Input() showKeyVisual = false;
    @Input() clickable = false;
    @Output() itemClick: EventEmitter<void> = new EventEmitter();
    @Output() menuOpenClick: EventEmitter<string> = new EventEmitter();

    constructor() {}

    onItemClick() {
        if (this.clickable) {
            this.itemClick.emit();
        }
    }

    onMenuOpenClick() {
        this.menuOpenClick.emit(this.itemId);
    } */
}
