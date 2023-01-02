import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'decimal'
})
export class DecimalProxyPipe implements PipeTransform {
    constructor(private translate: TranslateService) {}

    public transform(value: any, digitsInfo?: string): any {
        const decimalPipe = new DecimalPipe(this.translate.currentLang);
        return decimalPipe.transform(value, digitsInfo);
    }
}
