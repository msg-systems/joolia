import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DurationUnit } from '../../core/models';

@Pipe({
    name: 'durationPipe'
})
export class DurationPipe implements PipeTransform {
    constructor(private translate: TranslateService) {}

    transform(value: any, format?: DurationUnit, shortTimeLabel = false): any {
        let result;

        if (!format) {
            format = this.getDurationFormat(value);
        }

        if (format === DurationUnit.MINUTES) {
            result = this.translate.instant(shortTimeLabel ? 'labels.amountHoursAndMinutesShort' : 'labels.amountHoursAndMinutesLong', {
                amountHours: Math.floor(value / 60),
                amountMinutes: value % 60
            });
        } else if (format === DurationUnit.DAYS) {
            result = this.translate.instant('labels.amountDays', {
                amount: value / (60 * 24)
            });
        } else {
            result = value;
        }

        return result;
    }

    private getDurationFormat(duration: number) {
        return duration < 1440 ? DurationUnit.MINUTES : DurationUnit.DAYS;
    }
}
