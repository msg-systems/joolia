import { Router } from 'express';
import { AccessController, FormatController, PhaseController } from '../controllers';
import { phasePatchValidation, phasePostValidation, phaseTemplateValidation } from '../validations';
import { createActivityRouter } from './activity.router';
import { Server } from '../../server';

export function createPhaseRouter(server: Server): Router {
    const router = Router({ mergeParams: true });

    router.use(FormatController.getFormat);

    router.use('/:phaseId/activity', createActivityRouter(server));

    router
        .route('/')
        .get(PhaseController.index)
        .post(phasePostValidation, AccessController.isFormatOrganizer, PhaseController.create);

    router.route('/_template').post(phaseTemplateValidation, AccessController.isFormatOrganizer, PhaseController.createPhaseFromTemplate);

    router
        .route('/:phaseId')
        .all(PhaseController.getPhase)
        .get(PhaseController.showPhase)
        .patch(phasePatchValidation, AccessController.isFormatOrganizer, PhaseController.patchPhase)
        .delete(AccessController.isFormatOrganizer, PhaseController.deletePhase);

    return router;
}
