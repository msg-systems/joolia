import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/core/models';
import { UtilService } from 'src/app/core/services';

@Component({
    selector: 'member-profile',
    templateUrl: './member-profile.component.html',
    styleUrls: ['./member-profile.component.scss']
})
export class MemberProfileComponent implements OnInit {
    @Input() member: User;

    constructor(private translate: TranslateService, private util: UtilService) {}

    ngOnInit() {}

    getSkills() {
        return this.util.getUserSkillsAsText(this.member.skills, this.translate);
    }
}
