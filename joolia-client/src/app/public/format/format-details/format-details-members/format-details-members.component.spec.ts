import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import {
    DialogStub,
    FormatServiceStub,
    getMockData,
    TeamServiceStub,
    UserServiceStub,
    ViewTypeServiceStub
} from '../../../../../testing/unitTest';
import { FormatService, TeamService, UserService, ViewTypeService } from '../../../../core/services';
import { FormatDetailsMembersComponent } from './format-details-members.component';
import { ViewType } from '../../../../core/enum/global/view-type.enum';
import { UserRoleFilter, UserStatusFilter } from '../../../../core/enum/global/filter.enum';
import { of } from 'rxjs';
import { Router } from '@angular/router';

const userServiceStub = new UserServiceStub();
const formatServiceStub = new FormatServiceStub();
const teamServiceStub = new TeamServiceStub();
const viewTypeServiceStub = new ViewTypeServiceStub();
const dialogStub = new DialogStub({
    invitationText: 'This is a text for the invited users.',
    emails: ['test@test.com', 'hans@test.de'],
    team: getMockData('team.team1')
});
let _snackbarOpenMessage: string;
const snackbarStub = {
    open(message) {
        _snackbarOpenMessage = message;
    }
};
const routerSpy = {
    events: of(),
    navigate: jasmine.createSpy(),
    url: ''
};

let mockFormat1;
let mockUserLeia;
let mockUserLuke;
let mockTeamList;
let mockTeam1;

describe('FormatDetailsMembersComponent', () => {
    let component: FormatDetailsMembersComponent;
    let fixture: ComponentFixture<FormatDetailsMembersComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), InfiniteScrollModule],
            declarations: [FormatDetailsMembersComponent],
            providers: [
                { provide: FormatService, useValue: formatServiceStub },
                { provide: MatDialog, useValue: dialogStub },
                { provide: MatSnackBar, useValue: snackbarStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: TeamService, useValue: teamServiceStub },
                { provide: ViewTypeService, useValue: viewTypeServiceStub },
                { provide: Router, useValue: routerSpy }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(FormatDetailsMembersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        formatServiceStub._resetStubCalls();

        mockFormat1 = getMockData('format.format1');
        mockUserLeia = getMockData('user.leia');
        mockUserLuke = getMockData('user.luke');
        mockTeamList = getMockData('team.list.list1');
        mockTeam1 = getMockData('team.team1');
    });

    it('should load format members onInit', () => {
        expect(component.format.members).toEqual(mockFormat1.members);
    });

    it('should add format members when the input data is correct', () => {
        component.onAddMembers();
        expect(formatServiceStub._addFormatMembersCalls.length).toBe(1);
        expect(formatServiceStub._addFormatMembersCalls[0].invitationText).toBe('This is a text for the invited users.');
        expect(formatServiceStub._addFormatMembersCalls[0].memberEmails.length).toBe(2); // Amount of newly added users
    });

    it('should add member to team', () => {
        component.onMenuOpenClick(mockUserLeia.id);
        component.onAddMemberToTeam(mockFormat1.members.entities[1].id);
        expect(teamServiceStub._addTeamMembersCalls.length).toBe(1);
        expect(teamServiceStub._addTeamMembersCalls[0][0]).toBe(mockFormat1.id);
        expect(teamServiceStub._addTeamMembersCalls[0][1]).toBe(mockTeam1.id);
    });

    it('should go to the format member profile page', () => {
        component.onMemberClick(mockUserLeia.id);
        expect(routerSpy.navigate.calls.mostRecent().args[0]).toEqual(['format', mockFormat1.id, 'members', mockUserLeia.id]);
    });

    it('should remove the correct member', () => {
        component.onRemoveMember(mockUserLeia.id); // princess@alliance.com
        expect(formatServiceStub._removeFormatMemberCalls.length).toBe(1);
        expect(formatServiceStub._removeFormatMemberCalls.pop().memberEmail).toBe(mockUserLeia.email);
    });

    it('should load view type from ViewTypeService', () => {
        expect(component.memberViewType).toBe(ViewType.CARD_VIEW);
    });

    it('should switch between views', async () => {
        component.onViewTypeChanged(ViewType.LIST_VIEW);
        expect(viewTypeServiceStub._setMemberViewTypeChangedCalls.length).toBe(1);
        expect(viewTypeServiceStub._setMemberViewTypeChangedCalls.pop()).toBe(ViewType.LIST_VIEW);
    });

    it('should load filtered format members', () => {
        component.onFilterChange([[UserStatusFilter.REGISTERED], [UserRoleFilter.ORGANIZER]]);
        expect(formatServiceStub._loadFormatMembersCalls.length).toBe(1);
        const args = formatServiceStub._loadFormatMembersCalls.pop();
        expect(args.queryParams).toEqual(
            jasmine.objectContaining({
                filter: 'pending=false,role=organizer'
            })
        );
    });

    describe('Send Mail', () => {
        it('should send a mail to all member', () => {
            component.onSendMailToAll();

            expect(formatServiceStub._sendMailCalls.length).toEqual(1);
            expect(formatServiceStub._sendMailCalls.pop().message).toEqual('message12345');
        });

        it('should send a mail to one member', () => {
            component.onSendMailToMember(mockUserLuke.id);

            expect(formatServiceStub._sendMailCalls.length).toEqual(1);
            expect(formatServiceStub._sendMailCalls.pop().message).toEqual('message12345');
        });
    });

    // TODO: Need to discuss if this is the right way to test this logic
    // it('should change role from participant to organizer', () => {
    //     component.onChangeRole('166178c6-29f8-11e9-b210-d663bd873d93'); // princess@alliance.com
    //     expect(updateFormatMemberRoleCalls.length).toBe(1);
    //     expect(component.format.members.entities.find((member) => member.id === '166178c6-29f8-11e9-b210-d663bd873d93').role)
    //         .toBe(UserRole.ORGANIZER);
    // });
    //
    // it('should change role from organizer to participant if there are more than one organizer', () => {
    //     // Make Leia to organizer so Luke can demote himself to a participant
    //     component.onChangeRole('166178c6-29f8-11e9-b210-d663bd873d93'); // princess@alliance.com
    //     component.onChangeRole('0004a350-29f8-11e9-b210-d663bd873d93'); // luke@alliance.com
    //     expect(updateFormatMemberRoleCalls.length).toBe(2);
    //     expect(component.format.members.entities.find((member) => member.id === '166178c6-29f8-11e9-b210-d663bd873d93').role)
    //         .toBe(UserRole.ORGANIZER);
    //     expect(component.format.members.entities.find((member) => member.id === '0004a350-29f8-11e9-b210-d663bd873d93').role)
    //         .toBe(UserRole.PARTICIPANT);
    // });
    //
    // it('should not change role from organizer to participant if there is only one organizer left', () => {
    //     component.onChangeRole('0004a350-29f8-11e9-b210-d663bd873d93'); // luke@alliance.com
    //     expect(updateFormatMemberRoleCalls.length).toBe(0);
    //     expect(component.format.members.entities.find((member) => member.id === '0004a350-29f8-11e9-b210-d663bd873d93').role)
    //         .toBe(UserRole.ORGANIZER);
    // });
});
