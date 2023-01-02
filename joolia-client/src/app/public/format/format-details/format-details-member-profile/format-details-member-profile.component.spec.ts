import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { FormatService, TeamService, UserService } from 'src/app/core/services';
import { ActivatedRouteStub } from 'src/testing/activated-route-stub';
import { FormatServiceStub, getMockData, TeamServiceStub, UserServiceStub } from 'src/testing/unitTest';

import { FormatDetailsMemberProfileComponent } from './format-details-member-profile.component';

const formatServiceStub = new FormatServiceStub();
const userServiceStub = new UserServiceStub();
const teamServiceStub = new TeamServiceStub();
const activeRouteServiceStub = new ActivatedRouteStub();
const routerSpy = {
    events: of(),
    navigate: jasmine.createSpy(),
    url: ''
};

let mockFormat1;
let mockTeam1;
let mockFormat1MemberLeia;
let mockTeamList;

describe('FormatDetailsMemberProfileComponent', () => {
    let component: FormatDetailsMemberProfileComponent;
    let fixture: ComponentFixture<FormatDetailsMemberProfileComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FormatDetailsMemberProfileComponent],
            providers: [
                { provide: FormatService, useValue: formatServiceStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: TeamService, useValue: teamServiceStub },
                { provide: ActivatedRoute, useValue: activeRouteServiceStub },
                { provide: Router, useValue: routerSpy }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FormatDetailsMemberProfileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mockFormat1 = getMockData('format.format1');
        mockTeam1 = getMockData('team.team1');
        mockFormat1MemberLeia = getMockData('format.member.leia');
        mockTeamList = getMockData('team.list.list1');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should go to the team details when clicking on a team', () => {
        component.member = mockFormat1MemberLeia;
        component.onTeamClick(mockTeam1.id);
        expect(routerSpy.navigate.calls.mostRecent().args[0]).toEqual(['format', mockFormat1.id, 'teams', mockTeam1.id]);
    });
});
