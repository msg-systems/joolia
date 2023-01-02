import { QueryRunner } from 'typeorm';
import { Format, FormatFileEntry, FormatMember, FormatMemberRoles, FormatTemplate, User, Workspace } from '../models';
import { FormatMemberRepo } from '../repositories';
import { KeyVisualService } from './KeyVisualService';

/**
 * TODO: Not a service. Move to custom repo instead.
 */
export class FormatService {
    /**
     * Creates a new format in the database
     * @param formatPartial the data provided by the client or template
     * @param user the user requesting the creation
     * @param workspace the workspace the format will be created into
     * @param runner QueryRunner for saving inside a transaction
     */
    public static async createNewFormat(
        formatPartial: Partial<Format> | Partial<FormatTemplate>,
        user: User,
        workspace: Workspace,
        runner: QueryRunner
    ): Promise<Format> {
        const format = new Format({
            name: formatPartial.name,
            description: formatPartial.description,
            shortDescription: formatPartial.shortDescription,
            createdBy: user,
            files: [],
            workspace: workspace
        });

        for (const file of formatPartial.files) {
            const formatFile = new FormatFileEntry({
                name: file.name,
                contentType: file.contentType,
                size: file.size,
                fileId: file.fileId,
                versionId: file.versionId,
                createdBy: user
            });
            format.files.push(formatFile);
        }
        await runner.manager.getRepository(Format).save(format);
        await KeyVisualService.copyKeyVisual(format, formatPartial.keyVisual, runner);
        const member = new FormatMember();
        member.user = user;
        member.role = FormatMemberRoles.ORGANIZER;
        member.format = format;
        await runner.manager.getCustomRepository(FormatMemberRepo).saveEntity(member);
        return format;
    }
}
