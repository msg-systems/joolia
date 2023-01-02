import { Team, TeamAvatarFileEntry, User } from '../models';
import { ResponseBuilder } from './builder';
import { FormatMemberResponse, FormatMemberResponseBuilder } from './formatMember.response';

export class TeamResponse {
    public static readonly attrs = ['id', 'name', 'members', 'avatar', 'createdBy'];

    public id: string;
    public name: string;
    public members: Array<Partial<FormatMemberResponse>>;
    public avatar: TeamAvatarFileEntry;
    public createdBy: User;

    public constructor(team: Team) {
        this.id = team.id;
        this.name = team.name;
        this.avatar = team.avatar;
        this.createdBy = team.createdBy;

        /**
         * Improvement: Given the Type from each field in the response we can move this logic to the ResponseBuilder
         * to call further ResponseBuilder hence this code would be unnecessary;
         *
         * Hint: If you copy & paste this snippet to another response think through again about the idea above.
         *
         * TODO: 1st
         */
        const formatMemberResBuilder = new FormatMemberResponseBuilder();
        this.members = formatMemberResBuilder.buildMany(team.members);
    }
}

export class TeamResponseBuilder extends ResponseBuilder<TeamResponse> {
    public readonly responseAttrs: string[] = TeamResponse.attrs;

    protected map(team: Team): Partial<TeamResponse> {
        return new TeamResponse(team);
    }
}
