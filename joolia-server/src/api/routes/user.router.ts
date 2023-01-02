import { Router } from 'express';
import { AccessController, AuthenticationController, UserController } from '../controllers';
import { profilePatchValidation } from '../validations';
import { transaction } from '../services';
import { UserAvatarFileEntryController } from '../controllers/files';
import { SkillController } from '../controllers';
import { addSkillsValidator } from '../validations';
import { Server } from '../../server';
import { gravedigger } from '../middlewares';

export function createUserRouter(server: Server): Router {
    const avatarFileEntryController = new UserAvatarFileEntryController(server.getFileService());
    const getAvatar = (req, res, next): Promise<void> => avatarFileEntryController.getFile(req, res, next);
    const showAvatar = (req, res, next): Promise<void> => avatarFileEntryController.showFile(req, res, next);
    const createAvatar = (req, res, next): Promise<void> => avatarFileEntryController.create(req, res, next);
    const router = Router();
    router.use(transaction());

    router.route('/checkemail').get(UserController.checkEmail);

    router.use(AuthenticationController.authenticate);

    //TODO: move this route to /profile/skills
    router.route('/skill').get(SkillController.getAllSkills); // When more verbs are needed refactor this to its own controller and router.

    router
        .route('/:userId')
        .all(AccessController.isSystemAdmin, UserController.getUser)
        .get(UserController.showUser)
        .delete(gravedigger, UserController.deleteUser); //TODO: JOOLIA-2400 Find a better place to initialize gravedigger for all delete actions

    router
        .route('/:userId/skill')
        .all(UserController.getUser)
        .get(SkillController.getUserSkills)
        .put(AccessController.isSelf, addSkillsValidator, SkillController.addUserSkills);

    router
        .route('/:userId/skill/:skillId')
        .all(AccessController.isSelf, UserController.getUser)
        .delete(SkillController.deleteUserSkills);

    router
        .route('/:userId/profile')
        .get(UserController.getUser, UserController.showUser)
        .patch(AccessController.isSelf, profilePatchValidation, UserController.updateProfile);

    router
        .route('/:userId/profile/avatar')
        .all(UserController.getUser)
        .put(AccessController.isSelf, createAvatar)
        .get(getAvatar, showAvatar);

    return router;
}
