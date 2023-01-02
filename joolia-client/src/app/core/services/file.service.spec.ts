import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { FileService } from './file.service';
import { ConfigurationService } from './configuration.service';
import { FileMeta } from '../models';
import { ConfigurationServiceStub, getMockData } from '../../../testing/unitTest';
import { FileUsage } from '../enum/global/file-usage.enum';

let mockFiles;
const configurationServiceStub = new ConfigurationServiceStub();

describe('FileService', () => {
    let service: FileService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [FileService, { provide: ConfigurationService, useValue: configurationServiceStub }]
        });

        spyOn(ConfigurationService, 'getConfiguration').and.callThrough();
        service = TestBed.inject(FileService);
        httpMock = TestBed.inject(HttpTestingController);

        mockFiles = getMockData('file.set.set1');
    });

    it('should create', () => {
        expect(service).toBeDefined();
        expect(ConfigurationService.getConfiguration).toHaveBeenCalled();
    });

    it('should loadFilesMeta', fakeAsync(() => {
        let loadedFiles = null;
        service.loadFilesMeta('/parent').subscribe((data) => {
            loadedFiles = data;
        });
        const req = httpMock.expectOne(`https://api.joolia.net/parent/file`);
        expect(req.request.method).toBe('GET');
        req.flush(mockFiles);
        httpMock.verify();

        expect(loadedFiles).toEqual(jasmine.arrayContaining(mockFiles));
    }));

    it('should loadFileMeta', fakeAsync(() => {
        let loadedFile = null;
        service.loadFileMeta('/parent', 'myFileId').subscribe((data) => {
            loadedFile = data;
        });
        const req = httpMock.expectOne(`https://api.joolia.net/parent/file/myFileId`);
        expect(req.request.method).toBe('GET');
        req.flush(mockFiles[0]);
        httpMock.verify();

        expect(loadedFile).toEqual(mockFiles[0]);
    }));

    it('should loadKeyVisualMeta', fakeAsync(() => {
        let loadedFile = null;
        service.loadKeyVisualMeta('/parent').subscribe((data) => {
            loadedFile = data;
        });
        const req = httpMock.expectOne(`https://api.joolia.net/parent/keyvisual`);
        expect(req.request.method).toBe('GET');
        req.flush(mockFiles[0]);
        httpMock.verify();

        expect(loadedFile).toEqual(mockFiles[0]);
    }));

    it('should loadAvatarMeta', fakeAsync(() => {
        let loadedFile = null;
        service.loadAvatarMeta('/parent').subscribe((data) => {
            loadedFile = data;
        });
        const req = httpMock.expectOne(`https://api.joolia.net/parent/avatar`);
        expect(req.request.method).toBe('GET');
        req.flush(mockFiles[0]);
        httpMock.verify();

        expect(loadedFile).toEqual(mockFiles[0]);
    }));

    it('should loadLogoMeta', fakeAsync(() => {
        let loadedFile = null;
        service.loadLogoMeta('/parent').subscribe((data) => {
            loadedFile = data;
        });
        const req = httpMock.expectOne(`https://api.joolia.net/parent/logo`);
        expect(req.request.method).toBe('GET');
        req.flush(mockFiles[0]);
        httpMock.verify();

        expect(loadedFile).toEqual(mockFiles[0]);
    }));

    describe('loadUploadMetaForFile', () => {
        let file;

        beforeEach(() => {
            file = <FileMeta>{ name: 'cool.png' };
        });

        it('should loadUploadMeta for a file', fakeAsync(() => {
            let fileMeta = null;
            service.loadUploadMetaForFile('/parent', file).subscribe((data: FileMeta) => {
                fileMeta = data;
            });
            const req = httpMock.expectOne(`https://api.joolia.net/parent/file`);
            expect(req.request.method).toBe('POST');
            req.flush(<FileMeta>{ fileUrl: 'myFileUrl' });
            httpMock.verify();

            expect(fileMeta.fileUrl).toBe('myFileUrl');
        }));

        it('should loadUploadMeta for a keyvisual', fakeAsync(() => {
            let fileMeta = null;
            file.fileUsage = FileUsage.KEYVISUAL;
            service.loadUploadMetaForFile('/parent', file).subscribe((data: FileMeta) => {
                fileMeta = data;
            });
            const req = httpMock.expectOne(`https://api.joolia.net/parent/keyvisual`);
            expect(req.request.method).toBe('PUT');
            req.flush(<FileMeta>{ fileUrl: 'myFileUrl' });
            httpMock.verify();

            expect(fileMeta.fileUrl).toBe('myFileUrl');
        }));

        it('should loadUploadMeta for an avatar', fakeAsync(() => {
            let fileMeta = null;
            file.fileUsage = FileUsage.AVATAR;
            service.loadUploadMetaForFile('/parent', file).subscribe((data: FileMeta) => {
                fileMeta = data;
            });
            const req = httpMock.expectOne(`https://api.joolia.net/parent/avatar`);
            expect(req.request.method).toBe('PUT');
            req.flush(<FileMeta>{ fileUrl: 'myFileUrl' });
            httpMock.verify();

            expect(fileMeta.fileUrl).toBe('myFileUrl');
        }));

        it('should loadUploadMeta for a logo', fakeAsync(() => {
            let createdFile: FileMeta = null;
            file.fileUsage = FileUsage.LOGO;
            service.loadUploadMetaForFile('/parent', file).subscribe((data: FileMeta) => {
                createdFile = data;
            });
            const req = httpMock.expectOne(`https://api.joolia.net/parent/logo`);
            expect(req.request.method).toBe('PUT');
            req.flush(<FileMeta>{ fileUrl: 'myFileUrl' });
            httpMock.verify();

            expect(createdFile.fileUrl).toBe('myFileUrl');
        }));
    });

    it('should getDownloadFileMeta', fakeAsync(() => {
        let file = null;
        service.getDownloadFileMeta('/parent', 'fileId').subscribe((data: FileMeta) => {
            file = data;
        });
        const req = httpMock.expectOne(`https://api.joolia.net/parent/file/fileId`);
        expect(req.request.method).toBe('GET');
        req.flush(<FileMeta>{ fileUrl: 'myFileUrl' });
        httpMock.verify();

        expect(file.fileUrl).toBe('myFileUrl');
    }));

    it('should deleteFile', fakeAsync(() => {
        service.deleteFile('/parent', 'fileId').subscribe();
        const req = httpMock.expectOne(`https://api.joolia.net/parent/file/fileId`);
        expect(req.request.method).toBe('DELETE');
        httpMock.verify();
    }));
});
