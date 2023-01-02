import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PhaseTemplateDetailsComponent } from './phase-template-details.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MomentPipe, DurationPipe } from 'src/app/shared/pipes';
import {
    LibraryService,
    PhaseTemplateService,
    UserService,
    ActivityTemplateService,
    LoggerService,
    SnackbarService,
    UtilService
} from 'src/app/core/services';
import {
    ActivityTemplateServiceStub,
    LibraryServiceStub,
    LoggerServiceStub,
    PhaseTemplateServiceStub,
    UserServiceStub
} from '../../../../testing/unitTest';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

const libraryServiceStub = new LibraryServiceStub();
const phaseTemplateServiceStub = new PhaseTemplateServiceStub();
const userServiceStub = new UserServiceStub();
const activityTemplateServiceStub = new ActivityTemplateServiceStub();
const loggerServiceStub = new LoggerServiceStub();

const routeData = {
    params: of({}),
    snapshot: {
        params: {}
    }
};

describe('PhaseTemplateDetailsComponent', () => {
    let component: PhaseTemplateDetailsComponent;
    let fixture: ComponentFixture<PhaseTemplateDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            declarations: [PhaseTemplateDetailsComponent, MomentPipe, DurationPipe],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: LibraryService, useValue: libraryServiceStub },
                { provide: PhaseTemplateService, useValue: phaseTemplateServiceStub },
                { provide: ActivityTemplateService, useValue: activityTemplateServiceStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: Router, useValue: {} },
                { provide: ActivatedRoute, useValue: routeData },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: SnackbarService, useValue: {} },
                { provide: UtilService, useValue: UtilService }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PhaseTemplateDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
