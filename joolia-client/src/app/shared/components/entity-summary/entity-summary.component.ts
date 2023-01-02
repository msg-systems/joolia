import { Component, Input, OnInit } from '@angular/core';
import { EntitySummaryItem } from '../../../core/models';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'entity-summary',
    templateUrl: './entity-summary.component.html',
    styleUrls: ['./entity-summary.component.scss']
})
export class EntitySummaryComponent implements OnInit {
    @Input() entitySummary: EntitySummaryItem[] = [];

    constructor(private translateService: TranslateService) {}

    ngOnInit(): void {}

    getChipMessage(item: EntitySummaryItem) {
        return this.translateService.instant(item.key, { amount: item.amount });
    }
}
