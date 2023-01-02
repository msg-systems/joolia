import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { CanvasSubmissionToolbarComponent } from './canvas-submission-toolbar.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

describe('CanvasSubmissionToolbarComponent', () => {
    let component: CanvasSubmissionToolbarComponent;
    let fixture: ComponentFixture<CanvasSubmissionToolbarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MatMenuModule],
            declarations: [CanvasSubmissionToolbarComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CanvasSubmissionToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit delete event', () => {
        const deleteSpy = spyOn(component.deleted, 'emit').and.callThrough();
        component.onDelete();
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('should emit colorPicked event', () => {
        const colorPicked = spyOn(component.colorPicked, 'emit').and.callThrough();
        component.colorPickerController.setValueFrom('rgba(144, 144, 0, 0.5');
        expect(colorPicked).toHaveBeenCalled();
    });

    it('should emit voteClicked event', () => {
        const voteClicked = spyOn(component.toggleVote, 'emit').and.callThrough();
        component.onVoteClicked();
        expect(voteClicked).toHaveBeenCalled();
    });
});
