import { Observable, of, Subject } from 'rxjs';
import { List, Submission } from '../../app/core/models';
import { SubmissionService } from '../../app/core/services';
import { getMockData } from './mock-data';

export class SubmissionServiceStub implements Partial<SubmissionService> {
    submissionList = getMockData('submission.list.list1');

    submissionListChanged = new Subject<List<Submission>>();

    loadSubmissionsOfTeam(formatId, teamId, httpParams): Observable<List<Submission>> {
        return of(this.submissionList);
    }

    loadSubmission(submissionId): Observable<Submission> {
        return of(this.submissionList[0]);
    }

    deleteSubmission(formatId, phaseId, activityId, submissionId): Observable<void> {
        this.submissionList = <List<Submission>>{ count: 0, entities: [] };
        this.submissionListChanged.next(this.submissionList);
        return of();
    }
}
