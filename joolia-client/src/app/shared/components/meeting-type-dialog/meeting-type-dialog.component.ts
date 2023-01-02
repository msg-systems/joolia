import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MeetingType } from 'src/app/core/enum/global/meeting-type.enum';
import { ConfigurationService } from 'src/app/core/services';

export interface IMeetingSelectionItem {
    value: MeetingType;
    viewValue: string;
    logoSrc: string;
    disabled: boolean;
}

@Component({
    selector: 'app-meeting-type-dialog',
    templateUrl: './meeting-type-dialog.component.html',
    styleUrls: ['./meeting-type-dialog.component.scss']
})
export class MeetingTypeDialogComponent implements OnInit {
    selected: IMeetingSelectionItem;
    title: string;
    meetingOptions = [
        {
            value: MeetingType.MSTeams,
            viewValue: 'dialog.startMeeting.MSTeams',
            logoSrc: `${ConfigurationService.getConfiguration().appBaseHref}assets/ms_teams_logo.png`,
            disabled: false
        },
        {
            value: MeetingType.BBB,
            viewValue: 'dialog.startMeeting.BBB',
            logoSrc: `${ConfigurationService.getConfiguration().appBaseHref}assets/big_blue_button_logo.png`,
            disabled: true
        }
    ] as IMeetingSelectionItem[];

    constructor(private dialogRef: MatDialogRef<MeetingTypeDialogComponent>, @Inject(MAT_DIALOG_DATA) data) {
        this.title = `${data.title} Meeting`;
    }

    ngOnInit() {}

    onStartMeeting() {
        if (this.selected === undefined) {
            return;
        } else if (this.selected.value === MeetingType.MSTeams) {
            this.onMsTeamsMeetingStart();
        } else if (this.selected.value === MeetingType.BBB) {
            this.onBBBMeetingStart();
        }
    }

    onMsTeamsMeetingStart() {
        this.dialogRef.close(MeetingType.MSTeams);
    }

    onBBBMeetingStart() {
        this.dialogRef.close(MeetingType.BBB);
    }
}
