import { Router } from 'express';
import { AccessController, ActivityController, FormatController, PhaseController, StepController } from '../controllers';
import { stepCheckPostValidation, stepPatchValidation, stepPostValidation } from '../validations';

export function createStepRouter(): Router {
    const router = Router({ mergeParams: true });

    router.use(FormatController.getFormat, PhaseController.getPhase, ActivityController.getActivity);

    router
        .route('/')
        .get(StepController.index)
        .post(stepPostValidation, AccessController.isFormatOrganizer, StepController.create);

    router
        .route('/:stepId')
        .all(StepController.getStep)
        .patch(stepPatchValidation, AccessController.isFormatOrganizer, StepController.patchStep)
        .delete(AccessController.isFormatOrganizer, StepController.delete);

    router
        .route('/:stepId/_check')
        .all(StepController.getStep)
        .post(stepCheckPostValidation, AccessController.checkStepCheckUpdate, StepController.checkStep);

    return router;
}
