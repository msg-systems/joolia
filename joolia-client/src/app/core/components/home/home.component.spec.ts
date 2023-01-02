import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { AuthenticationService } from '../../services';
import { Router } from '@angular/router';
import { MaterialModule } from '..';
import { TranslateModule } from '@ngx-translate/core';
import { AuthenticationServiceStub } from '../../../../testing/unitTest';

const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
const authenticationServiceStub = new AuthenticationServiceStub();

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HomeComponent],
            imports: [MaterialModule, TranslateModule.forRoot()],
            providers: [
                { provide: AuthenticationService, useValue: authenticationServiceStub },
                { provide: Router, useValue: routerSpy }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
