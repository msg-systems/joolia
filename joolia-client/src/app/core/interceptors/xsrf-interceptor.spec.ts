import { HTTP_INTERCEPTORS, HttpClient, HttpRequest, HttpXsrfTokenExtractor } from '@angular/common/http';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { XsrfInterceptor } from './xsrf-interceptor';

const TOKEN = 'test';
const tokenExtractorStub = {
    getToken(): string | null {
        return TOKEN;
    }
};

describe('XsrfInterceptor', () => {
    let httpClient: HttpClient;
    let httpMock: HttpTestingController;
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                HttpClient,
                { provide: HttpXsrfTokenExtractor, useValue: tokenExtractorStub },
                { provide: HTTP_INTERCEPTORS, useClass: XsrfInterceptor, multi: true }
            ]
        })
    );

    beforeEach(() => {
        httpClient = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('applies XSRF protection to outgoing requests', fakeAsync(() => {
        httpClient.post('https://api.joolia.net/signup', {}).subscribe((res) => expect(res).toBeTruthy());

        const req = httpMock.expectOne('https://api.joolia.net/signup');
        expect(req.request.headers.has('X-XSRF-TOKEN')).toEqual(true);
        expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual(TOKEN);

        req.flush({ data: 'test' });
        httpMock.verify();
    }));

    it('does not apply XSRF protection when request is a GET', fakeAsync(() => {
        httpClient.get('https://api.joolia.net/test').subscribe((res) => expect(res).toBeTruthy());
        const req = httpMock.expectOne('https://api.joolia.net/test');
        expect(req.request.headers.has('X-XSRF-TOKEN')).toEqual(false);

        req.flush({ data: 'test' });
        httpMock.verify();
    }));

    it('does not overwrite existing header', fakeAsync(() => {
        httpClient
            .post(
                'https://api.joolia.net/test',
                {},
                {
                    headers: { 'X-XSRF-TOKEN': 'foo' }
                }
            )
            .subscribe((res) => expect(res).toBeTruthy());
        const req = httpMock.expectOne('https://api.joolia.net/test');
        expect(req.request.headers.has('X-XSRF-TOKEN')).toEqual(true);
        expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual('foo');

        req.flush({ data: 'test' });
        httpMock.verify();
    }));
});
