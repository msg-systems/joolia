import { Component, Input, OnInit } from '@angular/core';
import { ActivityTemplate } from '../../../core/models';

@Component({
    selector: 'app-activity-template-list',
    templateUrl: './activity-template-list.component.html',
    styleUrls: ['./activity-template-list.component.scss']
})
export class ActivityTemplateListComponent implements OnInit {
    @Input() activityTemplates: ActivityTemplate[];

    constructor() {}

    ngOnInit() {}
}
