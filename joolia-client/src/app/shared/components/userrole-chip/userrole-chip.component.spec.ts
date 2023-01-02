import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UserroleChipComponent } from './userrole-chip.component';
import { UserRole } from '../../../core/models';

describe('UserroleChipComponent', () => {
    let component: UserroleChipComponent;
    let fixture: ComponentFixture<UserroleChipComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UserroleChipComponent],
            imports: [TranslateModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserroleChipComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should update chip', () => {
        const updateSpy = spyOn(component, 'updateChip').and.callThrough();
        component.ngOnInit();
        expect(updateSpy).toHaveBeenCalled();
    });

    it('ngOnChanges should update chip', () => {
        const updateSpy = spyOn(component, 'updateChip').and.callThrough();
        component.ngOnInit();
        expect(updateSpy).toHaveBeenCalled();
    });

    describe('ngOnInit', () => {
        it('should update chip for organizer', () => {
            component.userRole = UserRole.ORGANIZER;
            component.updateChip();
            expect(component.label).toMatch(/organizer$/);
            expect(component.highlighted).toEqual(true);
        });

        it('should update chip for admin', () => {
            component.userRole = UserRole.ADMIN;
            component.updateChip();
            expect(component.label).toMatch(/admin$/);
            expect(component.highlighted).toEqual(true);
        });

        it('should update chip for participant', () => {
            component.userRole = UserRole.PARTICIPANT;
            component.updateChip();
            expect(component.label).toMatch(/participant$/);
            expect(component.highlighted).toEqual(false);
        });
    });
});
