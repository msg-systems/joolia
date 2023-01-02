import { Component, Input, OnInit } from '@angular/core';
import { Activity, CheckedBy, DurationUnit, Format, Phase, Team } from '../../../core/models';
import { Router } from '@angular/router';

@Component({
    selector: 'format-current-state',
    templateUrl: './format-current-state.component.html',
    styleUrls: ['./format-current-state.component.scss']
})
export class FormatCurrentStateComponent implements OnInit {
    @Input() format: Format;
    @Input() phases: Phase[];
    @Input() activities: Activity[];
    @Input() teamsOrMembers: CheckedBy[];
    @Input() teams: Team[];
    @Input() organizerView: boolean;

    readonly phaseDurationDaysType = DurationUnit.DAYS;
    readonly phaseDurationMinutesType = DurationUnit.MINUTES;
    firstActivityClick = true;

    constructor(private router: Router) {}

    ngOnInit() {}

    onPhaseClick(phaseId: string) {
        this.router.navigate(['format', this.format.id, 'phase', phaseId]);
    }

    onActivityClick(activityId: string) {
        // first click event is emitted in ngOnInit of ActivityList, so we ignore it
        if (!this.firstActivityClick) {
            this.router.navigate(['format', this.format.id, 'phase', this.phases[0].id, 'activity', activityId, 'details']);
        }
        this.firstActivityClick = false;
    }

    onProgressClick() {
        this.router.navigate(['format', this.format.id, 'phase', this.phases[0].id, 'activity', this.activities[0].id, 'progress']);
    }

    onTeamClick(teamId: string) {
        this.router.navigate(['format', this.format.id, 'teams', teamId]);
    }

    hasProgress() {
        return this.activities !== undefined && this.activities.length > 0;
    }

    hasCurrentPhase() {
        return this.phases !== undefined && this.phases.length > 0;
    }

    hasTeams() {
        return this.teams !== undefined && this.teams.length > 0;
    }

    hasCurrentActivity() {
        return this.activities !== undefined && this.activities.length > 0;
    }
}
