import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigurationService } from '../../services/configuration.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigurationServiceStub, TranslateServiceStub } from '../../../../testing/unitTest';
import { FooterComponent } from './footer.component';

const configurationServiceStub = new ConfigurationServiceStub();
const translateServiceStub = new TranslateServiceStub();

describe('Footer', () => {
    let component: FooterComponent;
    let fixture: ComponentFixture<FooterComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            declarations: [FooterComponent],
            providers: [
                { provide: ConfigurationService, useValue: configurationServiceStub },
                { provide: TranslateService, useValue: translateServiceStub }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(FooterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        translateServiceStub._resetStubCalls();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
