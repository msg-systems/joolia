import { of } from 'rxjs';
import {
    ActivityTemplateService,
    ConfigurationService,
    FormatTemplateService,
    LibraryService,
    LoggerService,
    PhaseTemplateService,
    UserService,
    ViewTypeService
} from 'src/app/core/services';
import { ViewType } from 'src/app/core/enum/global/view-type.enum';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LibraryTemplateOverviewComponent } from './library-template-overview.component';
import { MaterialModule } from 'src/app/core/components';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRouteStub } from 'src/testing/activated-route-stub';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from 'ngx-webstorage';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { HAMMER_LOADER } from '@angular/platform-browser';
import {
    ActivityTemplateServiceStub,
    ConfigurationServiceStub,
    FormatTemplateServiceStub,
    LibraryServiceStub,
    LoggerServiceStub,
    PhaseTemplateServiceStub,
    SessionStorageServiceStub,
    ViewTypeServiceStub
} from '../../../../../../testing/unitTest';

const libraryServiceStub = new LibraryServiceStub();
const formatTemplateServiceStub = new FormatTemplateServiceStub();
const phaseTemplateServiceStub = new PhaseTemplateServiceStub();
const activityTemplateServiceStub = new ActivityTemplateServiceStub();
const sessionStorageServiceStub = new SessionStorageServiceStub();
const configurationServiceStub = new ConfigurationServiceStub();
const loggerServiceStub = new LoggerServiceStub();
const viewTypeServiceStub = new ViewTypeServiceStub();

const routeStub = new ActivatedRouteStub({ id: 99999 });
const routerSpy = {
    events: of(),
    navigate: jasmine.createSpy(),
    url: ''
};

describe('LibraryTemplateOverviewComponent', () => {
    let component: LibraryTemplateOverviewComponent;
    let fixture: ComponentFixture<LibraryTemplateOverviewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LibraryTemplateOverviewComponent],
            imports: [
                MaterialModule,
                TranslateModule.forRoot(),
                SharedModule,
                NoopAnimationsModule,
                HttpClientTestingModule,
                RouterTestingModule
            ],
            providers: [
                { provide: LibraryService, useValue: libraryServiceStub },
                { provide: FormatTemplateService, useValue: formatTemplateServiceStub },
                { provide: PhaseTemplateService, useValue: phaseTemplateServiceStub },
                { provide: ActivityTemplateService, useValue: activityTemplateServiceStub },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: routeStub },
                { provide: SessionStorageService, useValue: sessionStorageServiceStub },
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: UserService, useValue: {} },
                { provide: AuthorizationService, useValue: {} },
                { provide: LoggerService, useValue: loggerServiceStub },
                { provide: ViewTypeService, useValue: viewTypeServiceStub },
                {
                    provide: HAMMER_LOADER,
                    useValue: () => new Promise(() => {})
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LibraryTemplateOverviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        libraryServiceStub._resetStubCalls();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load library', () => {
        expect(component.library).toBeTruthy();
    });

    it('should load view type from Library Service', () => {
        expect(component.libraryViewType).toBe(ViewType.CARD_VIEW);
    });

    it('should switch between views', async () => {
        component.onViewChanged(ViewType.LIST_VIEW);
        expect(viewTypeServiceStub._setLibraryViewTypeChangedCalls.length).toBe(1);
        expect(viewTypeServiceStub._setLibraryViewTypeChangedCalls.pop()).toBe(ViewType.LIST_VIEW);
    });
});
