import { Column, Entity, ManyToOne } from 'typeorm';
import { ActivityTemplate, User } from './internal';
import { AbstractModel } from './AbstractModel';

@Entity()
export class StepTemplate extends AbstractModel<StepTemplate> {
    @Column({
        type: 'text',
        nullable: true
    })
    public description: string;

    @Column()
    public position: number;

    @ManyToOne(() => User, { nullable: false })
    public createdBy: User;

    @ManyToOne(() => ActivityTemplate, (activityTemplate) => activityTemplate.stepTemplates)
    public activityTemplate: ActivityTemplate;
}
