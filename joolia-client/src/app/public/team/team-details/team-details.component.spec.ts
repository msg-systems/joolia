import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamDetailsComponent } from './team-details.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormatService, LoggerService, NgxUploadService, TeamService, UserService, UtilService } from 'src/app/core/services';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import {
    DialogStub,
    FormatServiceStub,
    getMockData,
    LoggerServiceStub,
    NgxUploadServiceStub,
    TeamServiceStub,
    UserServiceStub
} from '../../../../testing/unitTest';
import { UploadOutput } from 'ngx-uploader';

const formatServiceStub = new FormatServiceStub();
const userServiceStub = new UserServiceStub();
const teamServiceStub = new TeamServiceStub();
const ngxUploadServiceStub = new NgxUploadServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const snackbarStub = {
    open() {}
};

// TODO: Adjust
const dialogStub = new DialogStub({
    users: [getMockData('user.anakin'), getMockData('user.george')]
});

const routeData = {
    params: of({}),
    snapshot: {
        params: {}
    }
};

let mockTeam1;
let mockFormat1;
let mockFileSet1;
let mockFile1;

describe('TeamDetailsComponent', () => {
    let component: TeamDetailsComponent;
    let fixture: ComponentFixture<TeamDetailsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TeamDetailsComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: FormatService, useValue: formatServiceStub },
                { provide: TeamService, useValue: teamServiceStub },
                { provide: MatDialog, useValue: dialogStub },
                { provide: Router, useValue: {} },
                { provide: MatSnackBar, useValue: snackbarStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: ActivatedRoute, useValue: routeData },
                { provide: NgxUploadService, useValue: ngxUploadServiceStub },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: UtilService, useValue: UtilService }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(TeamDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mockFormat1 = getMockData('format.format1');
        mockTeam1 = getMockData('team.team1');
        mockFileSet1 = getMockData('file.set.set1');
        mockFile1 = getMockData('file.file1');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.team.id).toEqual(mockTeam1.id);
        expect(component.format.id).toEqual(mockFormat1.id);
        expect(component.team.files.length).toEqual(mockFileSet1.length);
    });

    it('should invite new member', () => {
        component.initTeam(mockTeam1);
        component.onAddTeamMembers();
        expect(teamServiceStub.addedTeamMembers.length).toEqual(2);
    });

    it('should remove team member', () => {
        component.format = mockFormat1;

        component.initTeam(mockTeam1);
        component.onRemoveTeamMember(mockTeam1.members[0].id);
        fixture.detectChanges();
        expect(teamServiceStub.deletedTeamMembers.length).toEqual(1);
    });

    it('should delete team', () => {
        component.initTeam(mockTeam1);
        component.onDeleteTeam();
        expect(teamServiceStub.teamDeleted).toBeTruthy();
    });

    it('should update team', () => {
        component.initTeam(mockTeam1);
        component.onTeamUpdate('Updated name');
        expect(teamServiceStub.updatedTeamName).toEqual('Updated name');
    });

    it('should delete file', () => {
        component.onFileDelete(mockFile1.id);
        expect(teamServiceStub._toHaveBeenCalledWith('deleteFile', [ngxUploadServiceStub, mockFile1.id])).toEqual(true);
    });

    it('should get download link', () => {
        const options = { fileId: mockFile1.id, download: true };
        component.onFileDownloadClicked(options);
        expect(teamServiceStub._toHaveBeenCalledWith('getDownloadLink', [options])).toEqual(true);
    });

    it('should handle upload output', () => {
        const output = {} as UploadOutput;
        component.onUploadOutput(output);
        expect(teamServiceStub._toHaveBeenCalledWith('onUploadOutput', [ngxUploadServiceStub, output])).toEqual(true);
    });
});
