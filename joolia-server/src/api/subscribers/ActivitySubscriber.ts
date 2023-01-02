import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { getConf } from '../../config';
import { Activity } from '../models';

@EventSubscriber()
export class ActivitySubscriber implements EntitySubscriberInterface<Activity> {
    /**
     * Indicates that this subscriber only listen to Activity events.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    public listenTo(): Function {
        return Activity;
    }

    /**
     * Called before Activity update.
     */
    public beforeUpdate(event: UpdateEvent<Activity>): void {
        event.entity.roundDuration(getConf().minimumActivityDuration);
    }

    /**
     * Called before Activity insert.
     */
    public beforeInsert(event: InsertEvent<Activity>): void {
        event.entity.roundDuration(getConf().minimumActivityDuration);
    }
}
