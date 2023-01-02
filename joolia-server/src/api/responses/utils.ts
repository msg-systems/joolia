import { KeyVisualEntry } from '../models';
import { LinkEntryResponseBuilder } from './linkEntry.response';
import { isLinkEntry } from '../models/KeyVisualModel';
import { FileEntryResponseBuilder } from './fileEntry.response';

export function createKeyVisualResponseBuilder(entry: KeyVisualEntry): FileEntryResponseBuilder | LinkEntryResponseBuilder {
    if (!isLinkEntry(entry)) {
        return new FileEntryResponseBuilder();
    }
    return new LinkEntryResponseBuilder();
}
