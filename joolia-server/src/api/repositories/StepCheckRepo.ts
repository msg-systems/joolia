import { EntityRepository } from 'typeorm';
import { FormatMember, MemberStepCheck, Step, StepCheck, Team, TeamStepCheck } from '../models';
import { AbstractRepo } from './abstractRepo';

@EntityRepository(StepCheck)
export abstract class StepCheckRepo<T extends StepCheck> extends AbstractRepo<T> {
    protected entityName = 'stepCheck';

    public async uncheck(stepCheck: T): Promise<void> {
        await this.delete(stepCheck.id);
    }

    public abstract check(step: Step, checkedBy: Team | FormatMember): Promise<void>;

    public abstract getEntity(step: Step, checkedById: string): Promise<T>;
}

@EntityRepository(TeamStepCheck)
export class TeamStepCheckRepo extends StepCheckRepo<TeamStepCheck> {
    protected readonly entityName = 'teamStepCheck';

    public getEntity(step: Step, checkedById: string): Promise<TeamStepCheck> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.step`, 'step')
            .innerJoin(`${this.entityName}.team`, 'team')
            .where('step.id = :stepId', { stepId: step.id })
            .andWhere('team.id = :teamId', { teamId: checkedById });

        return qb.getOne();
    }

    public async check(step: Step, team: Team): Promise<void> {
        const check = new TeamStepCheck({ step, team });
        this.save(check, { reload: false });
    }
}

@EntityRepository(MemberStepCheck)
export class MemberStepCheckRepo extends StepCheckRepo<MemberStepCheck> {
    protected readonly entityName = 'memberStepCheck';

    public getEntity(step: Step, checkedById: string): Promise<MemberStepCheck> {
        const qb = this.createQueryBuilder(this.entityName)
            .innerJoin(`${this.entityName}.step`, 'step')
            .innerJoin(`${this.entityName}.member`, 'member')
            .innerJoin('member.user', 'user')
            .where('step.id = :stepId', { stepId: step.id })
            .andWhere('user.id = :userId', { userId: checkedById });

        return qb.getOne();
    }

    public async check(step: Step, member: FormatMember): Promise<void> {
        const check = new MemberStepCheck({ step, member });
        this.save(check, { reload: false });
    }
}
