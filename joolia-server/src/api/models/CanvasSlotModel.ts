import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Canvas, CanvasSubmission } from './internal';
import { AbstractModel } from './AbstractModel';

export enum SlotType {
    TITLE_ONLY = 'title_only',
    TITLE_AND_SUBMISSIONS = 'title_and_submissions',
    SUBMISSIONS_ONLY = 'submissions_only'
}

@Entity()
export class CanvasSlot extends AbstractModel<CanvasSlot> {
    @ManyToOne(() => Canvas, (canvas) => canvas.slots, { nullable: false })
    public canvas: Canvas;

    @Column({ nullable: true })
    public title: string;

    @Column({ nullable: false })
    public row: number;

    @Column({ nullable: false })
    public column: number;

    @Column({ nullable: false })
    public rowSpan: number;

    @Column({ nullable: false })
    public columnSpan: number;

    @Column({ nullable: false, default: 0 })
    public sortOrder: number;

    @Column({
        type: 'enum',
        enum: SlotType,
        nullable: false,
        default: SlotType.TITLE_AND_SUBMISSIONS
    })
    public slotType: SlotType;

    @OneToMany(() => CanvasSubmission, (canvasSubmission) => canvasSubmission.slot)
    public submissions: CanvasSubmission[];
}
