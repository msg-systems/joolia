import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { List, User, UserRole } from '../../../core/models';
import { ConfigurationService, FormatService, IQueryParams, TeamService } from '../../../core/services';

@Component({
    selector: 'app-team-add-members-dialog',
    templateUrl: './team-add-members-dialog.component.html',
    styleUrls: ['./team-add-members-dialog.component.scss']
})
export class TeamAddMembersDialogComponent implements OnInit {
    availableUsers: List<User> = { count: 0, entities: [] };
    teamAddMembersForm: FormGroup;
    isLoading = true;
    noMoreLoadable = false;
    infiniteScrollDistance: number;
    infiniteScrollThrottle: number;

    constructor(
        private dialogRef: MatDialogRef<TeamAddMembersDialogComponent>,
        private formatService: FormatService,
        private teamService: TeamService
    ) {}

    ngOnInit() {
        this.infiniteScrollDistance = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollDistance;
        this.infiniteScrollThrottle = ConfigurationService.getConfiguration().configuration.infiniteScrollConfig.scrollThrottle;

        this.teamAddMembersForm = new FormGroup({
            users: new FormControl([], [Validators.required])
        });

        this.teamService
            .getPossibleNewMembersForTeam(this.formatService.getCurrentFormat().id, this.teamService.getCurrentTeam().id)
            .subscribe((users: List<User>) => {
                this.availableUsers = users;
                this.isLoading = false;
                this.noMoreLoadable = this.availableUsers.entities.length >= this.availableUsers.count;
            });
    }

    isOrganizer(role: string) {
        return role === UserRole.ORGANIZER;
    }

    getRoleLabel(role: string) {
        return this.isOrganizer(role) ? 'labels.organizer' : 'labels.participant';
    }

    onLoadMore() {
        this.isLoading = true;
        const queryParams: IQueryParams = {
            skip: this.availableUsers.entities.length,
            take: ConfigurationService.getConfiguration().configuration.pagination.member.loadMore
        };

        this.teamService
            .getPossibleNewMembersForTeam(this.formatService.getCurrentFormat().id, this.teamService.getCurrentTeam().id, queryParams)
            .subscribe((memberList) => {
                this.availableUsers.count = memberList.count;
                this.availableUsers.entities = this.availableUsers.entities.concat(memberList.entities);
                this.isLoading = false;
                this.noMoreLoadable = this.availableUsers.entities.length >= this.availableUsers.count;
            });
    }

    onSubmit() {
        Object.values(this.teamAddMembersForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.teamAddMembersForm.valid) {
            this.dialogRef.close(this.teamAddMembersForm.value);
        }
    }
}
