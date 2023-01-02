import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Action, User } from '../../../core/models';
import { TranslateService } from '@ngx-translate/core';
import { UtilService } from '../../../core/services';

/**
 * The UserCardComponent is a general user card and displays several information about the user.
 */
@Component({
    selector: 'user-card',
    templateUrl: './user-card.component.html',
    styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent implements OnInit {
    @Input() user: User;
    /**
     * menuActions: Actions in the menu. MUST have one parameter to identify which item was called. Always uses the specified userId.
     */
    @Input() userMenuActions: Action[] = [];
    @Input() subContent = '';
    @Input() clickable = false;
    @Output() menuOpenClick: EventEmitter<string> = new EventEmitter();
    @Output() itemClick: EventEmitter<string> = new EventEmitter();

    constructor(private translate: TranslateService, private util: UtilService) {}

    ngOnInit() {
        if (this.user.pending) {
            this.subContent = '';
        }
    }

    getSkills() {
        return this.util.getUserSkillsAsText(this.user.skills, this.translate);
    }

    onMenuOpenClick(e) {
        this.menuOpenClick.emit(e);
    }

    onItemClick(e) {
        if (this.clickable) {
            this.itemClick.emit(e);
        }
    }
}
