import { ResponseBuilder } from './builder';

interface MeetingAccessData {
    url: string;
    expirationTime: Date;
}

export class MeetingAccessResponse {
    public static readonly attrs = ['url', 'expirationTime'];

    public url: string;

    public constructor(data: MeetingAccessData) {
        Object.assign(this, data);
    }
}

export class MeetingAccessResponseBuilder extends ResponseBuilder<MeetingAccessResponse> {
    public readonly responseAttrs: string[] = MeetingAccessResponse.attrs;

    protected map(data: MeetingAccessData): Partial<MeetingAccessResponse> {
        return new MeetingAccessResponse(data);
    }
}
