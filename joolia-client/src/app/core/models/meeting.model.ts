import { MeetingType } from '../enum/global/meeting-type.enum';
import { UserRole } from './user.model';

/**
 * Model Meeting
 */
export interface IMeeting {
    entity: string;
    id: string;
    userRole?: UserRole;
    type: MeetingType;
    authorizationCode?: string;
    formatId: string;
}
