import { Router } from 'express';
import {
    AccessController,
    ActivityController,
    CanvasController,
    CanvasSubmissionController,
    FormatController,
    PhaseController
} from '../controllers';
import { createCanvasValidator, updateCanvasValidator } from '../validations';
import { Server } from '../../server';
import { createCanvasSlotRouter } from './slot.router';

export function createCanvasRouter(server: Server): Router {
    const router = Router({ mergeParams: true });

    router.use(FormatController.getFormat, PhaseController.getPhase, ActivityController.getActivity);

    router.use('/:canvasId/slot', createCanvasSlotRouter(server));

    router
        .route('/')
        .post(createCanvasValidator, AccessController.isFormatOrganizer, CanvasController.create)
        .get(AccessController.isFormatMember, CanvasController.index);

    router
        .route('/:canvasId')
        .all(AccessController.isFormatMember, CanvasController.getCanvas)
        .get(CanvasController.showCanvas)
        .patch(updateCanvasValidator, AccessController.checkCanvasUpdate, CanvasController.patchCanvas)
        .delete(AccessController.isFormatOrganizer, CanvasController.delete);

    router
        .route('/:canvasId/submission')
        .all(AccessController.isFormatMember, CanvasController.getCanvas)
        .get(CanvasSubmissionController.index);

    return router;
}
