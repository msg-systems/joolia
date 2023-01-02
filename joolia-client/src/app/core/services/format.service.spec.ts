import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { FormatService } from './format.service';
import { FileService } from './file.service';
import {
    AuthorizationServiceStub,
    ConfigurationServiceStub,
    FileServiceStub,
    getMockData,
    LoggerServiceStub,
    ReferenceResolverServiceStub,
    SnackbarServiceStub,
    TranslateServiceStub,
    UserServiceStub
} from '../../../testing/unitTest';
import { UserService } from './user.service';
import { AuthorizationService } from './authorization.service';
import { ConfigurationService } from './configuration.service';
import { TranslateService } from '@ngx-translate/core';
import { IQueryParams } from './util.service';
import { Permission, UserRole } from '../models';
import { assign } from 'lodash-es';
import { LoggerService } from './logger.service';
import { SnackbarService } from './snackbar.service';
import { ReferenceResolverService } from './reference-resolver.service';
import { FormatMember } from '../models/format-member.model';

const fileServiceStub = new FileServiceStub();
const userServiceStub = new UserServiceStub();
const authorizationServiceStub = new AuthorizationServiceStub();
const configurationServicesStub = new ConfigurationServiceStub();
const translationServiceStub = new TranslateServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const snackbarServiceStub = new SnackbarServiceStub();
const referenceResolverServiceStub = new ReferenceResolverServiceStub();

let mockFormats;
let mockFormat1;
let mockFormat2;
let mockTeam;
let mockUserShaak;
let mockUserLuke;
let mockUserLeia;

describe('FormatService', () => {
    let service: FormatService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                FormatService,
                { provide: FileService, useValue: fileServiceStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: AuthorizationService, useValue: authorizationServiceStub },
                { provide: ConfigurationService, useValue: configurationServicesStub },
                { provide: TranslateService, useValue: translationServiceStub },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: SnackbarService, useValue: snackbarServiceStub },
                { provide: ReferenceResolverService, useValue: referenceResolverServiceStub }
            ]
        });

        service = TestBed.inject(FormatService);
        httpMock = TestBed.inject(HttpTestingController);
        fileServiceStub._resetStubCalls();
        userServiceStub._resetStubCalls();
        translationServiceStub._resetStubCalls();

        mockFormats = getMockData('format.list.list1');
        mockFormat1 = getMockData('format.format1');
        mockFormat2 = getMockData('format.format2');
        mockTeam = getMockData('team.team1');
        mockUserShaak = getMockData('user.shaak');
        mockUserLuke = getMockData('user.luke');
        mockUserLeia = getMockData('user.leia');
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    describe('hasPermission', () => {
        it('should check the permissions', () => {
            expect(service.hasPermission(Permission.DELETE_FORMAT, mockFormat1)).toBe(true);
        });
    });

    describe('Create:', () => {
        describe('createFormat', () => {
            it('should create the format', fakeAsync(() => {
                const body = {
                    name: mockFormat1.name,
                    workspace: mockFormat1.workspace.id
                };

                service.createFormat(body).subscribe((newFormat) => {
                    expect(newFormat.id).toBe('291a62c1-a668-47e2-bebe-b896b30ddd84');
                });

                const req = httpMock.expectOne(`https://api.joolia.net/format`);
                expect(req.request.method).toBe('POST');
                req.flush(assign({ id: '291a62c1-a668-47e2-bebe-b896b30ddd84' }, body));
                httpMock.verify();
            }));
        });

        describe('createFormatFromTemplate', () => {
            it('should create a format by using a format template', fakeAsync(() => {
                const body = {
                    name: mockFormat1.name,
                    workspace: mockFormat1.workspace.id
                };

                service
                    .createFormatFromTemplate('d99ac454-edb3-42b1-822a-bde5a4dcf36e', '722297d5-74bd-4ae2-a8b6-c4037d2ead74')
                    .subscribe((newFormat) => {
                        expect(newFormat.id).toBe('aeefe93d-bc09-4b08-b55d-027dfda3dd8f');
                    });

                const req = httpMock.expectOne(`https://api.joolia.net/format/_template`);
                expect(req.request.method).toBe('POST');
                expect(req.request.body).toEqual({
                    formatTemplateId: 'd99ac454-edb3-42b1-822a-bde5a4dcf36e',
                    workspaceId: '722297d5-74bd-4ae2-a8b6-c4037d2ead74'
                });
                req.flush(assign({ id: 'aeefe93d-bc09-4b08-b55d-027dfda3dd8f' }, body));
                httpMock.verify();
            }));
        });
    });

    describe('Load:', () => {
        describe('format', () => {
            it('load one format', fakeAsync(() => {
                const nextSpy = spyOn(service.formatChanged, 'next').and.callThrough();

                const sub = service.formatChanged.subscribe((l) => {
                    expect(l).toEqual(mockFormat1);
                });

                service.loadFormat(mockFormat1.id).subscribe();
                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}`);
                req.flush(mockFormat1);
                httpMock.verify();

                sub.unsubscribe();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should return the loaded format', fakeAsync(() => {
                service.loadFormat(mockFormat1.id).subscribe();
                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}`);
                req.flush(mockFormat1);
                httpMock.verify();
                expect(service.getCurrentFormat()).toEqual(mockFormat1);
            }));
        });

        describe('formats', () => {
            it('should load the formats', fakeAsync(() => {
                const nextSpy = spyOn(service.formatListChanged, 'next').and.callThrough();

                const sub = service.formatListChanged.subscribe((l) => {
                    expect(l).toEqual(mockFormats);
                    expect(l.count).toBe(1);
                });

                service.loadFormats().subscribe();
                const req = httpMock.expectOne(`https://api.joolia.net/format`);
                req.flush(mockFormats);
                httpMock.verify();

                sub.unsubscribe();

                expect(nextSpy).toHaveBeenCalled();
            }));

            it('should load the ids of formats', fakeAsync(() => {
                const queryParams: IQueryParams = {
                    select: 'id'
                };

                service.loadFormats(queryParams).subscribe();
                const req = httpMock.expectOne(`https://api.joolia.net/format?select%5B%5D=id`);
                req.flush(mockFormats);
                httpMock.verify();
            }));

            it('should load more formats', fakeAsync(() => {
                service.loadFormats().subscribe();
                const req1 = httpMock.expectOne(`https://api.joolia.net/format`);
                req1.flush(mockFormats);
                httpMock.verify();

                const nextSpy = spyOn(service.formatListChanged, 'next').and.callThrough();

                const sub = service.formatListChanged.subscribe((l) => {
                    expect(l.entities.length).toBe(2);
                });

                // Loading more formats
                service.loadFormats({}, true).subscribe();
                const req2 = httpMock.expectOne(`https://api.joolia.net/format`);
                req2.flush(mockFormats);
                httpMock.verify();

                sub.unsubscribe();
                expect(nextSpy).toHaveBeenCalled();
            }));
        });

        xdescribe('WorkspaceFormats', () => {
            it('should load formats of workspace', () => {
                console.log('to implement');
            });
        });
    });

    describe('Edit:', () => {
        describe('patchFormat', () => {
            beforeEach(() => {
                // load specific format
                service.loadFormat(mockFormat1.id).subscribe();
                let req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}`);
                req.flush({ ...mockFormat1 });
                httpMock.verify();

                // load multiple formats
                service.loadFormats().subscribe();
                req = httpMock.expectOne(`https://api.joolia.net/format`);
                req.flush({ ...mockFormats });
                httpMock.verify();
            });

            it('should change the name of the format', fakeAsync(() => {
                const newFormat = mockFormat1;
                newFormat.name = 'Format Name after change';

                service.patchFormat('f8f73c8f-1e09-4cf6-b075-e88ad0b9c04b', newFormat).subscribe(() => {
                    expect(service.getCurrentFormat().name).toBe(newFormat.name);
                });

                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}`);
                expect(req.request.method).toBe('PATCH');
                req.flush(assign({ name: 'Format Name after change' }, req.request.body));
                httpMock.verify();
            }));

            it('should change the name of the format when removed', fakeAsync(() => {
                const newFormat = mockFormat1;
                newFormat.name = '';

                service.patchFormat('f8f73c8f-1e09-4cf6-b075-e88ad0b9c04b', newFormat).subscribe(() => {
                    expect(service.getCurrentFormat().name).toBe(newFormat.name);
                });

                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}`);
                expect(req.request.method).toBe('PATCH');
                expect(req.request.body.name).toBe('test translation');
                req.flush(assign({ name: 'test translation' }, req.request.body));
                httpMock.verify();
            }));
        });

        describe('deleteFormat', () => {
            beforeEach(() => {
                // load specific format
                service.loadFormat(mockFormat1.id).subscribe();
                let req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}`);
                req.flush({ ...mockFormat1 });
                httpMock.verify();

                // load multiple formats
                service.loadFormats().subscribe();
                req = httpMock.expectOne(`https://api.joolia.net/format`);
                req.flush({ ...mockFormats });
                httpMock.verify();
            });

            it('should delete a format from the formatList', fakeAsync(() => {
                const nextSpy = spyOn(service.formatListChanged, 'next').and.callThrough();

                service.formatListChanged.subscribe((formatList) => {
                    expect(formatList.count).toBe(mockFormats.count - 1);
                });

                service.deleteFormat(mockFormat1.id).subscribe();

                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}`);
                expect(req.request.method).toBe('DELETE');
                req.flush('');
                httpMock.verify();

                expect(nextSpy).toHaveBeenCalled();
            }));
        });
    });

    describe('Format Members:', () => {
        describe('load:', () => {
            beforeEach(() => {
                // load specific format
                service.loadFormat(mockFormat2.id).subscribe();
                httpMock.expectOne(() => true).flush(mockFormat2);
                httpMock.verify();
            });

            describe('loadFormatMembers', () => {
                it('should load format members for loaded format', fakeAsync(() => {
                    expect(service.getCurrentFormat().hasOwnProperty('members')).toBe(false);
                    expect(service.getCurrentFormat().memberCount).toBe(1);

                    const nextSpy = spyOn(service.formatChanged, 'next').and.callThrough();

                    const sub = service.formatChanged.subscribe((loadedFormat) => {
                        expect(loadedFormat.hasOwnProperty('members')).toBe(true);
                        expect(loadedFormat.memberCount).toBe(1);
                        expect(loadedFormat.members.count).toBe(1);
                        expect(loadedFormat.members.entities.length).toBe(1);
                    });

                    service.loadFormatMembers().subscribe();
                    const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat2.id}/member`);
                    req.flush(mockFormats);
                    httpMock.verify();

                    sub.unsubscribe();

                    expect(nextSpy).toHaveBeenCalled();
                }));

                it('should load more format members for loaded format', fakeAsync(() => {
                    // Initial format member loading
                    service.loadFormatMembers().subscribe();
                    const req1 = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat2.id}/member`);
                    req1.flush(mockFormats);
                    httpMock.verify();

                    const nextSpy = spyOn(service.formatChanged, 'next').and.callThrough();

                    const sub = service.formatChanged.subscribe((loadedFormat) => {
                        expect(loadedFormat.members.entities.length).toBe(2);
                    });

                    service.loadFormatMembers({}, true).subscribe();
                    const req2 = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat2.id}/member`);
                    req2.flush(mockFormats);
                    httpMock.verify();

                    sub.unsubscribe();

                    expect(nextSpy).toHaveBeenCalled();
                }));

                it('should load format member details', fakeAsync(() => {
                    const formatMemberLuke = {
                        id: mockUserLuke.id,
                        name: mockUserLuke.name,
                        email: mockUserLuke.email,
                        avatar: mockUserLuke.avatar,
                        company: mockUserLuke.company,
                        pending: false,
                        role: 'participant',
                        skills: mockUserLuke.skills,
                        teamCount: 0,
                        teams: []
                    } as FormatMember;
                    service.getUserDetails(mockUserLuke.id).subscribe();
                    const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat2.id}/member/${mockUserLuke.id}`);
                    expect(req.request.method).toBe('GET');
                    req.flush(formatMemberLuke);
                    httpMock.verify();
                }));
            });
        });

        describe('edit:', () => {
            describe('addFormatMember', () => {
                beforeEach(() => {
                    // load specific format
                    service.loadFormat(mockFormat1.id).subscribe();
                    httpMock.expectOne(() => true).flush(mockFormat1);
                    httpMock.verify();
                });

                it('should add an format member for a loaded format', fakeAsync(() => {
                    expect(service.getCurrentFormat().hasOwnProperty('members')).toBe(true);
                    expect(service.getCurrentFormat().memberCount).toBe(2);
                    service.addFormatMember(service.getCurrentFormat().id, [mockUserShaak.email], 'Welcome to this Format').subscribe();
                    const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/member`);
                    expect(req.request.method).toBe('PATCH');
                    expect(req.request.body).toEqual({
                        emails: [mockUserShaak.email],
                        invitationText: 'Welcome to this Format',
                        role: 'participant'
                    });

                    req.flush([mockUserShaak]);
                    httpMock.verify();
                }));
            });

            describe('removeFormatMember', () => {
                beforeEach(() => {
                    // load specific format
                    service.loadFormat(mockFormat1.id).subscribe();
                    httpMock.expectOne(() => true).flush(mockFormat1);
                    httpMock.verify();
                });

                it('should remove an format member from a loaded format', fakeAsync(() => {
                    expect(service.getCurrentFormat().hasOwnProperty('members')).toBe(true);
                    expect(service.getCurrentFormat().members.count).toBe(2);

                    const nextSpy = spyOn(service.formatChanged, 'next').and.callThrough();

                    const sub = service.formatChanged.subscribe((loadedFormat) => {
                        expect(loadedFormat.hasOwnProperty('members')).toBe(true);
                        expect(loadedFormat.memberCount).toBe(1);
                        expect(loadedFormat.members.count).toBe(1);
                        expect(loadedFormat.members.entities.length).toBe(1);
                        expect(loadedFormat.members.entities).not.toContain(mockUserLuke);
                    });

                    service.removeFormatMember(service.getCurrentFormat().id, mockUserLuke.email).subscribe();
                    const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/member/_delete`);
                    req.flush('');
                    expect(req.request.method).toBe('POST');
                    httpMock.verify();
                    sub.unsubscribe();

                    expect(nextSpy).toHaveBeenCalled();
                }));
            });

            describe('updateFormatMemberRole', () => {
                beforeEach(() => {
                    // load specific format
                    service.loadFormat(mockFormat1.id).subscribe();
                    httpMock.expectOne(() => true).flush(mockFormat1);
                    httpMock.verify();
                });

                it('should update role of member from participant to organizer', fakeAsync(() => {
                    const memberBefore = service.getCurrentFormat().members.entities.find((u) => u.id === mockUserLeia.id);
                    expect(memberBefore.role).toBe(UserRole.PARTICIPANT);

                    const nextSpy = spyOn(service.formatChanged, 'next').and.callThrough();

                    const sub = service.formatChanged.subscribe((loadedFormat) => {
                        const memberAfter = loadedFormat.members.entities.find((u) => u.id === mockUserLeia.id);
                        expect(memberAfter.role).toBe(UserRole.ORGANIZER);
                    });

                    service.updateFormatMemberRole(mockUserLeia.id, UserRole.ORGANIZER).subscribe();
                    const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat1.id}/member/${mockUserLeia.id}`);

                    expect(req.request.method).toBe('PATCH');
                    const responseUserLeia = mockUserLeia;
                    responseUserLeia.role = UserRole.ORGANIZER;
                    req.flush(responseUserLeia);

                    httpMock.verify();
                    sub.unsubscribe();

                    expect(nextSpy).toHaveBeenCalled();
                }));
            });
        });
    });

    describe('Files and Keyvisuals:', () => {
        xdescribe('loadFormatFilesMeta', () => {
            it('todo', () => {
                console.log('to be implemented');
            });
        });

        xdescribe('loadFormatFileMeta', () => {
            it('todo', () => {
                console.log('to be implemented');
            });
        });

        xdescribe('loadFormatKeyVisualMeta', () => {
            it('todo', () => {
                console.log('to be implemented');
            });
        });

        xdescribe('getDownloadLink', () => {
            it('todo', () => {
                console.log('to be implemented');
            });
        });

        xdescribe('deleteFile', () => {
            it('todo', () => {
                console.log('to be implemented');
            });
        });

        xdescribe('onUploadOutput', () => {
            it('todo', () => {
                console.log('to be implemented');
            });
        });

        xdescribe('onKeyVisualUploadOutput', () => {
            it('todo', () => {
                console.log('to be implemented');
            });
        });

        xdescribe('uploadKeyVisualLink', () => {
            it('todo', () => {
                console.log('to be implemented');
            });
        });

        describe('send mail', () => {
            it('should send mail to all member', () => {
                service.sendMail('mock content to all', mockFormat2.id).subscribe();
                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat2.id}/member/_sendMail`);
                req.flush('');
                expect(req.request.method).toBe('POST');
                expect(req.request.body.message).toEqual('mock content to all');
                expect(req.request.body.memberIds).toBeUndefined();
                httpMock.verify();
            });

            it('should send mail to one member', () => {
                service.sendMail('mock content to one', mockFormat2.id, [mockUserLuke.id]).subscribe();
                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat2.id}/member/_sendMail`);
                req.flush('');
                expect(req.request.method).toBe('POST');
                expect(req.request.body.message).toEqual('mock content to one');
                expect(req.request.body.memberIds.length).toEqual(1);
                expect(req.request.body.memberIds[0]).toEqual(mockUserLuke.id);
                httpMock.verify();
            });

            it('should send mail to certain members', () => {
                service.sendMail('mock content to selected', mockFormat2.id, [mockUserLuke.id, mockUserLeia.id]).subscribe();
                const req = httpMock.expectOne(`https://api.joolia.net/format/${mockFormat2.id}/member/_sendMail`);
                req.flush('');
                expect(req.request.method).toBe('POST');
                expect(req.request.body.message).toEqual('mock content to selected');
                expect(req.request.body.memberIds.length).toEqual(2);
                expect(req.request.body.memberIds[0]).toEqual(mockUserLuke.id);
                expect(req.request.body.memberIds[1]).toEqual(mockUserLeia.id);
                httpMock.verify();
            });
        });
    });
});
