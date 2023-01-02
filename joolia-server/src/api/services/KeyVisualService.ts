import {
    Activity,
    ActivityTemplate,
    Format,
    FormatTemplate,
    KeyVisualEntry,
    KeyVisualFile,
    KeyVisualFileEntry,
    KeyVisualLink,
    KeyVisualRelationType,
    LinkEntry
} from '../models';
import { pick } from 'lodash';
import { FileEntryResponse, linkResponseAttributes } from '../responses';
import { QueryRunner } from 'typeorm';

/**
 * TODO: Not a service. Move to custom repo instead.
 */
export class KeyVisualService {
    /**
     * Copies the key visual from the entities to the templates and from the templates to the entities
     * @param entity new entity created
     * @param oldKeyVisual the key visual from the original entity
     * @param runner
     */
    public static async copyKeyVisual(
        entity: Format | Activity | ActivityTemplate | FormatTemplate,
        oldKeyVisual: KeyVisualEntry,
        runner: QueryRunner
    ): Promise<void> {
        if (!oldKeyVisual) {
            entity.keyVisual = null;
            return;
        }
        if (oldKeyVisual[KeyVisualRelationType.FILE]) {
            // The key visual is an image(file)
            const keyVisualFileEntry = oldKeyVisual[KeyVisualRelationType.FILE];
            const newKeyVisual = new KeyVisualFileEntry({
                name: keyVisualFileEntry.name,
                contentType: keyVisualFileEntry.contentType,
                size: keyVisualFileEntry.size,
                fileId: keyVisualFileEntry.fileId,
                createdBy: keyVisualFileEntry.createdBy,
                versionId: keyVisualFileEntry.versionId
            });

            const keyVisualRelation = new KeyVisualFile();
            keyVisualRelation.keyVisualFile = newKeyVisual;
            entity.keyVisual = keyVisualRelation;
            // Using cascade true in the model was not working that's why three entities are saved separately
            await runner.manager.save([newKeyVisual, keyVisualRelation, entity]);
            entity.keyVisual = pick(newKeyVisual, FileEntryResponse.required);
        } else if (oldKeyVisual[KeyVisualRelationType.LINK]) {
            // The key visual is a video (link)
            const keyVisualLinkEntry = oldKeyVisual[KeyVisualRelationType.LINK];
            const newKeyVisual = new LinkEntry({
                linkUrl: keyVisualLinkEntry.linkUrl,
                createdBy: keyVisualLinkEntry.createdBy,
                createdAt: keyVisualLinkEntry.createdAt
            });
            const keyVisualRelation = new KeyVisualLink();
            keyVisualRelation.keyVisualLink = newKeyVisual;
            entity.keyVisual = keyVisualRelation;
            // Using cascade true in the model was not working that's why three entities are saved separately
            await runner.manager.save([newKeyVisual, keyVisualRelation, entity]);
            entity.keyVisual = pick(keyVisualLinkEntry, linkResponseAttributes); //touched in scope of JOOLIA-1642
        }
    }
}
