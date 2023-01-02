import { TestBed } from '@angular/core/testing';
import { IQueryParams, UtilService } from './util.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigurationService } from './configuration.service';
import { CookieService } from 'ngx-cookie-service';
import { ConfigurationServiceStub, LoggerServiceStub, TranslateServiceStub } from '../../../testing/unitTest';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LoggerService } from './logger.service';

const configurationServiceStub = new ConfigurationServiceStub();
const translateServiceStub = new TranslateServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const snackbarStub = {
    open() {}
};

const cookieSpy = jasmine.createSpyObj('CookieService', ['']);

describe('UtilService', () => {
    let service: UtilService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                UtilService,
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: CookieService, useValue: cookieSpy },
                { provide: MatSnackBar, useValue: snackbarStub },
                { provide: Router, useValue: {} },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: TranslateService, useValue: translateServiceStub }
            ]
        });
        service = TestBed.inject(UtilService);
        httpMock = TestBed.inject(HttpTestingController);

        translateServiceStub._resetStubCalls();
    });

    describe('addFilterToQueryParams', () => {
        it('should add filters to queryParams', () => {
            let queryParams: IQueryParams = {
                select: 'fieldA,fieldB'
            };

            let filter = { fieldA: '123', fieldB: '456' };

            queryParams = UtilService.addFilterToQueryParams(queryParams, filter);

            expect(queryParams.filter).toBeTruthy();
            expect(queryParams.filter).toEqual('fieldA=123,fieldB=456');
            expect(queryParams.select).toBeTruthy();
            expect(queryParams.select).toEqual('fieldA,fieldB');
        });
    });

    describe('buildHttpParam', () => {
        // it('should transform by using correct types ', () => {
        //     const queryParams: IQueryParams = {
        //         select: 'id'
        //     };
        //
        //     let resultParams: HttpParams = new HttpParams();
        //     resultParams.append('select[]', 'id');
        //     const transformedResult = UtilService.buildHttpParams(queryParams);
        //     expect(transformedResult).toEqual(resultParams);
        // });

        it('should transform noting if nothing delivered', () => {
            const queryParams: IQueryParams = {};

            expect(UtilService.buildHttpParams(queryParams).toString()).toBe('');
        });

        it('should transform one select', () => {
            const queryParams: IQueryParams = {
                select: 'id'
            };

            expect(UtilService.buildHttpParams(queryParams).toString()).toBe('select%5B%5D=id');
        });

        it('should not transform select with undefined value', () => {
            const queryParams: IQueryParams = {
                select: undefined
            };

            expect(UtilService.buildHttpParams(queryParams).toString()).toBe('');
        });

        it('should transform multiple select', () => {
            const queryParams: IQueryParams = {
                select: 'id,name,description'
            };
            const expected = 'select%5B%5D=id' + '&select%5B%5D=name' + '&select%5B%5D=description';
            expect(UtilService.buildHttpParams(queryParams).toString()).toBe(expected);
        });

        it('should transform order descending field', () => {
            const queryParams: IQueryParams = {
                order: '-name'
            };
            expect(UtilService.buildHttpParams(queryParams).toString()).toBe('order%5Bname%5D=DESC');
        });

        it('should transform order ascending field', () => {
            const queryParams: IQueryParams = {
                order: 'name'
            };
            expect(UtilService.buildHttpParams(queryParams).toString()).toBe('order%5Bname%5D=ASC');
        });

        it('should transform download', () => {
            const queryParams: IQueryParams = {
                download: true
            };
            expect(UtilService.buildHttpParams(queryParams).toString()).toBe('download=true');
        });

        it('should transform skip', () => {
            const queryParams: IQueryParams = {
                skip: 5
            };
            expect(UtilService.buildHttpParams(queryParams).toString()).toBe('skip=5');
        });

        it('should transform take', () => {
            const queryParams: IQueryParams = {
                take: 5
            };
            expect(UtilService.buildHttpParams(queryParams).toString()).toBe('take=5');
        });

        it('should transform entity', () => {
            const queryParams: IQueryParams = {
                entity: 'Format'
            };
            expect(UtilService.buildHttpParams(queryParams).toString()).toBe('entity=Format');
        });

        it('should transform id', () => {
            const queryParams: IQueryParams = {
                id: '7f3ea551-9675-46a6-b72f-4f33e51ccbbc'
            };
            expect(UtilService.buildHttpParams(queryParams).toString()).toBe('id=7f3ea551-9675-46a6-b72f-4f33e51ccbbc');
        });

        it('should transform any field', () => {
            const queryParams: IQueryParams = {
                category: 'catOne,catTwo,catThree'
            };
            const expected = 'category%5B%5D=catOne' + '&category%5B%5D=catTwo' + '&category%5B%5D=catThree';
            expect(UtilService.buildHttpParams(queryParams).toString()).toBe(expected);
        });

        it('should transform multiple fields', () => {
            const queryParams: IQueryParams = {
                category: 'catOne,catTwo,catThree',
                take: 5,
                skip: 5,
                select: 'id,name,description'
            };
            const expected =
                'select%5B%5D=id' +
                '&select%5B%5D=name' +
                '&select%5B%5D=description' +
                '&skip=5&take=5' +
                '&category%5B%5D=catOne' +
                '&category%5B%5D=catTwo' +
                '&category%5B%5D=catThree';
            expect(UtilService.buildHttpParams(queryParams).toString()).toBe(expected);
        });

        it('should transform one filter', () => {
            const queryParams: IQueryParams = {
                filter: 'fieldA=value1'
            };
            const expected = 'filter%5BfieldA%5D=value1';
            expect(UtilService.buildHttpParams(queryParams).toString()).toBe(expected);
        });

        it('should transform multiple filter', () => {
            const queryParams: IQueryParams = {
                filter: 'fieldA=value1,fieldA=value2,fieldB=value3'
            };
            const expected = 'filter%5BfieldA%5D=value1' + '&filter%5BfieldA%5D=value2' + '&filter%5BfieldB%5D=value3';
            expect(UtilService.buildHttpParams(queryParams).toString()).toBe(expected);
        });
    });

    describe('Generate Youtube Link', () => {
        it('should fail with invalid Link x', () => {
            const link = 'x';
            const resultLink = UtilService.getEmbeddedYouTubeUrl(link);

            expect(resultLink).toBeUndefined();
        });

        it('should fail with invalid Link http://www.google.de', () => {
            const link = 'http://www.google.de';
            const resultLink = UtilService.getEmbeddedYouTubeUrl(link);

            expect(resultLink).toBeUndefined();
        });

        it('should succeed with valid Link https://www.youtube.com/watch?v=tM8gL8EGcCY&ab_channel=msgsystemsag', () => {
            const link = 'https://www.youtube.com/watch?v=tM8gL8EGcCY&ab_channel=msgsystemsag';
            const resultLink = UtilService.getEmbeddedYouTubeUrl(link);

            expect(resultLink).toBe('https://www.youtube.com/embed/tM8gL8EGcCY');
        });

        it('should succeed with valid Link www.youtube.com/watch?v=tM8gL8EGcCY&ab_channel=msgsystemsag', () => {
            const link = 'https://www.youtube.com/watch?v=tM8gL8EGcCY&ab_channel=msgsystemsag';
            const resultLink = UtilService.getEmbeddedYouTubeUrl(link);

            expect(resultLink).toBe('https://www.youtube.com/embed/tM8gL8EGcCY');
        });

        it('should succeed with valid Link youtube.com/watch?v=tM8gL8EGcCY&ab_channel=msgsystemsag', () => {
            const link = 'https://www.youtube.com/watch?v=tM8gL8EGcCY&ab_channel=msgsystemsag';
            const resultLink = UtilService.getEmbeddedYouTubeUrl(link);

            expect(resultLink).toBe('https://www.youtube.com/embed/tM8gL8EGcCY');
        });
        it('should succeed with valid Link youtube.com/watch?v=tM8gL8EGcCY', () => {
            const link = 'https://www.youtube.com/watch?v=tM8gL8EGcCY';
            const resultLink = UtilService.getEmbeddedYouTubeUrl(link);

            expect(resultLink).toBe('https://www.youtube.com/embed/tM8gL8EGcCY');
        });

        it('should succeed with valid Link https://youtu.be/tM8gL8EGcCY', () => {
            const link = 'https://youtu.be/tM8gL8EGcCY';
            const resultLink = UtilService.getEmbeddedYouTubeUrl(link);

            expect(resultLink).toBe('https://www.youtube.com/embed/tM8gL8EGcCY');
        });

        it('should succeed with valid Link youtu.be/tM8gL8EGcCY', () => {
            const link = 'https://youtu.be/tM8gL8EGcCY';
            const resultLink = UtilService.getEmbeddedYouTubeUrl(link);

            expect(resultLink).toBe('https://www.youtube.com/embed/tM8gL8EGcCY');
        });

        it('should succeed with valid Link https://www.youtube.com/embed/tM8gL8EGcCYY', () => {
            const link = 'https://www.youtube.com/embed/tM8gL8EGcCY';
            const resultLink = UtilService.getEmbeddedYouTubeUrl(link);

            expect(resultLink).toBe('https://www.youtube.com/embed/tM8gL8EGcCY');
        });

        it('should encode and decode successfully an object', () => {
            const testObject = { property1: 'test', property2: 10, property3: { property3_1: 'test' } };
            const testObjectEncoded = UtilService.encodeObjectBase64andURI(testObject);
            const testObjectDecoded = UtilService.decodeObjectBase64andURI(testObjectEncoded);

            expect(testObjectDecoded).toEqual(testObject);
        });
    });
});
