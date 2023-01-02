import { Component, Input, OnInit } from '@angular/core';
import { ActivityTemplate } from '../../../core/models';

@Component({
    selector: 'app-activity-template-list-item',
    templateUrl: './activity-template-list-item.component.html',
    styleUrls: ['./activity-template-list-item.component.scss']
})
export class ActivityTemplateListItemComponent implements OnInit {
    @Input() template: ActivityTemplate;

    constructor() {}

    ngOnInit() {}
}
