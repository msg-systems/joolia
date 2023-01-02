import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamMemberCardComponent } from './team-member-card.component';
import { MaterialModule } from 'src/app/core/components';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { getMockData } from '../../../../testing/unitTest';
import { UtilService } from '../../../core/services';

let mockUserLuke;

describe('TeamMemberCardComponent', () => {
    let component: TeamMemberCardComponent;
    let fixture: ComponentFixture<TeamMemberCardComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule, TranslateModule.forRoot()],
            declarations: [TeamMemberCardComponent],
            providers: [{ provide: UtilService, useValue: UtilService }],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        mockUserLuke = getMockData('user.luke');

        fixture = TestBed.createComponent(TeamMemberCardComponent);
        component = fixture.componentInstance;
        component.user = mockUserLuke;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit on menuOpenClicked', () => {
        const spy = spyOn(component.menuOpenClick, 'emit').and.callThrough();
        component.onMenuOpenClick(new Event('clicked'));
        expect(spy).toHaveBeenCalled();
    });
});
