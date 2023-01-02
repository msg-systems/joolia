/* eslint-disable @typescript-eslint/ban-types */

import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { UserRating } from '../models';

@EventSubscriber()
export class UserRatingSubscriber implements EntitySubscriberInterface<UserRating> {
    /**
     * Indicates that this subscriber only listen to Activity events.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    public listenTo(): Function {
        return UserRating;
    }

    /**
     * Called before UserRating update.
     */
    public beforeUpdate(event: UpdateEvent<UserRating>): void {
        if (event.entity.rating) {
            event.entity.rating = UserRating.roundRating(event.entity.rating);
        }
    }

    /**
     * Called before UserRating insert.
     */
    public beforeInsert(event: InsertEvent<UserRating>): void {
        if (event.entity.rating) {
            event.entity.rating = UserRating.roundRating(event.entity.rating);
        }
    }
}
