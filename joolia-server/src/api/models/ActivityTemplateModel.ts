import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import {
    ActivityConfiguration,
    ActivityTemplateCanvas,
    Library,
    PhaseTemplate,
    User,
    ActivityTemplateFileEntry,
    KeyVisualEntry,
    StepTemplate
} from './internal';
import { AbstractModel } from './AbstractModel';
import { TemplateCategory } from './commons';

@Entity()
export class ActivityTemplate extends AbstractModel<ActivityTemplate> {
    @Column()
    public name: string;

    @Column()
    public duration: number;

    @Column({
        nullable: true,
        type: 'text'
    })
    public shortDescription: string;

    @Column({
        nullable: true,
        type: 'text'
    })
    public description: string;

    @Column({
        nullable: true
    })
    public position: number;

    @ManyToOne(() => User)
    public createdBy: User;

    @ManyToOne(() => PhaseTemplate, (phaseTemplate) => phaseTemplate.activityTemplates)
    public phaseTemplate: PhaseTemplate;

    @ManyToOne(() => Library, (library) => library.activityTemplates)
    public library: Library;

    @OneToMany(() => StepTemplate, (stepTemplate) => stepTemplate.activityTemplate)
    public stepTemplates: StepTemplate[];

    @OneToOne(() => ActivityConfiguration, { cascade: true })
    @JoinColumn()
    public configuration: ActivityConfiguration;

    @OneToOne(() => KeyVisualEntry)
    @JoinColumn()
    public keyVisual: KeyVisualEntry;

    @OneToMany(() => ActivityTemplateFileEntry, (file) => file.activityTemplate, { cascade: true })
    public files: ActivityTemplateFileEntry[];

    @OneToMany(() => ActivityTemplateCanvas, (activityTemplateCanvas) => activityTemplateCanvas.activityTemplate)
    public canvases: ActivityTemplateCanvas[];

    @Column({
        type: 'enum',
        enum: TemplateCategory,
        default: TemplateCategory.EXPLORE
    })
    public category: TemplateCategory;
}
