import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { FormatTemplateFileEntry, KeyVisualEntry, Library, PhaseTemplate, User } from './internal';
import { AbstractModel } from './AbstractModel';
import { TemplateCategory } from './commons';

@Entity()
export class FormatTemplate extends AbstractModel<FormatTemplate> {
    @Column()
    public name: string;

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
        type: 'enum',
        enum: TemplateCategory,
        default: TemplateCategory.EXPLORE
    })
    public category: TemplateCategory;

    @ManyToOne(() => User)
    public createdBy: User;

    @OneToMany(() => PhaseTemplate, (phaseTemplate) => phaseTemplate.formatTemplate)
    public phaseTemplates: PhaseTemplate[];

    @ManyToOne(() => Library, (library) => library.formatTemplates)
    public library: Library;

    /**
     * @deprecated will be removed
     */
    @Column({ select: false })
    public libraryId: string;

    @OneToOne(() => KeyVisualEntry)
    @JoinColumn()
    public keyVisual: KeyVisualEntry;

    @OneToMany(() => FormatTemplateFileEntry, (file) => file.formatTemplate, { cascade: true })
    public files: FormatTemplateFileEntry[];

    /**
     * @deprecated Aggregations are better handled through views in db.
     */
    public get phaseTemplateCount(): number {
        return this.phaseTemplates ? this.phaseTemplates.length : 0;
    }

    /**
     * @deprecated Aggregations are better handled through views in db.
     */
    public get activityTemplateCount(): number {
        return this.phaseTemplates ? this.phaseTemplates.reduce((acc, phaseTmpl) => acc + phaseTmpl.activityTemplateCount, 0) : 0;
    }
}
