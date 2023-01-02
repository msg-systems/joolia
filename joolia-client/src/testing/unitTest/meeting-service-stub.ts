import { MeetingService } from '../../app/core/services';
import { IMeeting } from '../../app/core/models/meeting.model';
import { of } from 'rxjs';

export class MeetingServiceStub implements Partial<MeetingService> {
    public _startMeetingCalls: any[] = [];

    async startMeeting(meeting: IMeeting) {
        this._startMeetingCalls.push({ meeting });
    }

    _resetStubCalls() {
        this._startMeetingCalls.length = 0;
    }

    getFormatMeeting(formatId: string) {
        return of({ url: 'www.meeting.com/' + formatId, expirationTime: new Date() });
    }

    joinMeeting(_url: string) {
        return this._startMeetingCalls.push('onlineMeetingUrl');
    }
}
