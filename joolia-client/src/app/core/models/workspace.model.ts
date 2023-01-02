import { List } from './list.model';
import { User } from './user.model';
import { Me } from './me.model';
import { FileMeta } from './file-meta.model';

/**
 * Model which defines the Workspace
 */
export interface Workspace {
    id: string;
    name: string;
    description: string;
    logo: FileMeta;
    members: List<User>;
    memberCount: number;
    formatCount: number;
    licensesCount: number;
    me: Me;
    logoId: string;
    tenant: string;
    domain: string;
    consentDate: Date;
}
