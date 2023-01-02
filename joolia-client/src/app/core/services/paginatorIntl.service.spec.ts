import { TestBed } from '@angular/core/testing';
import { PaginatorIntlService } from './paginatorIntl.service';

describe('PaginatorIntlService', () => {
    let service: PaginatorIntlService;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [PaginatorIntlService]
        });
        service = TestBed.inject(PaginatorIntlService);
    });

    it('should create', () => {
        expect(service).toBeDefined();
    });

    xdescribe('todo', () => {
        it('should ', function() {
            console.log('to be implemented');
        });
    });
});
