import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';

@Injectable()
export class PaginatorIntlService extends MatPaginatorIntl {
    // TODO: Normally we inject our services via constructor. In this case, it was done via core module. For now we leave it like this but a
    //  task was created to have another look at the way how this was injected. The current version may create another instance of the
    //  translation service and should be investigated later
    translate: TranslateService;
    itemsPerPageLabel: string;
    firstPageLabel: string;
    previousPageLabel: string;
    nextPageLabel: string;
    lastPageLabel: string;

    getRangeLabel = (page, pageSize, length) => {
        const of = this.translate.instant('paginator.of');

        if (length === 0 || pageSize === 0) {
            return '0 ' + of + ' ' + length;
        }

        length = Math.max(length, 0);

        const startIndex = page * pageSize;

        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

        return startIndex + 1 + ' - ' + endIndex + ' ' + of + ' ' + length;
    }; // tslint:disable-line

    injectTranslateService(translate: TranslateService) {
        this.translate = translate;

        this.translate.onLangChange.subscribe(() => {
            this.translateLabels();
        });

        this.translateLabels();
    }

    translateLabels() {
        this.itemsPerPageLabel = this.translate.instant('paginator.itemsPerPage');
        this.firstPageLabel = this.translate.instant('paginator.firstPage');
        this.previousPageLabel = this.translate.instant('paginator.previousPage');
        this.nextPageLabel = this.translate.instant('paginator.nextPage');
        this.lastPageLabel = this.translate.instant('paginator.lastPage');
    }
}
