import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numberMax'
})
export class NumberMaxPipe implements PipeTransform {
    transform(value: number, maxNumber: number): string {
        if (value <= maxNumber) {
            return `${value}`;
        } else {
            return `${maxNumber}+`;
        }
    }
}
