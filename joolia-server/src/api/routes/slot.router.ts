import { Router } from 'express';
import {
    AccessController,
    ActivityController,
    CanvasController,
    CanvasSubmissionController,
    FormatController,
    PhaseController
} from '../controllers';
import {
    canvasSubmissionVotePostValidation,
    canvasSubmissionPatchValidation,
    canvasSubmissionPostValidation,
    createCanvasSlotValidator
} from '../validations';
import { Server } from '../../server';
import { NotificationController } from '../controllers/NotificationController';
import { CanvasSlotController } from '../controllers/CanvasSlotController';

export function createCanvasSlotRouter(server: Server): Router {
    const router = Router({ mergeParams: true });
    const notificationController = new NotificationController(server.getNotificationService());
    const notify = (req, res): void => notificationController.notify(req, res);

    router.use(FormatController.getFormat, PhaseController.getPhase, ActivityController.getActivity, CanvasController.getCanvas);

    router.route('/').post(createCanvasSlotValidator, AccessController.isFormatOrganizer, CanvasSlotController.create);

    router
        .route('/:slotId')
        .all(AccessController.isFormatOrganizer, CanvasSlotController.getCanvasSlot)
        .patch(AccessController.checkCanvasSlotUpdate, CanvasSlotController.patchCanvasSlot)
        .delete(CanvasSlotController.deleteCanvasSlot);

    router
        .route('/:slotId/submission')
        .all(CanvasSlotController.getCanvasSlot)
        .post(
            canvasSubmissionPostValidation,
            AccessController.checkCanvasStatus,
            AccessController.checkSubmissionCreate,
            CanvasSubmissionController.create,
            notify
        );

    router
        .route('/:slotId/submission/:submissionId')
        .all(CanvasSlotController.getCanvasSlot, CanvasSubmissionController.getCanvasSubmission)
        .patch(
            canvasSubmissionPatchValidation,
            AccessController.checkSubmissionUpdate,
            CanvasSubmissionController.patchCanvasSubmission,
            notify
        )
        .delete(AccessController.checkSubmissionUpdate, CanvasSubmissionController.deleteCanvasSubmission, notify);

    router
        .route('/:slotId/submission/:submissionId/vote')
        .all(CanvasSlotController.getCanvasSlot, CanvasSubmissionController.getCanvasSubmission)
        .post(
            canvasSubmissionVotePostValidation,
            AccessController.isFormatMember,
            CanvasSubmissionController.postCanvasSubmissionVote,
            notify
        )
        .delete(AccessController.isFormatMember, CanvasSubmissionController.deleteCanvasSubmissionVote, notify);
    return router;
}
