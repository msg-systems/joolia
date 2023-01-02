import { ChildEntity, Column, Entity, Generated, ManyToOne, OneToOne, TableInheritance } from 'typeorm';
import { Activity, ActivityTemplate, Format, FormatTemplate, Submission, Team, User, Workspace } from './internal';
import { AbstractModel } from './AbstractModel';
import * as filenamify from 'filenamify';

/**
 * Discriminator for the entities in the underlying table through Table Inheritance.
 */
enum FileOwnerType {
    FORMAT = 'FormatEntry',
    ACTIVITY = 'ActivityEntry',
    SUBMISSION = 'SubmissionEntry',
    KEYVISUAL = 'KeyVisual',
    FORMAT_TEMPLATE = 'FormatTemplateEntry',
    ACTIVITY_TEMPLATE = 'ActivityTemplateEntry',
    AVATAR = 'AvatarEntry',
    TEAMAVATAR = 'TeamAvatarEntry',
    TEAM = 'TeamEntry',
    WORKSPACE_LOGO = 'WorkspaceLogo'
}

export interface IFileEntry {
    id: string;
    fileId: string;
    name: string;
    contentType: string;
    size: number;
    versionId: string;
    fileUrl?: string;
    createdBy: User;
    createdAt: Date;
    updatedAt: Date;
}

@Entity({ name: 'file_entry' })
@TableInheritance({ column: 'ownerType' })
export abstract class FileEntry extends AbstractModel<IFileEntry> implements IFileEntry {
    @Column({ nullable: false })
    @Generated('uuid')
    public fileId: string;

    @Column({
        select: false,
        nullable: false,
        type: 'enum',
        enum: FileOwnerType
    })
    public ownerType: FileOwnerType;

    private _name: string;

    @Column({
        nullable: false
    })
    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name ? filenamify(name, { maxLength: 255 }) : null;
    }

    @Column({
        nullable: true
    })
    public contentType: string;

    @Column({
        nullable: true,
        default: 0
    })
    public size: number;

    /**
     * User that created this file entry.
     * When it is a One-to-One relation like Logo or Avatar this field is null.
     */
    @ManyToOne(() => User)
    public createdBy: User;

    @Column({
        nullable: true
    })
    public versionId: string;

    public fileUrl: string;
}

@ChildEntity(FileOwnerType.FORMAT)
export class FormatFileEntry extends FileEntry {
    @ManyToOne(() => Format, (format) => format.files)
    public format: Format;

    public constructor(obj?: Partial<IFileEntry>) {
        super(obj);
        this.ownerType = FileOwnerType.FORMAT;
    }
}

@ChildEntity(FileOwnerType.FORMAT_TEMPLATE)
export class FormatTemplateFileEntry extends FileEntry {
    @ManyToOne(() => FormatTemplate, (formatTemplate) => formatTemplate.files)
    public formatTemplate: FormatTemplate;

    public constructor(obj?: Partial<IFileEntry>) {
        super(obj);
        this.ownerType = FileOwnerType.FORMAT_TEMPLATE;
    }
}

@ChildEntity(FileOwnerType.ACTIVITY)
export class ActivityFileEntry extends FileEntry {
    @ManyToOne(() => Activity, (activity) => activity.files)
    public activity: Activity;

    public constructor(obj?: Partial<IFileEntry>) {
        super(obj);
        this.ownerType = FileOwnerType.ACTIVITY;
    }
}

@ChildEntity(FileOwnerType.ACTIVITY_TEMPLATE)
export class ActivityTemplateFileEntry extends FileEntry {
    @ManyToOne(() => ActivityTemplate, (activityTemplate) => activityTemplate.files)
    public activityTemplate: ActivityTemplate;

    public constructor(obj?: Partial<IFileEntry>) {
        super(obj);
        this.ownerType = FileOwnerType.ACTIVITY_TEMPLATE;
    }
}

@ChildEntity(FileOwnerType.SUBMISSION)
export class SubmissionFileEntry extends FileEntry {
    @ManyToOne(() => Submission, (submission) => submission.files)
    public submission: Submission;

    public constructor(obj?: IFileEntry) {
        super(obj);
        this.ownerType = FileOwnerType.SUBMISSION;
    }
}

@ChildEntity(FileOwnerType.KEYVISUAL)
export class KeyVisualFileEntry extends FileEntry {
    public constructor(obj?: Partial<IFileEntry>) {
        super(obj);
        this.ownerType = FileOwnerType.KEYVISUAL;
        this.name = FileOwnerType.KEYVISUAL;
    }
}

@ChildEntity(FileOwnerType.AVATAR)
export class AvatarFileEntry extends FileEntry {
    public constructor(obj?: Partial<IFileEntry>) {
        super(obj);
        this.ownerType = FileOwnerType.AVATAR;
    }
}

@ChildEntity(FileOwnerType.TEAMAVATAR)
export class TeamAvatarFileEntry extends FileEntry {
    public constructor(obj?: Partial<IFileEntry>) {
        super(obj);
        this.ownerType = FileOwnerType.TEAMAVATAR;
    }
}

@ChildEntity(FileOwnerType.TEAM)
export class TeamFileEntry extends FileEntry {
    @ManyToOne(() => Team, (team) => team.files)
    public team: Team;

    public constructor(obj?: Partial<IFileEntry>) {
        super(obj);
        this.ownerType = FileOwnerType.TEAM;
    }
}

@ChildEntity(FileOwnerType.WORKSPACE_LOGO)
export class WorkspaceLogoFileEntry extends FileEntry {
    @OneToOne(() => Workspace, (workspace) => workspace.logo)
    public workspace: Workspace;

    public constructor(obj?: Partial<IFileEntry>) {
        super(obj);
        this.ownerType = FileOwnerType.WORKSPACE_LOGO;
    }
}
