import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ActivityTemplate, FormatTemplate, Library, PhaseDurationUnit, User } from './internal';
import { AbstractModel } from './AbstractModel';
import { TemplateCategory } from './commons';

@Entity()
export class PhaseTemplate extends AbstractModel {
    @Column({
        nullable: true
    })
    public name: string;

    @Column({
        type: 'enum',
        enum: PhaseDurationUnit,
        default: PhaseDurationUnit.MINUTES
    })
    public durationUnit: PhaseDurationUnit;

    @ManyToOne(() => FormatTemplate, (format) => format.phaseTemplates, { nullable: true })
    public formatTemplate: FormatTemplate;

    @OneToMany(() => ActivityTemplate, (activity) => activity.phaseTemplate)
    public activityTemplates: ActivityTemplate[];

    @ManyToOne(() => Library, (library) => library.phaseTemplates, { nullable: false })
    public library: Library;

    @ManyToOne(() => User, { nullable: false })
    public createdBy: User;

    @Column({
        type: 'enum',
        enum: TemplateCategory,
        default: TemplateCategory.EXPLORE
    })
    public category: TemplateCategory;

    public get activityTemplateCount(): number {
        return this.activityTemplates ? this.activityTemplates.length : 0;
    }

    public get duration(): number {
        if (this.activityTemplates) {
            return this.activityTemplates.reduce((acc, activity) => acc + activity.duration, 0);
        }
        return 0;
    }
}
