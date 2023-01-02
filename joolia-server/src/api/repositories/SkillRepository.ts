import { Skill, User, UserSkill } from '../models';
import { EntityRepository } from 'typeorm';
import { EntityManager } from 'typeorm';
import { logger } from '../../logger';

/**
 * This is a Custom Repository that can handle the relation of
 * Users and Skills without being forced to a single Entity.
 */
@EntityRepository()
export class SkillRepository {
    constructor(private manager: EntityManager) {}

    public async getAll(): Promise<Skill[]> {
        const qb = this.manager.createQueryBuilder(Skill, 'skill');
        return qb.getMany();
    }

    public async getSkills(user: User): Promise<Skill[]> {
        const qb = this.manager
            .createQueryBuilder(Skill, 'skill')
            .innerJoin('skill.users', 'skillUser')
            .where('skillUser.userId = :userId', { userId: user.id });

        return qb.getMany();
    }

    public async addSkills(user: User, skillIds: string[]): Promise<Skill[]> {
        logger.silly('Adding %o to %s', skillIds, user.id);
        const skills2Add = await this.manager.findByIds(Skill, skillIds);
        const userSkills = skills2Add.map((skill) => new UserSkill({ user, skill }));
        await this.manager.save(userSkills);
        return this.getSkills(user);
    }

    public async removeSkill(user: User, skillId: string): Promise<void> {
        const qb = this.manager
            .createQueryBuilder()
            .delete()
            .from(UserSkill)
            .where('userId = :userId', { userId: user.id })
            .andWhere('skillId = :skillId', { skillId: skillId });

        await qb.execute();
    }
}
