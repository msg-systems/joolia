import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MeetingJoinDialogResult } from 'src/app/core/enum/global/meeting-join-dialog-result.enum';
import { MeetingType } from 'src/app/core/enum/global/meeting-type.enum';

@Component({
    selector: 'app-meeting-join-dialog',
    templateUrl: './meeting-join-dialog.component.html',
    styleUrls: ['./meeting-join-dialog.component.scss']
})
export class MeetingJoinDialogComponent implements OnInit {
    title: string;
    meetingUrl: string;
    canDeleteMeeting: boolean;
    expirationTime: Date;
    meetingType: string;
    copyLinkButton = { icon: 'content_copy', text: 'dialog.joinMeeting.copyLink', styling: 'copy-button' };
    meetingTypeForTranslation: string;
    hasExpiration: boolean;

    constructor(private dialogRef: MatDialogRef<MeetingJoinDialogComponent>, @Inject(MAT_DIALOG_DATA) data) {
        this.title = `${data.title} Meeting`;
        this.meetingUrl = `${data.meetingUrl}`;
        this.canDeleteMeeting = data.canDeleteMeeting;
        this.expirationTime = data.expirationTime;
        this.meetingType = data.meetingType;
    }

    ngOnInit() {
        this.meetingTypeForTranslation = `dialog.startMeeting.${this.meetingType}`;
        this.setHasExpiration();
    }

    setHasExpiration() {
        if (this.meetingType !== MeetingType.BBB) {
            this.hasExpiration = true;
        } else {
            this.hasExpiration = false;
        }
    }

    onJoinMeeting() {
        this.dialogRef.close(MeetingJoinDialogResult.JOIN);
    }

    onCopyLinkClick() {
        this.copyLinkButton.icon = 'done';
        this.copyLinkButton.text = 'dialog.joinMeeting.linkCopied';
        this.copyLinkButton.styling = 'copy-button-clicked';
    }

    onCopyLinkBlur() {
        this.copyLinkButton.icon = 'content_copy';
        this.copyLinkButton.text = 'dialog.joinMeeting.copyLink';
        this.copyLinkButton.styling = 'copy-button';
    }

    onDeleteMeeting() {
        this.dialogRef.close(MeetingJoinDialogResult.DELETE);
    }

    formatExpirationTime(expirationTime: Date) {
        return `${expirationTime.toLocaleDateString('en-GB')}`.replace(/\//g, '.');
    }
}
