import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { ConfigurationService } from './configuration.service';
import { FileService } from './file.service';
import {
    AuthenticationServiceStub,
    ConfigurationServiceStub,
    CookieServiceStub,
    FileServiceStub,
    getMockData
} from '../../../testing/unitTest';
import { AuthenticationService } from './authentication.service';
import { UserService } from './user.service';
import { CookieService } from 'ngx-cookie-service';
import { FileMeta, User } from '../models';
import { assign } from 'lodash-es';
import { IQueryParams } from './util.service';

const configurationServiceStub = new ConfigurationServiceStub();
const authenticationServiceStub = new AuthenticationServiceStub(false);
const fileServiceStub = new FileServiceStub();

let mockUserLuke;
let mockAvatarFile;
let mockUserMikey;
let mockSkillSet1;
let mockTeam1;

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;
    let mockUserLukeAvatar;

    beforeEach(async () => {
        mockUserLuke = getMockData('user.luke') as User;
        mockUserLukeAvatar = getMockData('file.file1') as FileMeta;
        mockUserMikey = getMockData('user.mickey');
        mockAvatarFile = getMockData('file.file1');
        mockSkillSet1 = getMockData('skills.set.set1');
        mockTeam1 = getMockData('team.team1');

        const cookieServiceStub = new CookieServiceStub({ token: '{"userId": "' + mockUserLuke.id + '"}' });

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                UserService,
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: FileService, useValue: fileServiceStub },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
                { provide: CookieService, useValue: cookieServiceStub }
            ]
        });
        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    describe('Load', () => {
        it('should load loggedInUser', fakeAsync(() => {
            const nextSpy = spyOn(service.loggedInUserChanged, 'next').and.callThrough();

            // TODO JOOLIA-2387 adjust test mockUserLuke.id removed
            service.loadLoggedInUser().subscribe((response: User) => {
                expect(response.id).toEqual(mockUserLuke.id);
            });

            const req = httpMock.expectOne(`https://api.joolia.net/profile`);
            req.flush(mockUserLuke);
            expect(req.request.method).toBe('GET');

            const reqAvatar = httpMock.expectOne(`https://api.joolia.net/profile/avatar`);
            reqAvatar.flush(mockUserLukeAvatar);
            expect(reqAvatar.request.method).toBe('GET');

            const reqSkill = httpMock.expectOne(`https://api.joolia.net/user/${mockUserLuke.id}/skill`);
            reqSkill.flush(mockSkillSet1);
            expect(reqSkill.request.method).toBe('GET');

            expect(nextSpy).toHaveBeenCalled();

            httpMock.verify();
        }));

        it('should load AvatarMeta', fakeAsync(() => {
            const nextSpy = spyOn(service.loggedInUserChanged, 'next').and.callThrough();

            service['loggedInUser'] = mockUserLuke;

            service.loadAvatarMeta(mockUserLuke.id, {}).subscribe((file) => {
                expect(file.name).toEqual(mockAvatarFile.name);
            });

            expect(fileServiceStub._loadAvatarMetaCalls[0].parent).toEqual(`/user/${mockUserLuke.id}/profile`);
            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should load User', fakeAsync(() => {
            const nextSpy = spyOn(service.userChanged, 'next').and.callThrough();

            service.loadUser(mockUserLuke.id).subscribe((user) => {
                expect(user.id).toEqual(mockUserLuke.id);
            });

            const req = httpMock.expectOne(`https://api.joolia.net/user/${mockUserLuke.id}/profile`);
            req.flush(mockUserLuke);
            expect(req.request.method).toBe('GET');
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));
    });

    describe('User', () => {
        it('is Creator of', () => {
            service['loggedInUser'] = mockUserLuke;
            expect(service.isCreatorOf(mockTeam1)).toBe(true);
        });
    });

    describe('Update', () => {
        it('should update Profile', fakeAsync(() => {
            const nextSpy = spyOn(service.loggedInUserChanged, 'next').and.callThrough();

            const profileBody = { company: 'test' };
            service['loggedInUser'] = mockUserLuke;

            service.updateProfile(profileBody).subscribe(() => {
                expect(service.getCurrentLoggedInUser().company).toEqual(profileBody.company);
            });

            const req = httpMock.expectOne(`https://api.joolia.net/user/${mockUserLuke.id}/profile`);
            expect(req.request.method).toBe('PATCH');
            req.flush(assign(mockUserLuke, profileBody));
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));
    });

    describe('Skills', () => {
        it('should add a skill', fakeAsync(() => {
            const nextSpy = spyOn(service.loggedInUserChanged, 'next').and.callThrough();

            const skillsToAdd = [mockSkillSet1[0].id, mockSkillSet1[1].id, mockSkillSet1[2].id];
            service['loggedInUser'] = mockUserLuke;

            service.addSkill(skillsToAdd).subscribe(() => {
                expect(service.getCurrentLoggedInUser().skills).toEqual(mockSkillSet1);
            });

            const req = httpMock.expectOne(`https://api.joolia.net/user/${mockUserLuke.id}/skill`);
            req.flush(mockSkillSet1);
            expect(req.request.method).toBe('PUT');
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should delete a skill', fakeAsync(() => {
            const nextSpy = spyOn(service.loggedInUserChanged, 'next').and.callThrough();

            service['loggedInUser'] = mockUserMikey;

            service.deleteSkill(mockSkillSet1[0].id).subscribe(() => {});

            const req = httpMock.expectOne(`https://api.joolia.net/user/${mockUserMikey.id}/skill/${mockSkillSet1[0].id}`);
            req.flush({});
            expect(req.request.method).toBe('DELETE');
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should get skills from another User', fakeAsync(() => {
            const nextSpy = spyOn(service.userChanged, 'next').and.callThrough();

            service['loggedInUser'] = mockUserMikey;

            const queryParams: IQueryParams = { select: 'skills' };

            service.userChanged.subscribe((user) => {
                expect(user.skills.length).toBe(3);
            });

            service.getSkills(mockUserLuke, queryParams);

            const req = httpMock.expectOne(`https://api.joolia.net/user/${mockUserLuke.id}/skill`);
            req.flush(mockSkillSet1);
            expect(req.request.method).toBe('GET');
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));

        it('should get skills from the loggedIn User', fakeAsync(() => {
            const nextSpy = spyOn(service.loggedInUserChanged, 'next').and.callThrough();

            service['loggedInUser'] = mockUserLuke;
            const queryParams: IQueryParams = { select: 'skills' };

            service.loggedInUserChanged.subscribe((user) => {
                expect(user.skills.length).toBe(3);
            });

            service.getSkills(mockUserLuke, queryParams);

            const req = httpMock.expectOne(`https://api.joolia.net/user/${mockUserLuke.id}/skill`);
            req.flush(mockSkillSet1);
            expect(req.request.method).toBe('GET');
            httpMock.verify();

            expect(nextSpy).toHaveBeenCalled();
        }));
    });
});
