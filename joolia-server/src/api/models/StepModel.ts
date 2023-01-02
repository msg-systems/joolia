import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Activity, StepCheck, User } from './internal';
import { AbstractModel } from './AbstractModel';

@Entity()
export class Step extends AbstractModel<Step> {
    @Column({
        type: 'text',
        nullable: true
    })
    public description: string;

    @Column()
    public position: number;

    @ManyToOne(() => User, { nullable: false })
    public createdBy: User;

    @ManyToOne(() => Activity, (activity) => activity.steps, { nullable: false })
    public activity: Activity;

    @OneToMany(() => StepCheck, (stepCheck) => stepCheck.step)
    public checks: StepCheck[];
}
