import { Router } from 'express';
import { AccessController, AuthenticationController, WorkspaceController, WorkspaceMemberController } from '../controllers';
import {
    addMembersValidation,
    deleteMembersValidation,
    workspaceUpdateMemberValidation,
    workspacePatchValidation,
    workspaceCreateValidation
} from '../validations';
import { transaction } from '../services';
import { Server } from '../../server';
import { WorkspaceLogoFileEntryController } from '../controllers/files';

export function createWorkspaceRouter(server: Server): Router {
    const workspaceLogoFileEntryController = new WorkspaceLogoFileEntryController(server.getFileService());
    const createLogo = (req, res, next): Promise<void> => workspaceLogoFileEntryController.create(req, res, next);
    const getLogo = (req, res, next): Promise<void> => workspaceLogoFileEntryController.getFile(req, res, next);
    const showLogo = (req, res, next): Promise<void> => workspaceLogoFileEntryController.showFile(req, res, next);

    const router = Router();
    router.use(transaction());
    router.use(AuthenticationController.authenticate);

    router
        .route('/')
        .get(WorkspaceController.index)
        .post(workspaceCreateValidation, AccessController.isSystemAdmin, WorkspaceController.create);

    router
        .route('/:workspaceId')
        .all(WorkspaceController.getWorkspace)
        .get(WorkspaceController.showWorkspace)
        .patch(workspacePatchValidation, AccessController.isWorkspaceAdmin, WorkspaceController.patchWorkspace)
        .delete(AccessController.isSystemAdmin, WorkspaceController.deleteWorkspace);

    router
        .route('/:workspaceId/member')
        .all(WorkspaceController.getWorkspace)
        .get(WorkspaceMemberController.index)
        .patch(addMembersValidation, AccessController.isWorkspaceAdmin, WorkspaceMemberController.addMembers);

    router
        .route('/:workspaceId/member/_delete')
        .all(AccessController.isSelfInBody, WorkspaceController.getWorkspace)
        .post(deleteMembersValidation, AccessController.isWorkspaceAdmin, WorkspaceMemberController.deleteMembers);

    router
        .route('/:workspaceId/member/:memberId')
        .all(WorkspaceController.getWorkspace, WorkspaceMemberController.getMember)
        .patch(workspaceUpdateMemberValidation, AccessController.isWorkspaceAdmin, WorkspaceMemberController.updateMember);

    router
        .route('/:workspaceId/format')
        .all(WorkspaceController.getWorkspace)
        .get(WorkspaceController.getWorkspaceFormats);

    router
        .route('/:workspaceId/logo')
        .all(WorkspaceController.getWorkspace)
        .put(AccessController.isWorkspaceAdmin, createLogo)
        .get(getLogo, showLogo);

    router
        .route('/:workspaceId/_consent')
        .all(WorkspaceController.getWorkspace)
        .post(AccessController.isWorkspaceAdmin, WorkspaceController.requestAdminConsent);

    return router;
}
