import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DurationUnit, List, Phase, PhaseState } from '../models';
import { map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigurationService } from './configuration.service';
import { FormatService } from './format.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { IQueryParams, UtilService } from './util.service';

/**
 * The PhaseService handles all http requests regarding loading and actions on phases on the currently loaded format (saved in the
 * FormatService).
 */
@Injectable({
    providedIn: 'root'
})
export class PhaseService {
    phaseChanged = new Subject<Phase>();
    phaseListChanged = new Subject<List<Phase>>();

    private readonly serverConnection: string;

    private loadedPhase: Phase;
    private loadedPhaseList: List<Phase> = { count: 0, entities: [] };

    constructor(
        private formatService: FormatService,
        private http: HttpClient,
        private config: ConfigurationService,
        private translate: TranslateService
    ) {
        this.serverConnection = this.config.getServerConnection();
    }

    getPhaseDatePickerType(durationUnit: DurationUnit) {
        switch (durationUnit) {
            case DurationUnit.DAYS:
                return 'date';
            case DurationUnit.MINUTES:
                return 'datetime';
        }
    }

    loadPhases(queryParams?: IQueryParams, loadMore?: boolean): Observable<void> {
        const format = this.formatService.getCurrentFormat();
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);

        return this.http
            .get<List<Phase>>(`${this.serverConnection}/format/${format.id}/phase`, { params: httpParams })
            .pipe(
                map((phases: List<Phase>) => {
                    phases.entities.forEach((phase: Phase) => {
                        this.parsePhaseDates(phase);
                    });
                    if (loadMore) {
                        this.loadedPhaseList.count = phases.count;
                        this.loadedPhaseList.entities = this.loadedPhaseList.entities.concat(phases.entities);
                    } else {
                        this.loadedPhaseList = phases;
                    }
                    this.phaseListChanged.next(this.loadedPhaseList);
                })
            );
    }

    loadPhase(id: string, queryParams?: IQueryParams): Observable<Phase> {
        const format = this.formatService.getCurrentFormat();
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);

        return this.http
            .get<Phase>(`${this.serverConnection}/format/${format.id}/phase/${id}`, { params: httpParams })
            .pipe(
                map((phase: Phase) => {
                    this.parsePhaseDates(phase);
                    this.loadedPhase = phase;

                    this.phaseChanged.next(this.loadedPhase);

                    return phase;
                })
            );
    }

    private parsePhaseDates(phase: Phase) {
        phase.startDate = phase.startDate ? moment(phase.startDate) : null;
        phase.endDate = phase.endDate ? moment(phase.endDate) : null;
    }

    getCurrentPhase(): Phase {
        return this.loadedPhase;
    }

    createPhase(body: Partial<Phase>): Observable<Phase> {
        const format = this.formatService.getCurrentFormat();

        return this.http.post<Phase>(`${this.serverConnection}/format/${format.id}/phase`, body);
    }

    createPhaseFromTemplate(templateId: string): Observable<Phase> {
        const format = this.formatService.getCurrentFormat();
        return this.http.post<Phase>(`${this.serverConnection}/format/${format.id}/phase/_template`, { phaseTemplateId: templateId });
    }

    updatePhase(id: string, updatedBody: Partial<Phase>): Observable<void> {
        const format = this.formatService.getCurrentFormat();
        if (updatedBody.name === '') {
            updatedBody.name = this.translate.instant('labels.untitledPhase');
        }
        return this.http.patch<Phase>(`${this.serverConnection}/format/${format.id}/phase/${id}`, updatedBody).pipe(
            map((updatedPhase: Phase) => {
                if (this.loadedPhase) {
                    this.loadedPhase = Object.assign(this.loadedPhase, updatedPhase);
                    this.phaseChanged.next(this.loadedPhase);
                }

                if (this.loadedPhaseList) {
                    this.loadedPhaseList.entities = this.loadedPhaseList.entities.map((phase) => {
                        return phase.id === updatedPhase.id ? Object.assign({}, phase, updatedPhase) : phase;
                    });
                    this.phaseListChanged.next(this.loadedPhaseList);
                }
            })
        );
    }

    deletePhase(id: string): Observable<void> {
        const format = this.formatService.getCurrentFormat();

        return this.http.delete(`${this.serverConnection}/format/${format.id}/phase/${id}`).pipe(
            map(() => {
                this.loadedPhaseList.entities = this.loadedPhaseList.entities.filter((phase) => phase.id !== id);
                this.loadedPhaseList.count = this.loadedPhaseList.entities.length;
                this.phaseListChanged.next(this.loadedPhaseList);
            })
        );
    }

    loadCurrentPhases(queryParams?: IQueryParams): Observable<Phase[]> {
        const format = this.formatService.getCurrentFormat();
        const httpParams: HttpParams = UtilService.buildHttpParams(queryParams);

        return this.http
            .get<List<Phase>>(`${this.serverConnection}/format/${format.id}/phase`, { params: httpParams })
            .pipe(
                map((phases: List<Phase>) => {
                    // sort phases by date
                    phases.entities = phases.entities
                        .map((phase: Phase) => {
                            phase.startDate = moment(phase.startDate);
                            return phase;
                        })
                        .sort((a: Phase, b: Phase) => {
                            if (a.startDate && b.startDate) {
                                return a.startDate.diff(b.startDate);
                            }
                            return 0;
                        });
                    const activePhases = phases.entities.filter((phase: Phase) => phase.status === PhaseState.ACTIVE);
                    if (activePhases.length > 0) {
                        return activePhases;
                    } else {
                        const plannedPhases = phases.entities.filter((phase: Phase) => phase.status === PhaseState.PLANNED);
                        return plannedPhases.length > 0 ? [plannedPhases[0]] : [];
                    }
                })
            );
    }
}
