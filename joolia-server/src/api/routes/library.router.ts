import {
    AccessController,
    ActivityTemplateController,
    AuthenticationController,
    FormatTemplateController,
    LibraryController,
    LibraryMemberController,
    LibraryViewController,
    PhaseTemplateController
} from '../controllers';
import { Router } from 'express';
import { transaction } from '../services';
import {
    activityTemplatePostValidation,
    addMembersValidation,
    deleteMembersValidation,
    formatTemplatePostValidation,
    libraryValidation,
    phaseTemplatePostValidation,
    templatePatchValidation
} from '../validations';
import { ActivityTemplateKeyVisualController, FormatTemplateKeyVisualController } from '../controllers/keyvisuals';
import { ActivityTemplateFileEntryController, FormatTemplateFileEntryController } from '../controllers/files';
import { Server } from '../../server';

export function createLibraryRouter(server: Server): Router {
    const fileService = server.getFileService();
    const activityTemplateKeyVisualController = new ActivityTemplateKeyVisualController(fileService);
    const activityTmplKeyVisualGetFile = (req, res, next): Promise<void> => activityTemplateKeyVisualController.getFile(req, res, next);
    const activityTmplKeyVisualShowFile = (req, res, next): Promise<void> => activityTemplateKeyVisualController.showFile(req, res, next);

    const formatTemplateKeyVisualController = new FormatTemplateKeyVisualController(fileService);
    const formatTmplKeyVisualGetFile = (req, res, next): Promise<void> => formatTemplateKeyVisualController.getFile(req, res, next);
    const formatTmplKeyVisualShowFile = (req, res, next): Promise<void> => formatTemplateKeyVisualController.showFile(req, res, next);

    const formatTemplateFileEntryController = new FormatTemplateFileEntryController(fileService);
    const formatTmplListFiles = (req, res, next): Promise<void> => formatTemplateFileEntryController.index(req, res, next);
    const formatTmplGetFile = (req, res, next): Promise<void> => formatTemplateFileEntryController.getFile(req, res, next);
    const formatTmplShowFile = (req, res, next): Promise<void> => formatTemplateFileEntryController.showFile(req, res, next);

    const activityTemplateFileEntryController = new ActivityTemplateFileEntryController(fileService);
    const activityTmplListFiles = (req, res, next): Promise<void> => activityTemplateFileEntryController.index(req, res, next);
    const activityTmplGetFile = (req, res, next): Promise<void> => activityTemplateFileEntryController.getFile(req, res, next);
    const activityTmplShowFile = (req, res, next): Promise<void> => activityTemplateFileEntryController.showFile(req, res, next);

    const router = Router();
    router.use(transaction());
    router.use(AuthenticationController.authenticate);

    router
        .route('/')
        .post(libraryValidation, AccessController.isSystemAdmin, LibraryController.create)
        .get(LibraryViewController.index);

    router
        .route(`/:libraryId`)
        .all(LibraryController.getLibrary)
        .get(LibraryViewController.getLibraryView, LibraryViewController.showLibraryView)
        .patch(libraryValidation, LibraryController.patchLibrary)
        .delete(AccessController.isSystemAdmin, LibraryController.deleteLibrary);

    router
        .route(`/:libraryId/member`)
        .all(LibraryController.getLibrary)
        .patch(addMembersValidation, LibraryMemberController.addMembers)
        .get(LibraryMemberController.index);

    router
        .route(`/:libraryId/member/_delete`)
        .all(LibraryController.getLibrary)
        .post(deleteMembersValidation, LibraryMemberController.deleteMembers);

    // ActivityTemplate
    router
        .route('/:libraryId/activity-template')
        .all(LibraryController.getLibrary)
        .get(ActivityTemplateController.getTemplatesOfLibrary)
        .post(activityTemplatePostValidation, ActivityTemplateController.create);

    router
        .route('/:libraryId/activity-template/:activityTemplateId')
        .all(LibraryController.getLibrary, ActivityTemplateController.getActivityTemplate)
        .get(ActivityTemplateController.showActivityTemplate)
        .delete(ActivityTemplateController.deleteActivityTemplate)
        .patch(templatePatchValidation, ActivityTemplateController.patchActivityTemplate);

    router
        .route('/:libraryId/activity-template/:activityTemplateId/keyVisual')
        .all(LibraryController.getLibrary, ActivityTemplateController.getActivityTemplate)
        .get(activityTmplKeyVisualGetFile, activityTmplKeyVisualShowFile);

    router
        .route('/:libraryId/activity-template/:activityTemplateId/file')
        .all(LibraryController.getLibrary, ActivityTemplateController.getActivityTemplate)
        .get(activityTmplListFiles);

    router
        .route('/:libraryId/activity-template/:activityTemplateId/file/:fileId')
        .all(LibraryController.getLibrary, ActivityTemplateController.getActivityTemplate)
        .get(activityTmplGetFile, activityTmplShowFile);

    // FormatTemplate
    router
        .route('/:libraryId/format-template')
        .all(LibraryController.getLibrary)
        .get(FormatTemplateController.getFormatTemplatesOfLibrary)
        .post(formatTemplatePostValidation, FormatTemplateController.create);

    router
        .route('/:libraryId/format-template/:formatTemplateId')
        .all(LibraryController.getLibrary, FormatTemplateController.getFormatTemplate)
        .get(FormatTemplateController.showFormatTemplate)
        .delete(FormatTemplateController.deleteFormatTemplate)
        .patch(templatePatchValidation, FormatTemplateController.patchFormatTemplate);

    router
        .route('/:libraryId/format-template/:formatTemplateId/keyVisual')
        .all(LibraryController.getLibrary, FormatTemplateController.getFormatTemplate)
        .get(formatTmplKeyVisualGetFile, formatTmplKeyVisualShowFile);

    router
        .route('/:libraryId/format-template/:formatTemplateId/file')
        .all(LibraryController.getLibrary, FormatTemplateController.getFormatTemplate)
        .get(formatTmplListFiles);

    router
        .route('/:libraryId/format-template/:formatTemplateId/file/:fileId')
        .all(LibraryController.getLibrary, FormatTemplateController.getFormatTemplate)
        .get(formatTmplGetFile, formatTmplShowFile);

    // PhaseTemplate
    router
        .route('/:libraryId/phase-template')
        .all(LibraryController.getLibrary)
        .get(PhaseTemplateController.getPhaseTemplatesOfLibrary)
        .post(phaseTemplatePostValidation, PhaseTemplateController.create);

    router
        .route('/:libraryId/phase-template/:phaseTemplateId')
        .all(LibraryController.getLibrary, PhaseTemplateController.getPhaseTemplate)
        .get(PhaseTemplateController.showPhaseTemplate)
        .delete(PhaseTemplateController.deletePhaseTemplate)
        .patch(templatePatchValidation, PhaseTemplateController.patchPhaseTemplate);

    return router;
}
