import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';
import { AbstractModelWithoutDateInfo } from './AbstractModel';
import { normalizeStr } from '../utils/helpers';
import { UserSkill } from './internal';

@Entity()
export class Skill extends AbstractModelWithoutDateInfo<Skill> {
    /**
     * Canonical name of this Skill.
     */
    @Column({ nullable: false, type: 'varchar', length: 255, unique: true })
    name: string;

    @OneToMany(() => UserSkill, (userSkill) => userSkill.skill)
    users: UserSkill[];

    /**
     * By design we want to set the canonical name on create but never update it.
     * It is just an easier reference to this object along with its id.
     */
    @BeforeInsert()
    setCanonicalName() {
        this.name = normalizeStr(this.name);
    }
}
