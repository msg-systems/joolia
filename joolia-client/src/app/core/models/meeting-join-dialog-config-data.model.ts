import { MeetingType } from '../enum/global/meeting-type.enum';

export interface IMeetingJoinDialogConfigData {
    title: string;
    canDeleteMeeting: boolean;
    meetingUrl: string;
    expirationTime: Date;
    meetingType: MeetingType;
}
