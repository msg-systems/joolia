import { DefaultLangChangeEvent, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { LangChangeEvent, TranslationChangeEvent } from '@ngx-translate/core/lib/translate.service';

export class TranslateServiceStub implements Partial<TranslateService> {
    onLangChange = new EventEmitter<LangChangeEvent>();
    onTranslationChange = new EventEmitter<TranslationChangeEvent>();
    onDefaultLangChange = new EventEmitter<DefaultLangChangeEvent>();
    public _instantCalls: any[] = [];

    get(a1, a2) {
        return of();
    }

    instant(): string | any {
        this._instantCalls.push('');
        return 'test translation';
    }

    _resetStubCalls() {
        this._instantCalls.length = 0;
    }
}
