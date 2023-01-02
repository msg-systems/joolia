import { Component, Input, OnInit } from '@angular/core';
import { Format, Team, User } from '../../../core/models';

@Component({
    selector: 'user-avatar',
    templateUrl: './user-avatar.component.html',
    styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent implements OnInit {
    @Input() sizeInPx: number;
    @Input() user: User = null;
    @Input() team: Team = null;
    @Input() format: Format = null;
    @Input() transparent = false;

    containerSize: string;
    iconSize: string;
    iconMargin: string;

    defaultIcon: string;

    constructor() {}

    ngOnInit(): void {
        this.containerSize = `${this.sizeInPx}px`;
        this.iconSize = `${this.sizeInPx * 1.2}px`;
        this.iconMargin = `-${0.1 * this.sizeInPx}px`;

        if (this.team) {
            this.defaultIcon = 'supervised_user_circle';
        } else if (this.format) {
            this.defaultIcon = 'vertical_split_outline';
        } else {
            this.defaultIcon = 'face';
        }
    }
}
