import { DeepPartial, Repository } from 'typeorm';
import { AbstractModel } from '../models/AbstractModel';
import { ConflictError } from '../errors';

/**
 * @deprecated See AbstractRepo for newer repositories.
 */
export default abstract class AbstractRepository<T extends AbstractModel> extends Repository<T> {
    protected prefix: string;
    protected relations: string[];
    protected dynamicFields: string[] = [];

    /**
     * Patches a specified entity and returns only the updated fields of the entity.
     *
     * @param updatedId The id of the updated entity
     * @param updatedContent The updated content of the specified entity
     */
    public async patch(updatedId: string, updatedContent: DeepPartial<T>): Promise<T> {
        let patchContent;

        try {
            patchContent = await this.save(Object.assign({ id: updatedId }, updatedContent));
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                throw new ConflictError('Duplicated entry.');
            }
            throw e;
        }

        // Remove nullable fields which should not be returned
        const updatedKeys = Object.keys(updatedContent);

        for (const fieldName of Object.keys(patchContent).filter((key) => !updatedKeys.includes(key))) {
            delete patchContent[fieldName];
        }

        patchContent = Object.assign({ id: updatedId }, patchContent);

        return patchContent;
    }
}
