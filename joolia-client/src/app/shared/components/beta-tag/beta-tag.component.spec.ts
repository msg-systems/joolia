import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetaTagComponent } from './beta-tag.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MaterialModule } from '../../../core/components';
import { TranslateServiceStub } from '../../../../testing/unitTest';

const translationServiceStub = new TranslateServiceStub();

describe('BetaTagComponent', () => {
    let component: BetaTagComponent;
    let fixture: ComponentFixture<BetaTagComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule],
            declarations: [BetaTagComponent, TranslatePipe],
            providers: [{ provide: TranslateService, useValue: translationServiceStub }]
        }).compileComponents();

        translationServiceStub._resetStubCalls();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BetaTagComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
