import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { UploadFile } from 'ngx-uploader';
import {
    AuthenticationServiceStub,
    ConfigurationServiceStub,
    CookieServiceStub,
    FileServiceStub,
    FormatServiceStub,
    getMockData,
    LoggerServiceStub,
    TranslateServiceStub,
    UserServiceStub
} from '../../../testing/unitTest';
import { FileMeta, List, Team, User } from '../models';
import { AuthenticationService } from './authentication.service';
import { ConfigurationService } from './configuration.service';
import { FileService } from './file.service';
import { FormatService } from './format.service';
import { LoggerService } from './logger.service';
import { TeamService } from './team.service';
import { UserService } from './user.service';
import createSpyObj = jasmine.createSpyObj;

const configurationServiceStub = new ConfigurationServiceStub();
const authenticationServiceStub = new AuthenticationServiceStub();
const fileServiceStub = new FileServiceStub();
const formatServiceStub = new FormatServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const userServiceStub = new UserServiceStub();
const translateServiceStub = new TranslateServiceStub();
const snackbarStub = {
    open() {}
};

let mockFormat1;
let mockTeam;
let mockFileSet1;
let mockUsers;
let mockUserLuke;

describe('TeamService', () => {
    let service: TeamService;
    let httpMock: HttpTestingController;

    mockUserLuke = getMockData('user.luke');

    const cookieServiceStub = new CookieServiceStub({ token: '{"userId": "' + mockUserLuke.id + '"}' });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                TeamService,
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: FormatService, useValue: formatServiceStub },
                { provide: FileService, useValue: fileServiceStub },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
                { provide: CookieService, useValue: cookieServiceStub },
                { provide: TranslateService, useValue: translateServiceStub },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: MatSnackBar, useValue: snackbarStub },
                { provide: UserService, useValue: userServiceStub }
            ]
        });
        service = TestBed.inject(TeamService);
        httpMock = TestBed.inject(HttpTestingController);

        formatServiceStub._resetStubCalls();
        fileServiceStub._resetStubCalls();
        translateServiceStub._resetStubCalls();

        mockFormat1 = getMockData('format.format1');
        mockTeam = getMockData('team.team1');
        mockFileSet1 = getMockData('file.set.set1');
        mockUsers = getMockData('user');
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    describe('Team', () => {
        beforeEach(() => {
            service.loadTeam(mockTeam.id).subscribe();
            const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team/${mockTeam.id}`);
            req.flush(mockTeam);
            httpMock.verify();
        });

        describe('loadTeamAvatarMeta', () => {
            it('should load avatar', fakeAsync(() => {
                service.loadTeamAvatarMeta(mockTeam.id);
                expect(fileServiceStub._loadAvatarMetaCalls.length).toBe(1);
            }));
        });

        describe('loadTeams', () => {
            it('should load teams', fakeAsync(() => {
                service.loadTeams(mockFormat1.id).subscribe();
                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team`);
                expect(req.request.method).toBe('GET');
                httpMock.verify();
            }));
        });

        describe('loadTeam', () => {
            it('should load single team', fakeAsync(() => {
                service.loadTeams(mockFormat1.id).subscribe();
                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team`);
                expect(req.request.method).toBe('GET');
                httpMock.verify();
            }));
        });

        describe('createTeam', () => {
            it('should create a team', fakeAsync(() => {
                service.createTeam(mockFormat1.id, mockTeam).subscribe();
                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team`);
                expect(req.request.method).toBe('POST');
                req.flush(mockTeam);
                httpMock.verify();
            }));
        });

        describe('updateTeam', () => {
            it('should update a team', fakeAsync(() => {
                const mockTeamUpdate = { name: 'New name', id: mockTeam.id };

                const nextSpy = spyOn(service.teamChanged, 'next').and.callThrough();

                service.teamChanged.subscribe((t: Team) => {
                    expect(t.name).toEqual('New name');
                });

                service.updateTeam(mockFormat1.id, mockTeam.id, mockTeamUpdate).subscribe();

                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team/${mockTeam.id}`);
                expect(req.request.method).toBe('PUT');
                req.flush(mockTeamUpdate);
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));
        });

        describe('deleteTeam', () => {
            it('should delete a team', fakeAsync(() => {
                const nextSpyList = spyOn(service.teamListChanged, 'next').and.callThrough();

                service.teamListChanged.subscribe((list: List<Team>) => {
                    expect(list).not.toContain(mockTeam);
                });

                service.deleteTeam(mockFormat1.id, mockTeam.id).subscribe();
                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team/${mockTeam.id}`);
                expect(req.request.method).toBe('DELETE');
                req.flush({});
                httpMock.verify();

                expect(nextSpyList).toHaveBeenCalled();
            }));
        });

        describe('getPossibleNewMembersForTeam', () => {
            it('should get possible team members', fakeAsync(() => {
                service.getPossibleNewMembersForTeam(mockFormat1.id, mockTeam.id).subscribe();
                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team/${mockTeam.id}/availableNewMembers`);
                expect(req.request.method).toBe('GET');
                httpMock.verify();
            }));
        });

        describe('getPossibleTeams', () => {
            it('should get possible teams to add member to', fakeAsync(() => {
                service.getPossibleTeamsToAddTo(mockFormat1.id, mockUsers.leia.id).subscribe();
                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/usersAvailableTeams/${mockUsers.leia.id}`);
                expect(req.request.method).toBe('GET');
                httpMock.verify();
            }));
        });

        describe('addTeamMembers', () => {
            it('add member and check sorting', fakeAsync(() => {
                const nextSpy = spyOn(service.teamChanged, 'next').and.callThrough();

                service.teamChanged.subscribe((team) => {
                    expect(team.members).toEqual(
                        team.members.sort((a: User, b: User) => {
                            return a.name.localeCompare(b.name);
                        })
                    );
                });

                service.addTeamMembers(mockFormat1.id, mockTeam.id, [mockUsers]).subscribe();

                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team/${mockTeam.id}`);
                expect(req.request.method).toBe('PATCH');
                req.flush(mockUsers);
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));
        });

        describe('removeTeamMember', () => {
            it('should remove member', fakeAsync(() => {
                const nextSpy = spyOn(service.teamChanged, 'next').and.callThrough();

                const memberToRemove = mockTeam.members[0] as User;

                service.teamChanged.subscribe((team) => {
                    expect(team.members).not.toContain(memberToRemove);
                });

                service.removeTeamMember(mockFormat1.id, mockTeam.id, memberToRemove.email).subscribe();

                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team/${mockTeam.id}/_delete`);
                expect(req.request.method).toBe('POST');
                req.flush(memberToRemove);
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));
        });

        describe('avatar', () => {
            it('should loadTeamAvatarMeta', fakeAsync(() => {
                service.loadTeamAvatarMeta('123').subscribe();
                const parent = `/format/${mockFormat1.id}/team/123`;
                expect(fileServiceStub._toHaveBeenCalledWith('loadAvatarMeta', [parent, undefined])).toEqual(true);
            }));

            xit('onTeamAvatarUploadOutput', () => {
                console.log('to be implemented');
            });
        });

        describe('files', () => {
            beforeEach(() => {
                service.loadTeam('123').subscribe();
                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/team/123`);
                req.flush(mockTeam);
                httpMock.verify();
            });

            it('should loadTeamFilesMeta', fakeAsync(() => {
                service.loadTeamFilesMeta().subscribe();
                const parent = `/format/${mockFormat1.id}/team/${mockTeam.id}`;
                expect(fileServiceStub._toHaveBeenCalledWith('loadFilesMeta', [parent, undefined])).toEqual(true);
            }));

            it('should getDownloadLink', fakeAsync(() => {
                const team = service.getCurrentTeam();
                const fileId = mockFileSet1[0].id;

                team.files = mockFileSet1;
                delete team.files[0].downloadUrl;
                service.getDownloadLink(fileId, true);

                const parent = `/format/${mockFormat1.id}/team/${mockTeam.id}`;
                expect(fileServiceStub._toHaveBeenCalledWith('getDownloadFileMeta', [parent, fileId, { download: true }])).toEqual(true);
                expect(team.files[0].downloadUrl).toBe('testFileUrl');
            }));

            describe('deleteFile', () => {
                let ngxUS;
                beforeEach(() => {
                    ngxUS = createSpyObj('NgxUploadService', ['abortFileUpload']);
                    const team = service.getCurrentTeam();
                    team.files = mockFileSet1;
                    fileServiceStub._resetStubCalls();
                });

                it('should abort upload if file is not uploaded yet', fakeAsync(() => {
                    const team = service.getCurrentTeam();
                    const fileToDelete = team.files[0];
                    fileToDelete.upload = <UploadFile>{};

                    service.deleteFile(ngxUS, fileToDelete.id);

                    expect(fileServiceStub._deleteFileCalls.length).toEqual(1);
                    expect(ngxUS.abortFileUpload).toHaveBeenCalledWith(fileToDelete);
                    const file = team.files.find((f: FileMeta) => f.id === fileToDelete.id);
                    expect(file).toBeUndefined();
                }));

                it('should delete file from database', fakeAsync(() => {
                    const team = service.getCurrentTeam();
                    const fileId = mockFileSet1[0].id;

                    const nextSpy = spyOn(service.teamChanged, 'next').and.callThrough();

                    service.teamChanged.subscribe((updatedTeam: Team) => {
                        const file = updatedTeam.files.find((f: FileMeta) => f.id === fileId);
                        expect(file).toBeUndefined();
                    });

                    service.deleteFile(ngxUS, fileId).subscribe();

                    const parent = `/format/${mockFormat1.id}/team/${team.id}`;
                    expect(fileServiceStub._toHaveBeenCalledWith('deleteFile', [parent, fileId])).toEqual(true);

                    expect(nextSpy).toHaveBeenCalled();
                }));
            });

            xit('onTeamAvatarUploadOutput', () => {
                console.log('to be implemented');
            });
        });
    });
});
