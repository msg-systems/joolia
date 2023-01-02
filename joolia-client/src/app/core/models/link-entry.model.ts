import { LinkType } from '../enum/global/link-type.enum';

export interface LinkEntry {
    id?: string;
    linkUrl: string;
    type?: LinkType;
    description?: string;
}
