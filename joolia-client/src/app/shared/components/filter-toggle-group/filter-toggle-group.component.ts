import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FilterToggleGroupItem } from '../../../core/models';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
    selector: 'filter-toggle-group',
    templateUrl: './filter-toggle-group.component.html',
    styleUrls: ['./filter-toggle-group.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FilterToggleGroupComponent implements OnInit {
    @Input() filterCriteriaList: Array<FilterToggleGroupItem[]>;
    @Input() initialFilters: Array<any[]> = null;
    @Output() filterChanged: EventEmitter<any[]> = new EventEmitter();

    selectedFilter: Array<any[]>;

    constructor() {}

    ngOnInit(): void {
        if (this.initialFilters) {
            this.selectedFilter = this.initialFilters;
        } else {
            this.selectedFilter = this.filterCriteriaList.map(() => []);
        }
    }

    allOrClearButtonClicked() {
        if (this.areFiltersSelected()) {
            this.selectedFilter = this.filterCriteriaList.map(() => []);
        } else {
            this.selectedFilter = this.filterCriteriaList.map((criteriaValues) => criteriaValues.map((item) => item.value));
        }

        this.filterChanged.emit(this.selectedFilter);
    }

    onFilterChange(toggledButton: MatButtonToggleChange, index: number) {
        this.selectedFilter[index] = toggledButton.value;
        this.filterChanged.emit(this.selectedFilter);
    }

    areFiltersSelected(): boolean {
        return this.selectedFilter.some((criteriaValues) => criteriaValues.length > 0);
    }
}
