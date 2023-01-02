import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MeetingStartComponent } from './meeting-start.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MeetingStartComponent', () => {
    let component: MeetingStartComponent;
    let fixture: ComponentFixture<MeetingStartComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MeetingStartComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingStartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start meeting', () => {
        const startSpy = spyOn(component.startMeetingClicked, 'emit').and.callThrough();
        component.startMeeting();
        expect(startSpy).toHaveBeenCalled();
    });
});
