/* eslint-disable @typescript-eslint/ban-types */

import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { Phase } from '../models';

@EventSubscriber()
export class PhaseSubscriber implements EntitySubscriberInterface<Phase> {
    /**
     * Indicates that this subscriber only listen to Activity events.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    public listenTo(): Function {
        return Phase;
    }

    /**
     * Called before Activity update.
     */
    public beforeUpdate(event: UpdateEvent<Phase>): void {
        if (event.entity.startDate) {
            event.entity.startDate = Phase.roundStartDate(event.entity.startDate, event.databaseEntity.durationUnit);
        }
    }

    /**
     * Called before Activity insert.
     */
    public beforeInsert(event: InsertEvent<Phase>): void {
        if (event.entity.startDate && event.entity.durationUnit) {
            event.entity.startDate = Phase.roundStartDate(event.entity.startDate, event.entity.durationUnit);
        }
    }
}
