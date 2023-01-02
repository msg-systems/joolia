import { Router } from 'express';
import { AccessController, ActivityController, FormatController, PhaseController } from '../controllers';
import {
    activityPatchPositionValidation,
    activityPatchValidation,
    activityPostTemplateValidation,
    activityPostValidation,
    keyVisualValidation
} from '../validations';
import { createStepRouter } from './step.router';
import { createSubmissionRouter } from './submission.router';
import { ActivityKeyVisualController } from '../controllers/keyvisuals';
import { ActivityFileEntryController } from '../controllers/files';
import { createCanvasRouter } from './canvas.router';
import { Server } from '../../server';
import { createOrUpdateFileValidation } from '../validations/fileEntryValidator';

export function createActivityRouter(server: Server): Router {
    const fileService = server.getFileService();
    const activityFileController = new ActivityFileEntryController(fileService);
    const listFiles = (req, res, next): Promise<void> => activityFileController.index(req, res, next);
    const createFile = (req, res, next): Promise<void> => activityFileController.create(req, res, next);
    const getFile = (req, res, next): Promise<void> => activityFileController.getFile(req, res, next);
    const showFile = (req, res, next): Promise<void> => activityFileController.showFile(req, res, next);
    const patchFile = (req, res, next): Promise<void> => activityFileController.patchFile(req, res, next);
    const deleteFile = (req, res, next): Promise<void> => activityFileController.delete(req, res, next);

    const activityKeyVisualController = new ActivityKeyVisualController(fileService);
    const createKeyVisual = (req, res, next): Promise<void> => activityKeyVisualController.create(req, res, next);
    const getKeyVisual = (req, res, next): Promise<void> => activityKeyVisualController.getFile(req, res, next);
    const showKeyVisual = (req, res, next): Promise<void> => activityKeyVisualController.showFile(req, res, next);

    const router = Router({ mergeParams: true });

    router.use(FormatController.getFormat, PhaseController.getPhase);

    router.use('/:activityId/canvas', createCanvasRouter(server));
    router.use('/:activityId/step', createStepRouter());
    router.use('/:activityId/submission', createSubmissionRouter(server));

    router
        .route('/')
        .get(ActivityController.index)
        .post(activityPostValidation, AccessController.checkActivityCreate, ActivityController.create);

    router
        .route('/_template')
        .post(activityPostTemplateValidation, AccessController.isFormatOrganizer, ActivityController.createFromTemplate);

    router
        .route('/:activityId')
        .all(ActivityController.getActivity)
        .get(ActivityController.showActivity)
        .delete(AccessController.checkActivityDelete, ActivityController.deleteActivity)
        .patch(activityPatchValidation, AccessController.checkActivityUpdate, ActivityController.patchActivity);

    router
        .route('/:activityId/_details')
        .all(ActivityController.getActivityWithSubmissionsAndSteps)
        .get(ActivityController.showActivityDetails);

    router
        .route('/:activityId/_position')
        .all(ActivityController.getActivity)
        .patch(activityPatchPositionValidation, AccessController.checkActivityUpdate, ActivityController.updatePosition);

    router
        .route('/:activityId/file')
        .all(ActivityController.getActivity)
        .get(listFiles)
        .post(createOrUpdateFileValidation, createFile);

    router
        .route('/:activityId/file/:fileId')
        .all(ActivityController.getActivity, getFile)
        .get(showFile)
        .patch(createOrUpdateFileValidation, patchFile)
        .delete(deleteFile);

    router
        .route('/:activityId/keyvisual')
        .all(ActivityController.getActivity)
        .get(getKeyVisual, showKeyVisual)
        .put(keyVisualValidation, AccessController.isFormatOrganizer, createKeyVisual);

    return router;
}
