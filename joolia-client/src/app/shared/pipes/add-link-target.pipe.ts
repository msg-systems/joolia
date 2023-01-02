import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'addLinkTarget'
})
export class AddLinkTargetPipe implements PipeTransform {
    constructor() {}

    transform(value: string): any {
        value = value || '';
        const re = new RegExp('<a href=', 'g');
        return value.replace(re, '<a target="_blank" href=');
    }
}
