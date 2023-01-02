import { EntityRepository, Repository } from 'typeorm';
import {
    ActivityFileEntry,
    ActivityTemplateFileEntry,
    AvatarFileEntry,
    FileEntry,
    FormatFileEntry,
    FormatTemplateFileEntry,
    KeyVisualFileEntry,
    SubmissionFileEntry,
    TeamAvatarFileEntry,
    TeamFileEntry,
    User,
    WorkspaceLogoFileEntry
} from '../models';

@EntityRepository(FileEntry)
export abstract class FileEntryRepository<T extends FileEntry> extends Repository<T> {
    public async getFileEntry(fileId: string): Promise<T> {
        const fileEntry: FileEntry = await this.createQueryBuilder('file')
            .leftJoinAndSelect('file.createdBy', 'user')
            .where('file.id = :fileId', { fileId })
            .getOne();

        return fileEntry as T;
    }

    public async getFileEntries(entityId: string): Promise<T[]> {
        throw new Error('Not implemented' + entityId);
    }
}

@EntityRepository(FormatFileEntry)
export class FormatFileEntryRepository extends FileEntryRepository<FormatFileEntry> {
    public async getFileEntries(formatId: string): Promise<FormatFileEntry[]> {
        const fileEntries: FormatFileEntry[] = await this.createQueryBuilder('file')
            .leftJoinAndSelect('file.format', 'format')
            .leftJoinAndSelect('file.createdBy', 'user')
            .where('format.id = :id', { id: formatId })
            .andWhere('file.versionId is not NULL')
            .getMany();

        return fileEntries;
    }
}

@EntityRepository(FormatTemplateFileEntry)
export class FormatTemplateFileEntryRepository extends FileEntryRepository<FormatTemplateFileEntry> {
    public async getFileEntries(formatTemplateId: string): Promise<FormatTemplateFileEntry[]> {
        const fileEntries: FormatTemplateFileEntry[] = await this.createQueryBuilder('file')
            .leftJoinAndSelect('file.formatTemplate', 'formatTemplate')
            .leftJoinAndSelect('file.createdBy', 'user')
            .where('formatTemplate.id = :id', { id: formatTemplateId })
            .andWhere('file.versionId is not NULL')
            .getMany();

        return fileEntries;
    }
}

@EntityRepository(ActivityFileEntry)
export class ActivityFileEntryRepository extends FileEntryRepository<ActivityFileEntry> {
    public async getFileEntries(activityId: string): Promise<ActivityFileEntry[]> {
        const fileEntries: ActivityFileEntry[] = await this.createQueryBuilder('file')
            .leftJoinAndSelect('file.activity', 'activity')
            .leftJoinAndSelect('file.createdBy', 'user')
            .where('activity.id = :id', { id: activityId })
            .andWhere('file.versionId is not NULL')
            .getMany();

        return fileEntries;
    }
}

@EntityRepository(ActivityTemplateFileEntry)
export class ActivityTemplateFileEntryRepository extends FileEntryRepository<ActivityTemplateFileEntry> {
    public async getFileEntries(activityTemplateId: string): Promise<ActivityTemplateFileEntry[]> {
        const fileEntries: ActivityTemplateFileEntry[] = await this.createQueryBuilder('file')
            .leftJoinAndSelect('file.activityTemplate', 'activityTemplate')
            .leftJoinAndSelect('file.createdBy', 'user')
            .where('activityTemplate.id = :id', { id: activityTemplateId })
            .andWhere('file.versionId is not NULL')
            .getMany();

        return fileEntries;
    }
}

@EntityRepository(SubmissionFileEntry)
export class SubmissionFileEntryRepository extends FileEntryRepository<SubmissionFileEntry> {
    public async getFileEntries(submissionId: string): Promise<SubmissionFileEntry[]> {
        const fileEntries: SubmissionFileEntry[] = await this.createQueryBuilder('file')
            .leftJoinAndSelect('file.submission', 'submission')
            .leftJoinAndSelect('file.createdBy', 'user')
            .where('submission.id = :id', { id: submissionId })
            .andWhere('file.versionId is not NULL')
            .getMany();

        return fileEntries;
    }
}

@EntityRepository(KeyVisualFileEntry)
export class KeyVisualFileEntryRepository extends FileEntryRepository<KeyVisualFileEntry> {
    // Default from parent
}

@EntityRepository(AvatarFileEntry)
export class AvatarFileEntryRepository extends FileEntryRepository<AvatarFileEntry> {
    public async getAvatarByUserId(userId: string): Promise<AvatarFileEntry> {
        return this.createQueryBuilder('file')
            .innerJoin(User, 'user', 'user.avatarId = file.id')
            .where('user.id = :userId', { userId })
            .getOne();
    }
}

@EntityRepository(TeamAvatarFileEntry)
export class TeamAvatarFileEntryRepository extends FileEntryRepository<TeamAvatarFileEntry> {
    // Parent implementation only
}

@EntityRepository(TeamFileEntry)
export class TeamFileEntryRepository extends FileEntryRepository<TeamFileEntry> {
    public async getFileEntries(teamId: string): Promise<TeamFileEntry[]> {
        const fileEntries: TeamFileEntry[] = await this.createQueryBuilder('file')
            .leftJoinAndSelect('file.team', 'team')
            .leftJoinAndSelect('file.createdBy', 'user')
            .where('team.id = :id', { id: teamId })
            .andWhere('file.versionId is not NULL')
            .getMany();

        return fileEntries;
    }
}

@EntityRepository(WorkspaceLogoFileEntry)
export class WorkspaceLogoFileEntryRepository extends FileEntryRepository<WorkspaceLogoFileEntry> {
    // Parent implementation only
}
