import { Router } from 'express';
import { AccessController, FormatController, MeetingController, SubmissionController, TeamController } from '../controllers';
import { addTeamMemberValidation, createTeamValidation, deleteMembersValidation, updateTeamValidation } from '../validations';
import { TeamAvatarFileEntryController, TeamFileEntryController } from '../controllers/files';
import { createOrUpdateFileValidation } from '../validations/fileEntryValidator';
import { Server } from '../../server';

export function createTeamRouter(server: Server): Router {
    const fileService = server.getFileService();
    const router = Router({ mergeParams: true });

    const teamAvatarFileEntryController = new TeamAvatarFileEntryController(fileService);
    const createAvatar = (req, res, next): Promise<void> => teamAvatarFileEntryController.create(req, res, next);
    const getAvatar = (req, res, next): Promise<void> => teamAvatarFileEntryController.getFile(req, res, next);
    const showAvatar = (req, res, next): Promise<void> => teamAvatarFileEntryController.showFile(req, res, next);

    const teamFileEntryController = new TeamFileEntryController(fileService);
    const listFiles = (req, res, next): Promise<void> => teamFileEntryController.index(req, res, next);
    const getFile = (req, res, next): Promise<void> => teamFileEntryController.getFile(req, res, next);
    const createFile = (req, res, next): Promise<void> => teamFileEntryController.create(req, res, next);
    const showFile = (req, res, next): Promise<void> => teamFileEntryController.showFile(req, res, next);
    const patchFile = (req, res, next): Promise<void> => teamFileEntryController.patchFile(req, res, next);
    const deleteFile = (req, res, next): Promise<void> => teamFileEntryController.delete(req, res, next);

    router.use(FormatController.getFormat);

    router
        .route('/')
        .get(TeamController.index)
        .post(createTeamValidation, AccessController.isFormatMember, TeamController.create);

    router
        .route('/:teamId')
        .all(TeamController.getTeam, AccessController.checkTeamAccess)
        .get(TeamController.showTeam)
        .patch(addTeamMemberValidation, AccessController.checkTeamUpdate, TeamController.addMember)
        .put(updateTeamValidation, AccessController.checkTeamAccess, TeamController.patchTeam)
        .delete(AccessController.checkTeamUpdate, TeamController.deleteTeam);

    router
        .route('/:teamId/submission')
        .all(TeamController.getTeam, AccessController.checkTeamAccess)
        .get(SubmissionController.getTeamSubmission);

    router
        .route('/:teamId/avatar')
        .all(TeamController.getTeam, AccessController.checkTeamAccess)
        .put(createAvatar)
        .get(getAvatar, showAvatar);

    router
        .route('/:teamId/file')
        .all(TeamController.getTeam, AccessController.checkTeamAccess)
        .get(listFiles)
        .post(createOrUpdateFileValidation, createFile);

    router
        .route('/:teamId/file/:fileId')
        .all(TeamController.getTeam, AccessController.checkTeamAccess, getFile)
        .get(showFile)
        .patch(createOrUpdateFileValidation, patchFile)
        .delete(deleteFile);

    router
        .route('/:teamId/availableNewMembers')
        .all(TeamController.getTeam, AccessController.checkTeamAccess)
        .get(TeamController.getAvailableMembers);

    router
        .route('/:teamId/_delete')
        .all(TeamController.getTeam, AccessController.checkTeamAccess)
        .post(deleteMembersValidation, AccessController.checkTeamUpdate, TeamController.deleteMembers);

    router
        .route('/:teamId/meeting')
        .all(MeetingController.getTeam)
        .get(MeetingController.getMeetingUrl)
        .post(MeetingController.createMeeting, MeetingController.saveMeetingUrl)
        .delete(MeetingController.deleteMeeting);

    return router;
}
