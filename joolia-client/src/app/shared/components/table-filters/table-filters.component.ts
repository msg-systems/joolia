import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TableFilter } from '../../../core/models';
import { FormControl, FormGroup } from '@angular/forms';
import { pickBy } from 'lodash-es';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';

@Component({
    selector: 'table-filters',
    templateUrl: './table-filters.component.html',
    styleUrls: ['./table-filters.component.scss']
})
export class TableFiltersComponent implements OnChanges {
    @Input() filters: TableFilter[];
    @Input() mutuallyExclusiveFilters: string[] = [];
    @Output() filtersChanged: EventEmitter<any> = new EventEmitter();

    filtersForm: FormGroup;
    filteredLists: { [key: string]: Observable<string[]> } = {};

    constructor() {}

    ngOnChanges(): void {
        this.filtersForm = new FormGroup({});
        this.filters.forEach((f: TableFilter) => {
            const ctrl = new FormControl(f.value || '');
            this.filtersForm.addControl(f.key, ctrl);
            if (f.valueList) {
                this.filteredLists[f.key] = ctrl.valueChanges.pipe(
                    startWith(''),
                    map((value: string) => {
                        return value ? this.filterList(f.valueList, value) : f.valueList.slice();
                    })
                );
            }
        });
        this.filtersForm.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(() => this.onFiltersChanged());
    }

    onFiltersChanged() {
        // remove falsy attributes
        const value = pickBy(this.filtersForm.value);

        let enabledFilter = '';
        // if the filter changed is one of the mutually exclusive filters, every other filter in this list
        // must be disabled; when the filter is emptied everything must be enabled again
        this.mutuallyExclusiveFilters.forEach((key) => {
            if (value.hasOwnProperty(key)) {
                enabledFilter = key;
            }
        });
        this.mutuallyExclusiveFilters.forEach((key) => {
            if (enabledFilter === '') {
                this.filtersForm.get(key).enable({ emitEvent: false });
            } else if (key !== enabledFilter) {
                this.filtersForm.get(key).disable({ emitEvent: false });
            }
        });

        this.filtersChanged.emit(value);
    }

    clearFilters() {
        const value = {};
        this.filters.forEach((f) => (value[f.key] = null));
        this.filtersForm.setValue(value);
    }

    clearFilter(key: string) {
        this.filtersForm.patchValue({ [key]: null });
    }

    private filterList(list: string[], value: string): string[] {
        return list.filter((el: string) => el.toLowerCase().indexOf(value.toLowerCase()) === 0);
    }
}
