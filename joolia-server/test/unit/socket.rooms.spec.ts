import { describe } from 'mocha';
import { expect } from 'chai';
import { getRoom, withRoomValidation } from '../../src/sockets/abstractSocket';

async function validate(room: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        withRoomValidation({ room, data: {} }, () => resolve(true));
        resolve(false);
    });
}

describe('Room Validation Tests', () => {
    it('Unknown Room', async () => {
        expect(await validate('/nice-try')).is.false;
    });

    it('Maintenance Room', async () => {
        expect(await validate('/maintenance')).is.true;
    });

    it('Format Chat Room', async () => {
        expect(await validate('/chat/format/some-identifier')).is.true;
    });

    it('Unknown Notification Room', async () => {
        expect(await validate('/notification/try-me/some-identifier')).is.false;
    });

    it('Canvas Notification Room', async () => {
        expect(await validate('/notification/canvas/some-identifier')).is.true;
    });

    it('Get Canvas Notification Room', async () => {
        const room = getRoom(
            '/format/5500f071-de3a-4f2b-befb-2e257fbf8bb8/phase/707e1c58-f962-4cb6-a3b0-c4b6c9a9df6c/activity/36d7d5e7-89ec-4a2a-bbfc-4dd34b80d4f9/canvas/40c4e61a-83c7-443a-a8dc-51a52ee795aa/slot/d3e38dd6-0a16-453e-9c08-0860f1cc33e6/submission'
        );

        expect(room).to.be.eq('/notification/canvas/40c4e61a-83c7-443a-a8dc-51a52ee795aa');
    });
});
