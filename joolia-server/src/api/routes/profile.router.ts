import { Router } from 'express';
import { AuthenticationController, ProfileController } from '../controllers';
import { transaction } from '../services';
import { UserAvatarFileEntryController } from '../controllers/files';
import { Server } from '../../server';

export function createProfileRouter(server: Server): Router {
    const router = Router();
    router.use(transaction());
    router.use(AuthenticationController.authenticate);
    const avatarFileEntryController = new UserAvatarFileEntryController(server.getFileService());
    const showAvatar = (req, res, next): Promise<void> => avatarFileEntryController.showFile(req, res, next);

    /**
     * Until now no need for transaction at all.
     */
    router.route('/').get(ProfileController.showProfile);

    router.route('/avatar').get(ProfileController.getAvatar, showAvatar);

    return router;
}
