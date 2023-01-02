import { Skill, User } from './internal';
import { Entity, ManyToOne } from 'typeorm';
import { AbstractModelWithoutId } from './AbstractModel';

@Entity()
export class UserSkill extends AbstractModelWithoutId<UserSkill> {
    @ManyToOne(() => Skill, { nullable: false, primary: true })
    public skill: Skill;

    @ManyToOne(() => User, (user) => user.skills, { nullable: false, primary: true })
    public user: User;
}
