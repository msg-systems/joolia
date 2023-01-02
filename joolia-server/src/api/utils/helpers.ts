import { FormatMemberRoles, Library, LinkEntry, Team, User, UserCanvasSubmission, UserSubmission } from '../models';
import { Request, Response } from 'express';
import { DeepPartial } from 'typeorm';
import { LinkType } from '../models/LinkModel';
import { getConf } from '../../config';

/**
 * @deprecated See JOOLIA-2230
 */
export function isMember(user: DeepPartial<User>, entity: DeepPartial<Team> | DeepPartial<Library>): boolean {
    if (entity instanceof Library) {
        return entity.members.some((u) => u.id === user.id);
    }

    return entity.members.some((m) => m.user.id === user.id);
}

export function isFormatMember(res: Response): boolean {
    if (res) {
        if (res.locals.userRole) {
            return Object.values(FormatMemberRoles).includes(res.locals.userRole);
        }

        throw new Error('userRole not set in locals');
    }

    throw new Error('Unexpected :/');
}

export function isCreator(user: DeepPartial<User>, o: { user?: User; createdBy: User }): boolean {
    if (o instanceof UserSubmission || o instanceof UserCanvasSubmission) {
        return o.user.id === user.id;
    }
    return o.createdBy.id === user.id;
}

export function isOrganizer(res: Response): boolean {
    if (res) {
        if (res.locals.userRole) {
            return res.locals.userRole === FormatMemberRoles.ORGANIZER;
        }

        throw new Error('userRole not set in locals');
    }

    throw new Error('Unexpected :/');
}

export function isTechnicalUser(res: Response): boolean {
    if (res) {
        if (res.locals.userRole) {
            return res.locals.userRole === FormatMemberRoles.TECHNICAL;
        }

        throw new Error('userRole not set in locals');
    }

    throw new Error('Unexpected :/');
}

/**
 * Normalize strings according to some simple rules. See unit test for examples.
 */
export function normalizeStr(s: string): string {
    let normalized = s.replace(/\s/g, '_');
    normalized = normalized.replace(/&/g, 'and');
    normalized = normalized.replace(/-/g, '');
    normalized = normalized.replace(/\//g, '_');
    normalized = normalized.replace(/\\/g, '_');
    normalized = normalized.replace(/(_)+/g, '_');
    return normalized.toUpperCase();
}

/**
 * Checks the link is a meeting link to zoom, skype or teams
 * and returns its @LinkEntry populated with @LinkType
 * @param link
 */
export function createMeetingLink(link: string): LinkEntry {
    const meetingRegEx = getConf().meetingRegExp;
    const zoom = link.match(meetingRegEx.zoomRegExp);
    const teams = link.match(meetingRegEx.teamsRegExp);
    const skype = link.match(meetingRegEx.skypeRegExp);
    const currentDate = new Date();

    if (zoom) {
        // zoom meetings have a 9, 10 or 11 character code for the meeting
        if (9 <= zoom[3].length && zoom[3].length <= 11) {
            return new LinkEntry({ linkUrl: link, type: LinkType.ZOOM, lastAccessedAt: currentDate });
        }
    } else {
        if (teams) {
            return new LinkEntry({ linkUrl: link, type: LinkType.MSTEAMS, lastAccessedAt: currentDate });
        }
        if (skype) {
            return new LinkEntry({ linkUrl: link, type: LinkType.SKYPE, lastAccessedAt: currentDate });
        }
    }

    return null;
}

export function getLocale(request: Request): string {
    const languages = request.acceptsLanguages();
    return languages[0];
}
