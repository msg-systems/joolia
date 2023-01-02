import { Router } from 'express';
import {
    AccessController,
    AuthenticationController,
    FormatController,
    FormatMemberController,
    SubmissionController,
    TeamController,
    WorkspaceController,
    MeetingController
} from '../controllers';
import {
    addMembersValidation,
    deleteMembersValidation,
    formatPatchValidation,
    formatPostTemplateValidation,
    formatPostValidation,
    keyVisualValidation,
    checkRoleValidation,
    sendMailValidation
} from '../validations';
import { transaction } from '../services';
import { createPhaseRouter } from './phase.router';
import { createTeamRouter } from './team.router';
import { FormatKeyVisualController } from '../controllers/keyvisuals';
import { FormatFileEntryController } from '../controllers/files';
import { createOrUpdateFileValidation } from '../validations/fileEntryValidator';
import { Server } from '../../server';

export function createFormatRouter(server: Server): Router {
    const fileService = server.getFileService();
    const formatFileEntryController = new FormatFileEntryController(fileService);
    const createFile = (req, res, next): Promise<void> => formatFileEntryController.create(req, res, next);
    const patchFile = (req, res, next): Promise<void> => formatFileEntryController.patchFile(req, res, next);

    const formatKeyVisualFileController = new FormatKeyVisualController(fileService);
    const showKeyVisual = (req, res, next): Promise<void> => formatKeyVisualFileController.showFile(req, res, next);
    const createKeyVisual = (req, res, next): Promise<void> => formatKeyVisualFileController.create(req, res, next);

    const router = Router();
    router.use(transaction());
    router.use(AuthenticationController.authenticate);

    router.use('/:formatId/phase', createPhaseRouter(server));
    router.use('/:formatId/team', createTeamRouter(server));

    router
        .route('/')
        .get(FormatController.index)
        .post(formatPostValidation, FormatController.create);

    router
        .route('/_template')
        .post(formatPostTemplateValidation, WorkspaceController.getWorkspace, FormatController.createFormatFromTemplate);

    router
        .route('/:formatId')
        .all(FormatController.getFormat)
        .get(FormatController.showFormat)
        .delete(AccessController.isFormatOrganizer, FormatController.deleteFormat)
        .patch(formatPatchValidation, AccessController.isFormatOrganizer, FormatController.patchFormat);

    router
        .route('/:formatId/file')
        .all(FormatController.getFormat)
        .get((...args) => formatFileEntryController.index(...args))
        .post(createOrUpdateFileValidation, createFile);

    router
        .route('/:formatId/file/:fileId')
        .all(FormatController.getFormat, (...args) => formatFileEntryController.getFile(...args))
        .get((...args) => formatFileEntryController.showFile(...args))
        .patch(createOrUpdateFileValidation, patchFile)
        .delete((...args) => formatFileEntryController.delete(...args));

    router
        .route('/:formatId/submission')
        .all(FormatController.getFormat, AccessController.checkSubmissionAccess)
        .get(SubmissionController.getFormatSubmissions);

    router
        .route('/:formatId/submission/_filterValues')
        .all(FormatController.getFormat, AccessController.checkSubmissionAccess)
        .get(SubmissionController.getFormatSubmissionFilterValues);

    router
        .route('/:formatId/keyvisual')
        .all(FormatController.getFormat)
        .get((...args) => formatKeyVisualFileController.getFile(...args), showKeyVisual)
        .put(AccessController.isFormatOrganizer, keyVisualValidation, createKeyVisual);

    router
        .route('/:formatId/member')
        .all(FormatController.getFormat)
        .get(FormatMemberController.index)
        .patch(addMembersValidation, checkRoleValidation, AccessController.isFormatOrganizer, FormatMemberController.addMember);

    router
        .route('/:formatId/member/_sendMail')
        .all(FormatController.getFormat)
        .post(sendMailValidation, AccessController.isFormatOrganizer, FormatMemberController.sendMail);

    router
        .route('/:formatId/member/_delete')
        .all(FormatController.getFormat)
        .post(deleteMembersValidation, AccessController.isFormatOrganizer, FormatMemberController.deleteMembers);

    router
        .route('/:formatId/member/:memberId')
        .all(FormatController.getFormat, FormatMemberController.getMember)
        .get(FormatMemberController.showMember)
        .patch(checkRoleValidation, AccessController.isFormatOrganizer, FormatMemberController.updateMember);

    router
        .route('/:formatId/usersAvailableTeams/:memberId')
        .all(FormatController.getFormat, FormatMemberController.getMember)
        .get(TeamController.getAvailableTeams);

    router
        .route('/:formatId/meeting')
        .all(MeetingController.getFormat)
        .get(MeetingController.getMeetingUrl)
        .post(AccessController.isFormatOrganizer, MeetingController.createMeeting, MeetingController.saveMeetingUrl)
        .delete(AccessController.isFormatOrganizer, MeetingController.deleteMeeting);

    return router;
}
