import { ClipboardModule } from '@angular/cdk/clipboard';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'ngx-moment';
import { MaterialModule } from 'src/app/core/components';
import { MomentPipe } from '../../pipes';

import { MeetingJoinDialogComponent } from './meeting-join-dialog.component';

describe('MeetingJoinDialogComponent', () => {
    let component: MeetingJoinDialogComponent;
    let fixture: ComponentFixture<MeetingJoinDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MaterialModule, ClipboardModule, MomentModule],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} }
            ],
            declarations: [MeetingJoinDialogComponent, MomentPipe]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingJoinDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
