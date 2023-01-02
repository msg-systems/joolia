import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationButtonComponent } from './navigation-button.component';
import { Router } from '@angular/router';

const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

describe('NavigationButtonComponent', () => {
    let component: NavigationButtonComponent;
    let fixture: ComponentFixture<NavigationButtonComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NavigationButtonComponent],
            imports: [TranslateModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [{ provide: Router, useValue: routerSpy }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavigationButtonComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to given destination', () => {
        const routerLinkArg = ['somelink'];
        const queryParams = { somekey: 'somevalue' };
        component.routerLinkArg = routerLinkArg;
        component.queryParams = queryParams;
        component.onNavigateTo();
        expect(routerSpy.navigate).toHaveBeenCalledWith(routerLinkArg, jasmine.objectContaining({ queryParams: queryParams }));
    });
});
