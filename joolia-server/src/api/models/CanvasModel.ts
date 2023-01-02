import { ChildEntity, Column, Entity, ManyToOne, OneToMany, TableInheritance } from 'typeorm';
import { Activity, ActivityTemplate, CanvasSlot, User } from './internal';
import { AbstractModel } from './AbstractModel';

enum CanvasOwnerType {
    ACTIVITY = 'ActivityCanvas',
    ACTIVITY_TEMPLATE = 'ActivityTemplateCanvas'
}

export enum CanvasType {
    PROCESS = 'process',
    QUESTIONNAIRE = 'questionnaire',
    BUSINESS_CANVAS = 'business_canvas',
    CUSTOM_CANVAS = 'custom_canvas'
}

export enum CanvasStatus {
    PUBLISHED = 'published',
    UNPUBLISHED = 'unpublished',
    DRAFT = 'draft'
}

@Entity({ name: 'canvas' })
@TableInheritance({ column: 'ownerType' })
export abstract class Canvas extends AbstractModel<Canvas> {
    @Column({ nullable: false })
    public name: string;

    @Column({ nullable: false, default: CanvasStatus.DRAFT, length: 16 })
    public status: CanvasStatus;

    @OneToMany(() => CanvasSlot, (canvasSlot) => canvasSlot.canvas)
    public slots: CanvasSlot[];

    @Column({ nullable: false })
    public columns: number;

    @Column({ nullable: false })
    public rows: number;

    @Column({
        type: 'enum',
        enum: CanvasType,
        nullable: false,
        default: CanvasType.BUSINESS_CANVAS
    })
    public canvasType: CanvasType;

    @Column({
        select: false,
        nullable: false,
        type: 'enum',
        enum: CanvasOwnerType
    })
    public ownerType: CanvasOwnerType;

    @ManyToOne(() => User, { nullable: false })
    public createdBy: User;
}

@ChildEntity(CanvasOwnerType.ACTIVITY)
export class ActivityCanvas extends Canvas {
    @ManyToOne(() => Activity, (activity) => activity.canvases)
    public activity: Activity;

    public constructor(obj?: Partial<ActivityCanvas>) {
        super(obj);
        this.ownerType = CanvasOwnerType.ACTIVITY;
    }
}

@ChildEntity(CanvasOwnerType.ACTIVITY_TEMPLATE)
export class ActivityTemplateCanvas extends Canvas {
    @ManyToOne(() => ActivityTemplate, (activityTemplate) => activityTemplate.canvases)
    public activityTemplate: ActivityTemplate;

    public constructor(obj?: Partial<ActivityTemplateCanvas>) {
        super(obj);
        this.ownerType = CanvasOwnerType.ACTIVITY_TEMPLATE;
    }
}
