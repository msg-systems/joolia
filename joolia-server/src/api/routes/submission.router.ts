import { Router } from 'express';
import {
    AccessController,
    ActivityController,
    FormatController,
    PhaseController,
    SubmissionController,
    UserCommentController,
    UserRatingController
} from '../controllers';
import { submissionPatchValidation, submissionPostValidation, userCommentPatchValidation, userCommentPostValidation } from '../validations';
import { SubmissionFileEntryController } from '../controllers/files';
import { userRatingPatchValidation } from '../validations/UserRatingValidator';
import { Server } from '../../server';
import { createOrUpdateFileValidation } from '../validations/fileEntryValidator';

export function createSubmissionRouter(server: Server): Router {
    const submissionFileEntryController = new SubmissionFileEntryController(server.getFileService());

    const getFile = (req, res, next): Promise<void> => submissionFileEntryController.getFile(req, res, next);
    const listFiles = (req, res, next): Promise<void> => submissionFileEntryController.index(req, res, next);
    const showFile = (req, res, next): Promise<void> => submissionFileEntryController.showFile(req, res, next);
    const createFile = (req, res, next): Promise<void> => submissionFileEntryController.create(req, res, next);
    const patchFile = (req, res, next): Promise<void> => submissionFileEntryController.patchFile(req, res, next);
    const deleteFile = (req, res, next): Promise<void> => submissionFileEntryController.delete(req, res, next);
    const decreaseSubmissionFileCount = (req, res, next): Promise<void> =>
        submissionFileEntryController.decreaseSubmissionFileCount(req, res, next);

    const router = Router({ mergeParams: true });

    router.use(FormatController.getFormat, PhaseController.getPhase, ActivityController.getActivity);

    router
        .route('/')
        .post(submissionPostValidation, AccessController.checkSubmissionCreate, SubmissionController.create)
        .get(SubmissionController.index);

    router
        .route('/:submissionId')
        .all(SubmissionController.getSubmission)
        .patch(submissionPatchValidation, AccessController.checkSubmissionUpdate, SubmissionController.patchSubmission)
        .delete(AccessController.checkSubmissionUpdate, SubmissionController.delete)
        .get(AccessController.checkSubmissionView, SubmissionController.show);

    router
        .route('/:submissionId/file')
        .all(SubmissionController.getSubmission)
        .get(listFiles)
        .post(createOrUpdateFileValidation, createFile);

    router
        .route('/:submissionId/file/:fileId')
        .all(SubmissionController.getSubmission, getFile)
        .get(showFile)
        .patch(createOrUpdateFileValidation, patchFile)
        .delete(decreaseSubmissionFileCount, deleteFile);

    router
        .route('/:submissionId/comment')
        .all(SubmissionController.getSubmission)
        .get(UserCommentController.index)
        .post(userCommentPostValidation, AccessController.checkSubmissionView, UserCommentController.create);

    router
        .route('/:submissionId/comment/:commentId')
        .all(SubmissionController.getSubmission, UserCommentController.getComment)
        .patch(userCommentPatchValidation, AccessController.checkCommentUpdate, UserCommentController.patchComment)
        .delete(AccessController.checkCommentDelete, UserCommentController.deleteComment)
        .get(AccessController.checkCommentAccess, UserCommentController.showComment);

    router
        .route('/:submissionId/rating')
        .all(SubmissionController.getSubmission, UserRatingController.getRating)
        .patch(userRatingPatchValidation, AccessController.checkSubmissionView, UserRatingController.patchRating)
        .get(UserRatingController.showRating);

    return router;
}
