import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'timeDescriptionPipe'
})
export class TimeDescriptionPipe implements PipeTransform {
    constructor() {}

    transform(value: moment.Moment, isHourSchedule: boolean): any {
        if (isHourSchedule) {
            return value.format('LT');
        } else {
            // Currently, there is no way to display a localized date without the year
            // https://github.com/moment/moment/issues/4325
            const format = moment
                .localeData()
                .longDateFormat('L')
                .replace(/Y/g, '')
                .replace(/^\W|\W$|\W\W/, '');
            return value.format(format);
        }
    }
}
