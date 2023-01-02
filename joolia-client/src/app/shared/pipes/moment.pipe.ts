import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'moment'
})
export class MomentPipe implements PipeTransform {
    transform(value: Date | moment.Moment, dateFormat: string): any {
        return moment(value).format(dateFormat);
    }
}
