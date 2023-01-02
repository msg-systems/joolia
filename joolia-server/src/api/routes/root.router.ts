import { Router } from 'express';
import { AuthenticationController, RootController } from '../controllers';
import { userEmailValidation, userPasswordValidation, userValidation } from '../validations';
import { transaction } from '../services';
import { Server } from '../../server';

export function createRootRouter(server: Server): Router {
    const router = Router();
    const rootController = new RootController(server);

    router.route('/').get((...args) => rootController.getServerInfo(...args));

    /**
     * Endpoint to authenticate Web Apps based on cookies, same domain restrictions.
     */
    router.route('/signin').post(transaction(), AuthenticationController.signIn);

    router.route('/signout').post(transaction(), AuthenticationController.authenticateWithCookie, AuthenticationController.signOut);

    router.route('/token').get(transaction(), AuthenticationController.authenticateWithCookie, AuthenticationController.getAuthToken);

    router.route('/signup').post(userValidation, transaction(), AuthenticationController.signUp);

    router.route('/request-password-reset').put(userEmailValidation, transaction(), AuthenticationController.requestPassword);

    router.route('/reset-password').patch(userPasswordValidation, transaction(), AuthenticationController.resetPassword);

    return router;
}
