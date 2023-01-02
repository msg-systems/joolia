import { DeepPartial } from 'typeorm';
import { AvatarFileEntry, FormatMember, FormatMemberRoles, Skill, Team, User, UserSkill } from '../models';
import { ResponseBuilder } from './builder';
import { FileEntryResponse, FileEntryResponseBuilder } from './fileEntry.response';

interface TeamDetails {
    id: string;
    name: string;
    memberCount: number;
    avatar: AvatarFileEntry;
    me: {
        isTeamMember: boolean;
    };
}

export class FormatMemberResponse {
    public static readonly attrs = ['id', 'name', 'email', 'company', 'teamCount', 'role', 'pending', 'avatar', 'teams', 'skills'];

    public id: string;
    public name: string;
    public email: string;
    public company: string;
    public teamCount: number;
    public teams: TeamDetails[];
    public skills: Array<Partial<Skill>>;
    public role: FormatMemberRoles;
    public pending: boolean;
    public avatar: Partial<FileEntryResponse>;

    public constructor(formatMember: FormatMember, user: DeepPartial<User>, userIsOrganizer: boolean) {
        this.id = formatMember.user.id;
        this.name = formatMember.user.name;
        this.email = formatMember.user.email;
        this.company = formatMember.user.company;
        this.role = formatMember.role;
        this.pending = formatMember.user.pending;
        this.avatar = formatMember.user.avatar ? formatMember.user.avatar : null;
        this.teamCount = formatMember.teams ? formatMember.teams.length : 0;
        this.teams = formatMember.teams ? this.getTeams(formatMember.teams, user, userIsOrganizer) : null;
        this.skills = formatMember.user.skills ? this.getSkills(formatMember.user.skills) : null;
    }

    public getTeams(teams: Team[], user: DeepPartial<User>, userIsOrganizer: boolean): TeamDetails[] {
        const partialTeams: TeamDetails[] = [];

        teams.forEach((team) => {
            let isTeamMember = false;

            if (userIsOrganizer) {
                isTeamMember = true;
            } else if (!!user) {
                isTeamMember = team.members.some((member) => (member.user ? member.user.id === user.id : false));
            }

            partialTeams.push({
                id: team.id,
                name: team.name,
                avatar: team.avatar,
                memberCount: team.members ? team.members.length : 0,
                me: user ? { isTeamMember: isTeamMember } : null
            });
        });
        return partialTeams;
    }

    public getSkills(userSkills: UserSkill[]): Array<Partial<Skill>> {
        const partialSkills: Array<Partial<Skill>> = [];
        userSkills.forEach((userSkill) => {
            if (!!userSkill.skill) {
                partialSkills.push({ name: userSkill.skill.name });
            }
        });
        return partialSkills;
    }
}

export class FormatMemberResponseBuilder extends ResponseBuilder<FormatMemberResponse> {
    public readonly responseAttrs: string[] = FormatMemberResponse.attrs;

    protected map(formatMember: FormatMember): Partial<FormatMemberResponse> {
        const res = new FormatMemberResponse(formatMember, this.user, this.isOrganizer);

        if (formatMember.user.avatar) {
            /**
             * Improvement: Given the Type from each field in the response we can move this logic to the ResponseBuilder
             * to call further ResponseBuilder hence this code would be unnecessary;
             *
             * Hint: If you copy & paste this snippet to another response think through again about the idea above.
             *
             * TODO: 4rd ;)
             */
            const builder = new FileEntryResponseBuilder();
            res.avatar = builder.buildOne(formatMember.user.avatar);
        }

        return res;
    }
}
