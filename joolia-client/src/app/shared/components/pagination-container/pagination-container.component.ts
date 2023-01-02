import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'pagination-container',
    templateUrl: './pagination-container.component.html',
    styleUrls: ['./pagination-container.component.scss']
})
export class PaginationContainerComponent {
    @Input() paginatorSizeOptions: number[];
    @Input() initialPaginatorSize: number;
    @Input() paginationLength: number;
    @Input() showLoadingSpinner: boolean;
    @Output() paginationChange: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

    constructor() {}

    onPaginationChange(event: PageEvent) {
        this.paginationChange.emit(event);
    }
}
