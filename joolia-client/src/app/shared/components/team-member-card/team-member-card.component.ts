import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Action, User } from 'src/app/core/models';
import { TranslateService } from '@ngx-translate/core';
import { UtilService } from '../../../core/services';

@Component({
    selector: 'team-member-card',
    templateUrl: './team-member-card.component.html',
    styleUrls: ['./team-member-card.component.scss']
})
export class TeamMemberCardComponent implements OnInit {
    @Input() user: User;
    /**
     * menuActions: Actions in the menu. MUST have one parameter to identify which item was called. Always uses the specified userId.
     */
    @Input() userMenuActions: Action[] = [];
    @Output() menuOpenClick: EventEmitter<string> = new EventEmitter();

    constructor(private translate: TranslateService, private util: UtilService) {}

    ngOnInit() {}

    getSkills() {
        return this.util.getUserSkillsAsText(this.user.skills, this.translate);
    }

    onMenuOpenClick(e) {
        this.menuOpenClick.emit(e);
    }
}
