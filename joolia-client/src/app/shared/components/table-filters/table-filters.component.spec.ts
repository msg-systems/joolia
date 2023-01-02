import { TestBed, async, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { MaterialModule } from '../../../core/components';
import { TranslateModule } from '@ngx-translate/core';
import { TableFiltersComponent } from './table-filters.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigurationService } from '../../../core/services';
import { FormGroup } from '@angular/forms';
import { TableFilter } from '../../../core/models';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { cloneDeep } from 'lodash-es';

describe('TableFiltersComponent', () => {
    let component: TableFiltersComponent;
    let fixture: ComponentFixture<TableFiltersComponent>;
    const filtersConfig = ConfigurationService.getConfiguration().configuration.tableConfigs.formatSubmissions.filters;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TableFiltersComponent],
            imports: [MaterialModule, NoopAnimationsModule, TranslateModule.forRoot()],
            providers: [],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TableFiltersComponent);
        component = fixture.componentInstance;
        component.filters = filtersConfig;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize filters form', () => {
        component.ngOnChanges();
        const form = component.filtersForm;
        expect(form instanceof FormGroup).toBeTruthy();
        filtersConfig.forEach((filter: TableFilter) => {
            expect(form.contains(filter.key));
        });
    });

    describe('without autocompletion', () => {
        let submitterInput;

        beforeEach(() => {
            component.ngOnChanges();
            fixture.detectChanges();
            submitterInput = fixture.debugElement.nativeElement.querySelectorAll('input')[0];
        });

        it('should not display autocompletion options on focus', fakeAsync(() => {
            submitterInput.dispatchEvent(new Event('focus'));
            submitterInput.dispatchEvent(new Event('focusin'));

            fixture.detectChanges();

            const options = document.querySelectorAll('mat-option');
            expect(options.length).toBe(0);
        }));
    });

    describe('with autocompletion', () => {
        let submitterInput;
        let filtersConfigWithOptions;

        beforeEach(() => {
            filtersConfigWithOptions = cloneDeep(filtersConfig);
            filtersConfigWithOptions[0].valueList = ['Team 1', 'Team 2', 'Lena'];
            component.filters = filtersConfigWithOptions;
            component.ngOnChanges();
            fixture.detectChanges();
            submitterInput = fixture.debugElement.nativeElement.querySelectorAll('input')[0];
        });

        it('should display autocompletion options on focus', fakeAsync(() => {
            submitterInput.dispatchEvent(new Event('focus'));
            submitterInput.dispatchEvent(new Event('focusin'));

            fixture.detectChanges();

            const options = document.querySelectorAll('mat-option');
            expect(options.length).toBe(3);
        }));

        it('should filter options on input', fakeAsync(() => {
            submitterInput.dispatchEvent(new Event('focus'));
            submitterInput.dispatchEvent(new Event('focusin'));
            fixture.detectChanges();
            component.filtersForm.controls[filtersConfig[0].key].setValue('team');

            fixture.detectChanges();
            // changes of form are stalled by debounceTime for 1000ms, therefore tick(1000) is needed for all tests where form value changes
            tick(1000);
            fixture.detectChanges();

            const options = document.querySelectorAll('mat-option');
            expect(options.length).toBe(2);
        }));
    });

    describe('update filter values', () => {
        let spy: jasmine.Spy<any>;

        beforeEach(() => {
            spy = spyOn(component.filtersChanged, 'emit').and.callThrough();
        });

        it('should emit updated filter values', fakeAsync(() => {
            const values = {};
            component.ngOnChanges();
            filtersConfig.forEach((filter: TableFilter) => {
                component.filtersForm.controls[filter.key].setValue(filter.key);
                values[filter.key] = filter.key;
            });

            tick(1000);

            expect(spy).toHaveBeenCalledWith(jasmine.objectContaining(values));
        }));

        describe('update filters on clear', () => {
            beforeEach(fakeAsync(() => {
                const values = {};
                component.ngOnChanges();
                filtersConfig.forEach((filter: TableFilter) => {
                    component.filtersForm.controls[filter.key].setValue(filter.key);
                    values[filter.key] = filter.key;
                });
                tick(1000);
                fixture.detectChanges();
            }));

            it('should emit updated filter values after cleared filter', fakeAsync(() => {
                const icon = fixture.debugElement.nativeElement.querySelectorAll('mat-form-field')[0].querySelector('mat-icon');
                icon.click();

                tick(1000);

                expect(spy).toHaveBeenCalledWith(
                    jasmine.objectContaining({
                        [filtersConfig[1].key]: filtersConfig[1].key,
                        [filtersConfig[2].key]: filtersConfig[2].key
                    })
                );
            }));

            it('should emit updated filter values after clearing all filters', fakeAsync(() => {
                const button = fixture.debugElement.nativeElement.querySelector('button');
                button.click();

                tick(1000);

                expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({}));
            }));
        });
    });
});
