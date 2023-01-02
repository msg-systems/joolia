import { ChildEntity, Column, Entity, JoinColumn, OneToOne, TableInheritance } from 'typeorm';
import { KeyVisualFileEntry, LinkEntry } from './internal';
import { AbstractModel } from './AbstractModel';

export enum KeyVisualRelationType {
    FILE = 'keyVisualFile',
    LINK = 'keyVisualLink'
}

/**
 * The entities format, activity, format template and activity template can have two types of key visuals a file(image)
 * or a link (video)
 */
@Entity()
@TableInheritance({ column: 'relationType' })
export abstract class KeyVisualEntry extends AbstractModel<KeyVisualEntry> {
    @Column({
        select: true,
        nullable: false,
        type: 'enum',
        enum: KeyVisualRelationType
    })
    public relationType: KeyVisualRelationType;
}

@ChildEntity(KeyVisualRelationType.FILE)
export class KeyVisualFile extends KeyVisualEntry {
    @OneToOne(() => KeyVisualFileEntry)
    @JoinColumn()
    public keyVisualFile: KeyVisualFileEntry;

    public constructor(obj?) {
        super(obj);
        this.relationType = KeyVisualRelationType.FILE;
    }
}

@ChildEntity(KeyVisualRelationType.LINK)
export class KeyVisualLink extends KeyVisualEntry {
    @OneToOne(() => LinkEntry)
    @JoinColumn()
    public keyVisualLink: LinkEntry;

    public constructor(obj?) {
        super(obj);
        this.relationType = KeyVisualRelationType.LINK;
    }
}

export function isLinkEntry(entry: KeyVisualEntry): boolean {
    return entry.relationType === KeyVisualRelationType.LINK;
}
