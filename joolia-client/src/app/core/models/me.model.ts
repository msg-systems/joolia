import { UserRole } from './user.model';

export interface Me {
    userRole?: UserRole;
    isVotedByMe?: boolean;
    isTeamMember?: boolean;
}
