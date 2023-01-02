import { IQueryParams, PhaseService } from '../../app/core/services';
import { DurationUnit, List, Phase } from '../../app/core/models';
import { Observable, of, Subject } from 'rxjs';
import { getMockData } from './mock-data';

export class PhaseServiceStub implements Partial<PhaseService> {
    public toggledPhase: Partial<Phase>;

    public phaseListChanged = new Subject<List<Phase>>();

    getPhaseDatePickerType(durationUnit: DurationUnit) {
        switch (durationUnit) {
            case DurationUnit.DAYS:
                return 'date';
            case DurationUnit.MINUTES:
                return 'datetime';
        }
    }

    loadPhases(): Observable<any> {
        return of();
    }

    getCurrentPhase(): Phase {
        return getMockData('phase.phase1');
    }

    updatePhase(phaseId, phase): Observable<any> {
        this.toggledPhase = phase;
        return of();
    }

    loadCurrentPhases(queryParams?: IQueryParams): Observable<Phase[]> {
        return of([]);
    }
}
