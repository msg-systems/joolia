import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Format, Team, User } from 'src/app/core/models';
import { FormatMember } from 'src/app/core/models/format-member.model';

import { FormatService, TeamService, UserService } from 'src/app/core/services';

@Component({
    selector: 'app-format-details-member-profile',
    templateUrl: './format-details-member-profile.component.html',
    styleUrls: ['./format-details-member-profile.component.scss']
})
export class FormatDetailsMemberProfileComponent implements OnInit, OnDestroy {
    member: FormatMember;
    currentFormat: Format;
    subscriptions: Subscription[] = [];

    constructor(
        private formatService: FormatService,
        private route: ActivatedRoute,
        private userService: UserService,
        private router: Router,
        private teamService: TeamService
    ) {}

    ngOnInit() {
        const memberId = this.route.snapshot.paramMap.get('memberId');
        this.subscriptions.push(
            this.formatService.getUserDetails(memberId).subscribe((data) => {
                this.member = data;
                this.loadUserAvatar();
                this.loadTeamAvatars();
            })
        );
        this.currentFormat = this.formatService.getCurrentFormat();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    onTeamClick(id) {
        const team = this.member.teams.find((t) => t.id === id);
        if (!team) {
            return;
        }
        this.router.navigate(['format', this.currentFormat.id, 'teams', id]);
    }

    loadTeamAvatars() {
        this.member.teams.forEach((team) => {
            if (!!team.avatar) {
                this.subscriptions.push(this.teamService.loadTeamAvatarMeta(team.id).subscribe((avatar) => (team.avatar = avatar)));
            }
        });
    }

    loadUserAvatar() {
        if (this.member.avatar && this.member.avatar.id && !this.member.avatar.fileUrl) {
            this.subscriptions.push(
                this.userService.loadAvatarMeta(this.member.id).subscribe((avatar) => {
                    this.member.avatar = avatar;
                })
            );
        }
    }
}
