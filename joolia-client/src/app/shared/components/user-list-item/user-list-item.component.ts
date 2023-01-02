import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Action, User } from '../../../core/models';
import { TranslateService } from '@ngx-translate/core';
import { UtilService } from '../../../core/services';

/**
 * The UserListItemComponent is a general user list item and displays several information about the user.
 */
@Component({
    selector: 'user-list-item',
    templateUrl: './user-list-item.component.html',
    styleUrls: ['./user-list-item.component.scss']
})
export class UserListItemComponent {
    @Input() user: User;
    @Input() isFormatMember = false;
    /**
     * menuActions: Actions in the menu. MUST have one parameter to identify which item was called. Always uses the specified userId.
     */
    @Input() userMenuActions: Action[] = [];
    @Input() clickable = false;
    @Input() addCheckbox = false;
    @Input() showCheckbox = false;
    @Output() menuOpenClick: EventEmitter<string> = new EventEmitter();
    @Output() itemClick: EventEmitter<string> = new EventEmitter();
    @Output() checkboxClick: EventEmitter<{ id: string; checked: boolean }> = new EventEmitter();

    constructor(private translate: TranslateService, private util: UtilService) {}

    onMenuOpenClick(e) {
        this.menuOpenClick.emit(e);
    }

    getSkills() {
        return this.util.getUserSkillsAsText(this.user.skills, this.translate);
    }

    onItemClick(e) {
        if (this.clickable) {
            this.itemClick.emit(e);
        }
    }

    onCheckboxClick(event: { id: string; checked: boolean }) {
        this.checkboxClick.emit({ id: event.id, checked: event.checked });
    }
}
