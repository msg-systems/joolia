import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamSubmissionsComponent } from './team-submissions.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SubmissionService, SnackbarService } from 'src/app/core/services';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/core/components';
import { SubmissionServiceStub, DialogStub, TranslateServiceStub, getMockData } from '../../../../testing/unitTest';

const translateServiceStub = new TranslateServiceStub();
const submissionServiceStub = new SubmissionServiceStub();
const dialogStub = new DialogStub({ confirmation: true });

let mockTeam1;
let mockFormat1;
let mockSubmissionList1;
let mockActivity1;
let mockPhase1;

describe('TeamSubmissionsComponent', () => {
    let component: TeamSubmissionsComponent;
    let fixture: ComponentFixture<TeamSubmissionsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MaterialModule],
            declarations: [TeamSubmissionsComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: SubmissionService, useValue: submissionServiceStub },
                { provide: Router, useValue: {} },
                { provide: MatDialog, useValue: dialogStub },
                { provide: SnackbarService, useValue: {} },
                { provide: TranslateService, useValue: translateServiceStub }
            ]
        }).compileComponents();

        mockTeam1 = getMockData('team.team1');
        mockFormat1 = getMockData('format.format1');
        mockSubmissionList1 = getMockData('submission.list.list1');
        mockActivity1 = getMockData('activity.activity1');
        mockPhase1 = getMockData('phase.phase1');

        fixture = TestBed.createComponent(TeamSubmissionsComponent);
        component = fixture.componentInstance;
        component.team = mockTeam1;
        component.format = mockFormat1;
        component.submissionList = mockSubmissionList1;
        fixture.detectChanges();

        translateServiceStub._resetStubCalls();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.submissionList.count).toEqual(1);
        expect(component.submissionList.entities.length).toEqual(1);
    });

    it('should delete row item', () => {
        component.submissionList.entities[0].activity = mockActivity1;
        component.submissionList.entities[0].activity.phase = mockPhase1;
        component.onSubmissionDelete(component.submissionList.entities[0].id);
        expect(component.submissionList.count).toBe(0);
    });
});
