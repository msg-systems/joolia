import { CanvasSlot } from '../models';
import { EntityRepository } from 'typeorm';
import { AbstractRepo } from './abstractRepo';

@EntityRepository(CanvasSlot)
export class CanvasSlotRepository extends AbstractRepo<CanvasSlot> {
    protected entityName = 'canvas_slot';

    public async getEntity(slotId: string): Promise<CanvasSlot> {
        return this.createQueryBuilder(this.entityName)
            .where(`${this.entityName}.id = :sId`, { sId: slotId })
            .getOne();
    }
}
