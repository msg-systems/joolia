import { Router } from 'express';
import { ActivityTemplateController, AuthenticationController, FormatTemplateController, PhaseTemplateController } from '../controllers';
import { transaction } from '../services';

export function createActivityTemplateRouter(): Router {
    const router = Router();
    router.use(transaction());
    router.use(AuthenticationController.authenticate);

    router.route('/').get(ActivityTemplateController.index);

    return router;
}

export function createFormatTemplateRouter(): Router {
    const router = Router();
    router.use(transaction());
    router.use(AuthenticationController.authenticate);

    router.route('/').get(FormatTemplateController.index);

    router
        .route('/:formatTemplateId')
        .all(FormatTemplateController.getFormatTemplate)
        .get(FormatTemplateController.showFormatTemplate)
        .delete(FormatTemplateController.deleteFormatTemplate);

    return router;
}

export function createPhaseTemplateRouter(): Router {
    const router = Router();
    router.use(transaction());
    router.use(AuthenticationController.authenticate);

    router.route('/').get(PhaseTemplateController.index);

    router
        .route('/:phaseTemplateId')
        .all(PhaseTemplateController.getPhaseTemplate)
        .get(PhaseTemplateController.showPhaseTemplate)
        .delete(PhaseTemplateController.deletePhaseTemplate);

    return router;
}
