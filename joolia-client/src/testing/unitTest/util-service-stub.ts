import { MeetingType } from 'src/app/core/enum/global/meeting-type.enum';
import { UtilService } from 'src/app/core/services';

export class UtilServiceStub implements Partial<UtilService> {
    getTypeOfMeetingFromUrl(_meetingUrl: string): MeetingType {
        return MeetingType.MSTeams;
    }
}
