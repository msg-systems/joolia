import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import {
    AuthorizationServiceStub,
    ConfigurationServiceStub,
    FileServiceStub,
    getMockData,
    ReferenceResolverServiceStub,
    TranslateServiceStub,
    UserServiceStub
} from '../../../testing/unitTest';
import { ConfigurationService } from './configuration.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from './workspace.service';
import { assign } from 'lodash-es';
import { IQueryParams } from './util.service';
import { UserService } from './user.service';
import { ReferenceResolverService } from './reference-resolver.service';
import { FileService } from './file.service';
import { AuthorizationService } from './authorization.service';
import { Entity, FileMeta, Permission } from '../models';
import createSpyObj = jasmine.createSpyObj;
import { NgxOutputEvents } from '../enum/global/upload.enum';
import { UploadOutput } from 'ngx-uploader';

const configurationServiceStub = new ConfigurationServiceStub();
const translationServiceStub = new TranslateServiceStub();
const userServiceStub = new UserServiceStub();
const referenceResolverStub = new ReferenceResolverServiceStub();
const authorizationServiceStub = new AuthorizationServiceStub();
const fileServiceStub = new FileServiceStub();

let mockWorkspace1;
let mockWorkspaceList1;
let mockFile1;

const workspaceURL = `https://api.joolia.net/workspace`;

describe('WorkspaceService', () => {
    let service: WorkspaceService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                WorkspaceService,
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: TranslateService, useValue: translationServiceStub },
                { provide: ReferenceResolverService, useValue: referenceResolverStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: FileService, useValue: fileServiceStub },
                { provide: AuthorizationService, useValue: authorizationServiceStub }
            ]
        });

        service = TestBed.inject(WorkspaceService);
        httpMock = TestBed.inject(HttpTestingController);

        mockWorkspace1 = getMockData('workspace.workspace1');
        mockWorkspaceList1 = getMockData('workspace.list.list1');
        mockFile1 = getMockData('file.file1');

        translationServiceStub._resetStubCalls();
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    describe('Workspace', () => {
        it('should create the workspace', fakeAsync(() => {
            const body = {
                name: mockWorkspace1.name,
                description: mockWorkspace1.description,
                licensesCount: mockWorkspace1.licensesCount
            };

            const nextSpy = spyOn(service.workspaceListChanged, 'next').and.callThrough();

            const sub = service.workspaceListChanged.subscribe((workspaceList) => {
                expect(workspaceList.count).toEqual(1);
                expect(workspaceList.entities[0]).toEqual(mockWorkspace1);
            });

            service.createWorkspace(body).subscribe();

            const req = httpMock.expectOne(workspaceURL);
            expect(req.request.method).toBe('POST');
            req.flush(assign(mockWorkspace1, body));
            httpMock.verify();

            sub.unsubscribe();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should load specific workspace', fakeAsync(() => {
            const nextSpy = spyOn(service.workspaceChanged, 'next').and.callThrough();

            const sub = service.workspaceChanged.subscribe((workspace) => {
                expect(workspace).toEqual(mockWorkspace1);
            });

            service.loadWorkspace(mockWorkspace1.id).subscribe();

            const req = httpMock.expectOne(`${workspaceURL}/${mockWorkspace1.id}`);
            req.flush(mockWorkspace1);
            httpMock.verify();

            sub.unsubscribe();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should return the loaded workspace', fakeAsync(() => {
            service.loadWorkspace(mockWorkspace1.id).subscribe();

            const req = httpMock.expectOne(`${workspaceURL}/${mockWorkspace1.id}`);
            req.flush(mockWorkspace1);
            httpMock.verify();
            expect(service.getCurrentWorkspace()).toEqual(mockWorkspace1);
        }));
    });

    describe('Workspaces', () => {
        it('should load the workspaces', fakeAsync(() => {
            const nextSpy = spyOn(service.workspaceListChanged, 'next').and.callThrough();

            const sub = service.workspaceListChanged.subscribe((workspaces) => {
                expect(workspaces).toEqual(mockWorkspaceList1);
                expect(workspaces.count).toBe(mockWorkspaceList1.count);
            });

            service.loadWorkspaces().subscribe();

            const req = httpMock.expectOne(workspaceURL);
            req.flush(mockWorkspaceList1);
            httpMock.verify();

            sub.unsubscribe();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should load more workspaces', fakeAsync(() => {
            service.loadWorkspaces().subscribe();
            const req1 = httpMock.expectOne(workspaceURL);
            req1.flush(mockWorkspaceList1);
            httpMock.verify();

            const nextSpy = spyOn(service.workspaceListChanged, 'next').and.callThrough();

            const sub = service.workspaceListChanged.subscribe((workspaces) => {
                expect(workspaces.entities.length).toBe(10);
            });

            service.loadWorkspaces({}, true).subscribe();
            const req2 = httpMock.expectOne(workspaceURL);
            req2.flush(mockWorkspaceList1);
            httpMock.verify();

            sub.unsubscribe();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should load the ids of workspaces', fakeAsync(() => {
            const queryParams: IQueryParams = {
                select: 'id'
            };

            service.loadWorkspaces(queryParams).subscribe();

            const req = httpMock.expectOne(`${workspaceURL}?select%5B%5D=id`);
            req.flush(mockWorkspaceList1);
            httpMock.verify();
        }));
    });

    describe('Workspace Members:', () => {
        describe('load:', () => {
            beforeEach(() => {
                // load specific library
                service.loadWorkspace(mockWorkspace1.id).subscribe();
                httpMock.expectOne(() => true).flush(mockWorkspace1);
                httpMock.verify();
            });

            describe('loadWorkspaceMembers', () => {
                it('should load workspace members for loaded workspace', fakeAsync(() => {
                    const nextSpy = spyOn(service.workspaceChanged, 'next').and.callThrough();

                    const sub = service.workspaceChanged.subscribe((loadedWorkspace) => {
                        expect(loadedWorkspace.hasOwnProperty('members')).toBe(true);
                        expect(loadedWorkspace.memberCount).toBe(2);
                        expect(loadedWorkspace.members.count).toBe(2);
                        expect(loadedWorkspace.members.entities.length).toBe(2);
                    });

                    service.loadWorkspaceMembers(mockWorkspace1.id).subscribe();

                    const req = httpMock.expectOne(`${workspaceURL}/${mockWorkspace1.id}/member`);
                    req.flush(mockWorkspace1.members);
                    httpMock.verify();

                    sub.unsubscribe();

                    expect(nextSpy).toHaveBeenCalled();
                }));

                it('should load more workspace members for loaded workspace', fakeAsync(() => {
                    const nextSpy = spyOn(service.workspaceChanged, 'next').and.callThrough();

                    service.loadWorkspaceMembers(mockWorkspace1.id).subscribe();

                    const req1 = httpMock.expectOne(`${workspaceURL}/${mockWorkspace1.id}/member`);
                    req1.flush(mockWorkspace1.members);
                    httpMock.verify();

                    const sub = service.workspaceChanged.subscribe((loadedWorkspace) => {
                        expect(loadedWorkspace.members.entities.length).toBe(4);
                    });

                    service.loadWorkspaceMembers(mockWorkspace1.id, {}, true).subscribe();
                    const req2 = httpMock.expectOne(`${workspaceURL}/${mockWorkspace1.id}/member`);
                    req2.flush(mockWorkspace1.members);
                    httpMock.verify();

                    sub.unsubscribe();

                    expect(nextSpy).toHaveBeenCalled();
                }));
            });
        });
    });

    describe('Workspace Logo', () => {
        it('should loadWorkspaceLogoMeta', fakeAsync(() => {
            let logo: FileMeta = null;
            spyOn(fileServiceStub, 'loadLogoMeta').and.callThrough();
            service.loadWorkspaceLogoMeta(mockWorkspace1.id).subscribe((file) => {
                logo = file;
            });
            expect(fileServiceStub.loadLogoMeta).toHaveBeenCalledWith(`/workspace/${mockWorkspace1.id}`, undefined);

            expect(logo.id).toEqual(mockFile1.id);
        }));

        describe('onLogoUploadOutput', () => {
            let ngxUsSpy;
            let uploadFile;
            let parent;

            beforeEach(() => {
                uploadFile = {
                    id: '123',
                    fileIndex: 1,
                    lastModifiedDate: new Date(),
                    name: 'logo.jpg',
                    size: 1,
                    type: '',
                    form: null,
                    progress: null
                };
                parent = `/workspace/${mockWorkspace1.id}`;
                service.loadWorkspace(mockWorkspace1.id).subscribe();
                const url = workspaceURL + '/' + mockWorkspace1.id;
                const req = httpMock.expectOne(url);
                req.flush(mockWorkspace1);
                httpMock.verify();
                ngxUsSpy = createSpyObj('ngxUS', ['onallAddedToQueue', 'ondone', 'onrejected']);
            });

            it('should upload Logo', () => {
                const output: UploadOutput = { type: NgxOutputEvents.ALLADDEDTOQUEUE, file: uploadFile };
                service.onLogoUploadOutput(ngxUsSpy, output);
                expect(ngxUsSpy.onallAddedToQueue).toHaveBeenCalledWith(output, jasmine.any(Array), parent);
            });

            it('should load Logo when upload done', fakeAsync(() => {
                let logo: FileMeta = null;
                spyOn(service, 'loadWorkspaceLogoMeta').and.callThrough();
                spyOn(service.workspaceChanged, 'next').and.callThrough();
                service.workspaceChanged.subscribe((workspace) => {
                    logo = workspace.logo;
                });
                const output: UploadOutput = { type: NgxOutputEvents.DONE, file: uploadFile };
                service.onLogoUploadOutput(ngxUsSpy, output);
                expect(ngxUsSpy.ondone).toHaveBeenCalledWith(output, jasmine.any(Array));
                expect(service.loadWorkspaceLogoMeta).toHaveBeenCalledWith(mockWorkspace1.id);
                expect(service.workspaceChanged.next).toHaveBeenCalled();
                expect(logo.id).toEqual(mockFile1.id);
            }));

            it('should handle failed upload', () => {
                const output: UploadOutput = { type: NgxOutputEvents.REJECTED, file: uploadFile };
                service.onLogoUploadOutput(ngxUsSpy, output);
                expect(ngxUsSpy.onrejected).toHaveBeenCalledWith(output, jasmine.any(Array));
            });
        });
    });

    describe('hasPermission', () => {
        it('should check permission for given workspace', () => {
            spyOn(authorizationServiceStub, 'hasPermission').and.returnValue(true);
            expect(service.hasPermission(Permission.UPDATE_WORKSPACE, mockWorkspace1)).toEqual(true);
            expect(authorizationServiceStub.hasPermission).toHaveBeenCalledWith(
                Entity.WORKSPACE,
                mockWorkspace1.me.userRole,
                Permission.UPDATE_WORKSPACE
            );
        });

        it('should check permission for loaded workspace', () => {
            service.loadWorkspace(mockWorkspace1.id).subscribe();
            const url = workspaceURL + '/' + mockWorkspace1.id;
            const req = httpMock.expectOne(url);
            req.flush(mockWorkspace1);
            httpMock.verify();
            spyOn(authorizationServiceStub, 'hasPermission').and.returnValue(true);
            expect(service.hasPermission(Permission.UPDATE_WORKSPACE)).toEqual(true);
            expect(authorizationServiceStub.hasPermission).toHaveBeenCalledWith(
                Entity.WORKSPACE,
                mockWorkspace1.me.userRole,
                Permission.UPDATE_WORKSPACE
            );
        });
    });

    describe('adminConsent', () => {
        it('should send email to admin asking for consent for this workspace', () => {
            const adminConsentEmailBody = getMockData('workspace.adminConsentEmail');
            service.sendAdminConsentEmail(mockWorkspace1.id, adminConsentEmailBody).subscribe();
            const req = httpMock.expectOne(`https://api.joolia.net/workspace/${mockWorkspace1.id}/_consent`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(adminConsentEmailBody);
            req.flush('');
            httpMock.verify();
        });
    });
});
