import { KeyVisualLink, LinkEntry } from '../models';
import { ResponseBuilder } from './builder';
import { LinkType } from '../models/LinkModel';
import { UserResponse, UserResponseBuilder } from './user.response';

export class LinkEntryResponse {
    public static readonly attrs = ['id', 'linkUrl', 'type', 'description', 'updatedAt', 'createdAt', 'createdBy', 'lastAccessedAt'];

    public id: string;
    public linkUrl: string;
    public description: string;
    public type: LinkType;
    public createdAt: Date;
    public updatedAt: Date;
    public createdBy: Partial<UserResponse>;

    public constructor(link: LinkEntry) {
        Object.assign(this, link);
        this.createdBy = link.createdBy ? new UserResponseBuilder().buildOne(link.createdBy) : null;
    }
}

export class LinkEntryResponseBuilder extends ResponseBuilder<LinkEntryResponse> {
    public readonly responseAttrs: string[] = LinkEntryResponse.attrs;

    protected map(entry: LinkEntry | KeyVisualLink): Partial<LinkEntryResponse> {
        if (entry instanceof KeyVisualLink) {
            return new LinkEntryResponse(entry.keyVisualLink);
        }
        return new LinkEntryResponse(entry as LinkEntry);
    }
}
