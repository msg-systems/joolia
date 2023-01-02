import { Library } from '../models';
import { LibraryView } from '../models/views';
import { RequestBuilder, ResponseBuilder } from './builder';

export class LibraryViewResponse {
    public static readonly attrs = [
        'id',
        'name',
        'memberCount',
        'templateCount',
        'formatTemplateCount',
        'phaseTemplateCount',
        'activityTemplateCount',
        'updatedAt'
    ];

    public constructor(
        public id: string,
        public name: string,
        public updatedAt: Date,
        public memberCount: number,
        public formatTemplateCount: number,
        public activityTemplateCount: number,
        public phaseTemplateCount: number,
        public templateCount: number
    ) {}
}

/**
 * TODO: Keep this approach for request also?
 *  Perhaps this is not necessary to be carried on. This was the first experiment.
 */
export class LibraryRequestBuilder extends RequestBuilder<Library> {
    protected map(o: Partial<Library>): Library {
        return new Library(o);
    }
}

export class LibraryViewResponseBuilder extends ResponseBuilder<LibraryViewResponse> {
    public readonly responseAttrs: string[] = LibraryViewResponse.attrs;

    protected map(libraryView: LibraryView): Partial<LibraryViewResponse> {
        return libraryView;
    }
}
