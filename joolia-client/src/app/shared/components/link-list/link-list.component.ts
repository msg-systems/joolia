import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LinkEntry } from '../../../core/models';

@Component({
    selector: 'link-list',
    templateUrl: './link-list.component.html',
    styleUrls: ['./link-list.component.scss']
})
export class LinkListComponent {
    @Input() links: LinkEntry[];
    @Input() editable = false;
    @Output() linkClicked: EventEmitter<string> = new EventEmitter();
    @Output() linkDeleteClicked: EventEmitter<number> = new EventEmitter();
    @Output() linkAddClicked: EventEmitter<void> = new EventEmitter();

    constructor() {}

    onLinkClick(linkUrl: string) {
        this.linkClicked.emit(linkUrl);
    }

    onLinkAddClicked() {
        this.linkAddClicked.emit();
    }

    onLinkDeleteClicked(position: number) {
        this.linkDeleteClicked.emit(position);
    }
}
