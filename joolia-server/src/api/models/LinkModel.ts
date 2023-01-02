import { Column, Entity, ManyToOne } from 'typeorm';
import { Activity, User } from './internal';
import { AbstractModel } from './AbstractModel';

export enum LinkType {
    ZOOM = 'Zoom',
    SKYPE = 'Skype',
    MSTEAMS = 'MSTeams',
    BBB = 'BBB',
    COLLABORATION = 'Collaboration',
    KEY_VISUAL = 'KeyVisual'
}

@Entity()
export class LinkEntry extends AbstractModel<LinkEntry> {
    @Column({
        nullable: false
    })
    public linkUrl: string;

    @Column({
        type: 'enum',
        nullable: false,
        enum: LinkType
    })
    public type: LinkType;

    @Column({
        nullable: true,
        type: 'text'
    })
    public description: string;

    @ManyToOne(() => User)
    public createdBy: User;

    @ManyToOne(() => Activity, (activity) => activity.collaborationLinks)
    public activity: Activity;

    @Column({
        nullable: true
    })
    public lastAccessedAt: Date;
}
