import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigurationService } from '../../../core/services';
import { RatingComponent } from './rating.component';
import { DecimalProxyPipe } from '../../pipes/decimal-proxy.pipe';

describe('RatingComponent', () => {
    let component: RatingComponent;
    let fixture: ComponentFixture<RatingComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RatingComponent, DecimalProxyPipe],
            imports: [TranslateModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RatingComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.maxRating).toBe(ConfigurationService.getConfiguration().configuration.ranges.rating.to);
        expect(component.stars.length).toBe(component.maxRating);
    });

    describe('ngOnChanges', () => {
        it('should set 0 stars', () => {
            component.rating = 0;
            component.ngOnChanges();
            const emptyStars = component.stars.filter((star) => star.icon === 'star_border');
            const halfStars = component.stars.filter((star) => star.icon === 'star_half');
            const filledStars = component.stars.filter((star) => star.icon === 'star');
            expect(emptyStars.length).toBe(5);
            expect(halfStars.length).toBe(0);
            expect(filledStars.length).toBe(0);
        });

        it('should set 2.5 stars', () => {
            component.rating = 2.5;
            component.ngOnChanges();
            const emptyStars = component.stars.filter((star) => star.icon === 'star_border');
            const halfStars = component.stars.filter((star) => star.icon === 'star_half');
            const filledStars = component.stars.filter((star) => star.icon === 'star');
            expect(emptyStars.length).toBe(2);
            expect(halfStars.length).toBe(1);
            expect(filledStars.length).toBe(2);
        });
    });

    describe('onClick', () => {
        it('should do nothing if not editable', () => {
            const emitSpy = spyOn(component.ratingUpdated, 'emit').and.callThrough();
            component.editable = false;
            component.onClick(5);
            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('should emit updated rating', () => {
            const emitSpy = spyOn(component.ratingUpdated, 'emit').and.callThrough();
            component.editable = true;
            component.onClick(5);
            expect(emitSpy).toHaveBeenCalledWith(5);
        });
    });

    describe('onMouseover', () => {
        beforeEach(() => {
            component.rating = 0;
            component.ngOnChanges();
        });

        it('should do nothing if not editable', () => {
            component.onMouseover(2.5);
            const emptyStars = component.stars.filter((star) => star.icon === 'star_border');
            const halfStars = component.stars.filter((star) => star.icon === 'star_half');
            const filledStars = component.stars.filter((star) => star.icon === 'star');
            expect(emptyStars.length).toBe(5);
            expect(halfStars.length).toBe(0);
            expect(filledStars.length).toBe(0);
        });

        it('should display the selected rating', () => {
            component.editable = true;
            component.onMouseover(2.5);
            const emptyStars = component.stars.filter((star) => star.icon === 'star_border');
            const halfStars = component.stars.filter((star) => star.icon === 'star_half');
            const filledStars = component.stars.filter((star) => star.icon === 'star');
            expect(emptyStars.length).toBe(2);
            expect(halfStars.length).toBe(1);
            expect(filledStars.length).toBe(2);
        });
    });

    describe('onMouseleave', () => {
        it('should display the actual value', () => {
            component.editable = true;
            component.rating = 5;
            component.ngOnChanges();
            component.onMouseover(2.5);
            component.onMouseleave();
            const emptyStars = component.stars.filter((star) => star.icon === 'star_border');
            const halfStars = component.stars.filter((star) => star.icon === 'star_half');
            const filledStars = component.stars.filter((star) => star.icon === 'star');
            expect(emptyStars.length).toBe(0);
            expect(halfStars.length).toBe(0);
            expect(filledStars.length).toBe(5);
        });
    });
});
