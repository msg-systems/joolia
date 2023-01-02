import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { ActivityTemplate, FormatTemplate, PhaseTemplate, User } from './internal';
import { AbstractModel } from './AbstractModel';

@Entity()
export class Library extends AbstractModel<Library> {
    @Column({
        nullable: true
    })
    public name: string;

    @ManyToOne(() => User)
    public createdBy: User;

    @ManyToMany(() => User, (user) => user.libraries, { onDelete: 'NO ACTION' })
    public members: User[];

    @OneToMany(() => FormatTemplate, (formatTemplate) => formatTemplate.library)
    public formatTemplates: FormatTemplate[];

    @OneToMany(() => PhaseTemplate, (phaseTemplate) => phaseTemplate.library)
    public phaseTemplates: PhaseTemplate[];

    @OneToMany(() => ActivityTemplate, (activityTemplate) => activityTemplate.library)
    public activityTemplates: ActivityTemplate[];
}
