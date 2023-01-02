import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FilterToggleGroupComponent } from './filter-toggle-group.component';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

const filter1 = [
    {
        value: 'filter1_value1',
        label: '',
        icon: ''
    },
    {
        value: 'filter1_value2',
        label: '',
        icon: ''
    }
];

const filter2 = [
    {
        value: 'filter2_value1',
        label: '',
        icon: ''
    },
    {
        value: 'filter2_value2',
        label: '',
        icon: ''
    }
];

const filterList = [filter1, filter2];

describe('FilterToggleGroupComponent', () => {
    let component: FilterToggleGroupComponent;
    let fixture: ComponentFixture<FilterToggleGroupComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FilterToggleGroupComponent],
            imports: [TranslateModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FilterToggleGroupComponent);
        component = fixture.componentInstance;
        component.filterCriteriaList = filterList;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should initialize filters with no filter set', () => {
            component.ngOnInit();
            expect(component.selectedFilter.length).toEqual(filterList.length);
            component.selectedFilter.forEach((filter) => expect(filter.length).toEqual(0));
        });

        it('should initialize filters with filters set', () => {
            const initialFilters = [[filter1[0].value], [filter2[1].value]];
            component.filterCriteriaList = filterList;
            component.initialFilters = initialFilters;
            component.ngOnInit();
            expect(component.selectedFilter).toEqual(initialFilters);
        });
    });

    describe('allOrClearButtonClicked', () => {
        beforeEach(() => {
            component.ngOnInit();
            spyOn(component.filterChanged, 'emit');
        });

        it('should set all filters and emit filterChanged-Event', () => {
            component.allOrClearButtonClicked();
            component.selectedFilter.forEach((filter, i) => expect(filter.length).toEqual(filterList[i].length));
            expect(component.filterChanged.emit).toHaveBeenCalledWith(component.selectedFilter);
        });

        it('should clearFilters and emit filterChanged-Event', () => {
            component.selectedFilter[0].push(filter1[0].value);
            component.allOrClearButtonClicked();
            component.selectedFilter.forEach((filter, i) => expect(filter.length).toEqual(0));
            expect(component.filterChanged.emit).toHaveBeenCalledWith(component.selectedFilter);
        });
    });

    it('should update filter and emit filterChanged', () => {
        component.ngOnInit();
        const filterSpy = spyOn(component.filterChanged, 'emit').and.callThrough();
        const toggledButtonChange: MatButtonToggleChange = { value: [filter2[1].value], source: null };
        component.onFilterChange(toggledButtonChange, 1);
        expect(component.selectedFilter[1]).toEqual(toggledButtonChange.value);
        expect(filterSpy).toHaveBeenCalledWith(component.selectedFilter);
    });

    describe('areFiltersSelected', () => {
        it('should return false', () => {
            component.ngOnInit();
            expect(component.areFiltersSelected()).toEqual(false);
        });

        it('should return true', () => {
            component.initialFilters = [[filter1[0].value], []];
            component.ngOnInit();
            expect(component.areFiltersSelected()).toEqual(true);
        });
    });
});
