import { IQueryParams, UserService } from '../../app/core/services';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { FileMeta, User } from '../../app/core/models';
import { UserLukeMock } from './mock-objects';

export class UserServiceStub implements Partial<UserService> {
    public _updateProfileCalls: any[] = [];

    loggedInUserChanged: Subject<User> = new Subject();

    getCurrentLoggedInUser(): User {
        return { ...UserLukeMock };
    }

    getCurrentUser(): Observable<User> {
        return of();
    }

    updateProfile(body: any): Observable<void> {
        this._updateProfileCalls.push(body);
        return of();
    }

    _resetStubCalls() {
        this._updateProfileCalls.length = 0;
    }

    isCreatorOf(e: { id: string; createdBy: User }): boolean {
        return false;
    }

    loadAvatarMeta(userId: string, queryParams?: IQueryParams): Observable<FileMeta> {
        return of();
    }

    getSkills(user: User): Subscription {
        return;
    }

    loadLoggedInUser(): Observable<User> {
        return of();
    }

    updateLocalUser() {}
}
