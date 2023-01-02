import { UploadFile } from 'ngx-uploader';
import {
    Activity,
    ActivityConfiguration,
    ActivityTemplate,
    Canvas,
    CanvasSubmission,
    Comment,
    FileMeta,
    Format,
    FormatTemplate,
    KeyVisual,
    Library,
    List,
    PermissionsRole,
    Phase,
    PhaseTemplate,
    Rating,
    Step,
    Submission,
    Team,
    User,
    UserRole,
    Workspace,
    Skill,
    Message,
    ChatRoom,
    MessageBox,
    AdminConsentEmail
} from '../../app/core/models';
import * as activities from '../seedData/activity.json';
import * as activityConfigurations from '../seedData/activityConfiguration.json';
import * as activityTemplates from '../seedData/activityTemplate.json';
import * as comments from '../seedData/comment.json';
import * as files from '../seedData/file.json';
import * as formats from '../seedData/format.json';
import * as formatTemplates from '../seedData/formatTemplate.json';
import * as keyVisuals from '../seedData/keyVisual.json';
import * as libraries from '../seedData/library.json';
import * as permissions from '../seedData/permissions.json';
import * as phases from '../seedData/phase.json';
import * as phaseTemplates from '../seedData/phaseTemplate.json';
import * as ratings from '../seedData/rating.json';
import * as steps from '../seedData/step.json';
import * as submissions from '../seedData/submission.json';
import * as teams from '../seedData/team.json';
import * as users from '../seedData/user.json';
import * as workspaces from '../seedData/workspace.json';
import * as canvases from '../seedData/canvas.json';
import * as canvasSubmissions from '../seedData/canvasSubmission.json';
import { cloneDeep } from 'lodash-es';
import { canvasTemplateConfig } from '../../environments/canvas-config';
import * as skills from '../seedData/skill.json';
import * as messages from '../seedData/message.json';
import * as chatRooms from '../seedData/chatRoom.json';
import { FormatMember } from 'src/app/core/models/format-member.model';

// ******************************************************************************************************************************
// Users
// ******************************************************************************************************************************
export const UserLukeMock = (users.luke as unknown) as User;
export const UserLeiaMock = (users.leia as unknown) as User;
export const UserAnakinMock = (users.anakin as unknown) as User;
export const UserGeorgeMock = (users.george as unknown) as User;
export const UserObiWanMock = (users.obiwan as unknown) as User;
export const UserShaakMock = (users.shaak as unknown) as User;
export const UserMickeyMock = (users.mickey as unknown) as User;

// ******************************************************************************************************************************
// Workspace
// ******************************************************************************************************************************

//Workspace Admin Consent Email Data
export const WorkspaceAdminConsentEmail: AdminConsentEmail = {
    adminEmail: 'admin@test.com',
    message: 'Lorem ipsum',
    redirectUri: 'www.test.com/callback',
    domain: 'test.group'
};

// Workspace Member Sets
export const Workspace1MemberSet = [UserLukeMock, UserLeiaMock];
export const Workspace2MemberSet = [UserObiWanMock, UserGeorgeMock, UserLukeMock];
export const Workspace3MemberSet = [UserShaakMock, UserAnakinMock];
export const Workspace4MemberSet = [UserShaakMock, UserAnakinMock];
export const Workspace5MemberSet = [UserShaakMock, UserAnakinMock];

// Workspace Members
export const Workspace1MembersListMock: List<User> = { count: Workspace1MemberSet.length, entities: Workspace1MemberSet };
export const Workspace2MembersListMock: List<User> = { count: Workspace2MemberSet.length, entities: Workspace2MemberSet };
export const Workspace3MembersListMock: List<User> = { count: Workspace3MemberSet.length, entities: Workspace3MemberSet };
export const Workspace4MembersListMock: List<User> = { count: Workspace4MemberSet.length, entities: Workspace4MemberSet };
export const Workspace5MembersListMock: List<User> = { count: Workspace5MemberSet.length, entities: Workspace5MemberSet };

// Workspaces
export const Workspace1Mock = (workspaces.workspace1 as unknown) as Workspace;
Workspace1Mock.members = Workspace1MembersListMock;
Workspace1Mock.members.entities.forEach((u) => (u.role = UserRole.PARTICIPANT));
Workspace1Mock.members.entities[0].role = UserRole.ADMIN;
Workspace1Mock.memberCount = Workspace1MembersListMock.count;

export const Workspace2Mock = (workspaces.workspace2 as unknown) as Workspace;
Workspace2Mock.members = Workspace2MembersListMock;
Workspace2Mock.memberCount = Workspace2MembersListMock.count;

export const Workspace3Mock = (workspaces.workspace3 as unknown) as Workspace;
Workspace3Mock.members = Workspace3MembersListMock;
Workspace3Mock.memberCount = Workspace3MembersListMock.count;

export const Workspace4Mock = (workspaces.workspace4 as unknown) as Workspace;
Workspace4Mock.members = Workspace4MembersListMock;
Workspace4Mock.memberCount = Workspace4MembersListMock.count;

export const Workspace5Mock = (workspaces.workspace5 as unknown) as Workspace;
Workspace5Mock.members = Workspace5MembersListMock;
Workspace5Mock.memberCount = Workspace5MembersListMock.count;

// Workspace Sets
export const WorkspaceSet1 = [Workspace1Mock, Workspace2Mock, Workspace3Mock, Workspace4Mock, Workspace5Mock];

// Workspace List
export const WorkspaceListMock: List<Workspace> = { count: WorkspaceSet1.length, entities: WorkspaceSet1 };

// ******************************************************************************************************************************
// Library
// ******************************************************************************************************************************

// Library Member Sets
export const Library1MemberSet = [UserLeiaMock, UserLukeMock];

// Library Members
export const Library1MembersListMock: List<User> = { count: Library1MemberSet.length, entities: Library1MemberSet };

export const Library1Mock = (libraries.library1 as unknown) as Library;
Library1Mock.members = Library1MembersListMock;
Library1Mock.memberCount = Library1MembersListMock.count;

// Library Sets
export const LibrarySet1 = [Library1Mock];

// Activity Lists
export const LibraryList1Mock: List<Library> = { count: LibrarySet1.length, entities: LibrarySet1 };
// ******************************************************************************************************************************
// FileMeta Mock
// ******************************************************************************************************************************
export const File1Mock = (files.file1 as unknown) as FileMeta;
File1Mock.createdBy = UserLukeMock;

export const File2Mock = (files.file2 as unknown) as FileMeta;
File2Mock.createdBy = UserLukeMock;

// Activity Sets
export const FileSet1: FileMeta[] = [File1Mock, File2Mock];

// Activity Lists
export const FileList1Mock: List<FileMeta> = { count: FileSet1.length, entities: FileSet1 };

// ******************************************************************************************************************************
// KeyVisual Mock
// ******************************************************************************************************************************
export const KeyVisual1Mock = (keyVisuals.keyVisual1 as unknown) as KeyVisual;
KeyVisual1Mock.createdBy = UserLukeMock;

export const KeyVisual2Mock = (keyVisuals.keyVisual2 as unknown) as KeyVisual;
KeyVisual2Mock.createdBy = UserLeiaMock;

// ******************************************************************************************************************************
// Format Template Mock
// ******************************************************************************************************************************
export const Format1TemplateMock = (formatTemplates.formatTemplate1 as unknown) as FormatTemplate;
Format1TemplateMock.files = FileSet1;
Format1TemplateMock.keyVisual = null;
Format1TemplateMock.createdBy = UserLukeMock;

// Format Template Sets
export const FormatTemplateSet1 = [Format1TemplateMock];

// Format Template Lists
export const FormatTemplateList1Mock: List<FormatTemplate> = { count: FormatTemplateSet1.length, entities: FormatTemplateSet1 };

// ******************************************************************************************************************************
// Phase Template Mock
// ******************************************************************************************************************************
export const Phase1TemplateMock = (phaseTemplates.phaseTemplate1 as unknown) as PhaseTemplate;
Phase1TemplateMock.createdBy = UserLukeMock;

// Phase Template Sets
export const PhaseTemplateSet1 = [Phase1TemplateMock];

// Phase Template Lists
export const PhaseTemplateList1Mock: List<PhaseTemplate> = { count: PhaseTemplateSet1.length, entities: PhaseTemplateSet1 };

// ******************************************************************************************************************************
// Step Mock
// ******************************************************************************************************************************
export const Step1Mock = (steps.step1 as unknown) as Step;
export const Step2Mock = (steps.step2 as unknown) as Step;
export const Step3Mock = (steps.step3 as unknown) as Step;
export const Step4Mock = (steps.step4 as unknown) as Step;
export const Step5Mock = (steps.step5 as unknown) as Step;
export const Step6Mock = (steps.step6 as unknown) as Step;

// Step Sets
export const StepSet1 = [Step1Mock, Step2Mock, Step3Mock, Step4Mock, Step5Mock, Step6Mock];

// Step Lists
export const StepList1Mock: List<Step> = { count: StepSet1.length, entities: StepSet1 };

// ******************************************************************************************************************************
// Activity Configuration Mock
// ******************************************************************************************************************************
export const Activity1ConfigurationMock = (activityConfigurations.activityConfig1 as unknown) as ActivityConfiguration;
export const Activity2ConfigurationMock = (activityConfigurations.activityConfig2 as unknown) as ActivityConfiguration;
export const Activity3ConfigurationMock = (activityConfigurations.activityConfig3 as unknown) as ActivityConfiguration;

// ******************************************************************************************************************************
// Activity Template Mock
// ******************************************************************************************************************************
export const Activity1TemplateMock = (activityTemplates.activityTemplate1 as unknown) as ActivityTemplate;
Activity1TemplateMock.createdBy = UserLukeMock;
Activity1TemplateMock.stepTemplates = [Step6Mock];
Activity1TemplateMock.configuration = Activity1ConfigurationMock;

// Activity Template Sets
export const ActivityTemplateSet1 = [Activity1TemplateMock];

// Activity Template Lists
export const ActivityTemplateList1Mock: List<ActivityTemplate> = { count: ActivityTemplateSet1.length, entities: ActivityTemplateSet1 };

// ******************************************************************************************************************************
// Format Members Mock
// ******************************************************************************************************************************
export const Format1MembersListMock = Workspace1MembersListMock;
export const Format2MembersListMock = Workspace1MembersListMock;

// ******************************************************************************************************************************
// Teams Mock
// ******************************************************************************************************************************
// Team Members
export const TeamMembers = [Format1MembersListMock.entities[0]];

export const Team1Mock = (teams.team1 as unknown) as Team;
Team1Mock.members = TeamMembers;
Team1Mock.createdBy = Format1MembersListMock.entities[0];
Team1Mock.avatar = File1Mock;

// ******************************************************************************************************************************
// Format Teams Mock
// ******************************************************************************************************************************
export const Teams1Set = [Team1Mock];
export const Team1ListMock: List<Team> = { count: Teams1Set.length, entities: Teams1Set };

// Format Mock
// ******************************************************************************************************************************
export const Format1Mock = (formats.format1 as unknown) as Format;
Format1Mock.createdBy = UserLukeMock;
Format1Mock.members = Format1MembersListMock;
Format1Mock.members.entities.forEach((u) => (u.role = UserRole.PARTICIPANT));
Format1Mock.members.entities[0].role = UserRole.ORGANIZER;
Format1Mock.memberCount = Format1MembersListMock.count;
Format1Mock.teams = Team1ListMock;
Format1Mock.workspaceId = Workspace1Mock.id;
Format1Mock.teamCount = Team1ListMock.count;

export const Format2Mock = (formats.format2 as unknown) as Format;
Format2Mock.createdBy = UserLukeMock;
Format2Mock.workspaceId = Workspace1Mock.id;
Format2Mock.memberCount = 1; // creator

// Format Sets
export const FormatSet1 = [Format1Mock];

// Format Lists
export const FormatList1Mock: List<Format> = { count: FormatSet1.length, entities: FormatSet1 };

// Phase Mock
// ******************************************************************************************************************************
export const Phase1Mock = (phases.phase1 as unknown) as Phase;
export const Phase2Mock = (phases.phase2 as unknown) as Phase;
export const Phase3Mock = (phases.phase3 as unknown) as Phase;

// Phase Sets
export const PhaseSet1 = [Phase1Mock, Phase2Mock, Phase3Mock];

// Phase Lists
export const PhaseList1Mock: List<Phase> = { count: PhaseSet1.length, entities: PhaseSet1 };

// Submission Mock
// ******************************************************************************************************************************
export const Submission1Mock = (submissions.submission1 as unknown) as Submission;
Submission1Mock.submittedBy.team = Team1ListMock.entities[0];
Submission1Mock.submittedBy.user = undefined;
Submission1Mock.createdBy = Team1ListMock.entities[0].members[1];

// Submission Sets
export const SubmissionSet1 = [Submission1Mock];

// Submission Lists
export const SubmissionList1Mock: List<Submission> = { count: SubmissionSet1.length, entities: SubmissionSet1 };

// Activity Mock
// ******************************************************************************************************************************
export const Activity1Mock = (activities.activity1 as unknown) as Activity;
Activity1Mock.keyVisual = KeyVisual1Mock;
Activity1Mock.configuration = Activity1ConfigurationMock;
Activity1Mock.files = [];
Activity1Mock.submissionCount = 1;

export const Activity2Mock = (activities.activity2 as unknown) as Activity;
Activity2Mock.keyVisual = null;
Activity2Mock.configuration = Activity2ConfigurationMock;
Activity2Mock.files = [];

export const Activity3Mock = (activities.activity3 as unknown) as Activity;
Activity3Mock.keyVisual = null;
Activity3Mock.configuration = Activity3ConfigurationMock;
Activity3Mock.files = [];

// Activity Sets
export const ActivitySet1 = [Activity1Mock, Activity2Mock, Activity3Mock];

// Activity Lists
export const ActivityList1Mock: List<Activity> = { count: ActivitySet1.length, entities: ActivitySet1 };

// Permission Role Mock
// ******************************************************************************************************************************
export const PermissionRole1Mock = (permissions.permission1 as unknown) as PermissionsRole;
export const PermissionRole2Mock = (permissions.permission2 as unknown) as PermissionsRole;

// Permission Sets
export const PermissionRoleSet1 = [PermissionRole1Mock, PermissionRole2Mock];

// Permission Lists
export const PermissionRoleList1Mock: List<PermissionsRole> = { count: PermissionRoleSet1.length, entities: PermissionRoleSet1 };

// Comment Mock
// ******************************************************************************************************************************
export const Comment1Mock = (comments.comment1 as unknown) as Comment;
Comment1Mock.createdBy = UserLukeMock;

export const Comment2Mock = (comments.comment2 as unknown) as Comment;
Comment2Mock.createdBy = UserLukeMock;

export const Comment3Mock = (comments.comment3 as unknown) as Comment;
Comment3Mock.createdBy = UserLukeMock;

export const Comment4Mock = (comments.comment4 as unknown) as Comment;
Comment4Mock.createdBy = UserLukeMock;

export const Comment5Mock = (comments.comment5 as unknown) as Comment;
Comment5Mock.createdBy = UserLukeMock;

// Comment Sets
export const CommentSet1 = [Comment1Mock, Comment2Mock, Comment3Mock, Comment4Mock, Comment5Mock];

// Comment Lists
export const CommentList1Mock: List<Comment> = { count: CommentSet1.length, entities: CommentSet1 };

// Rating Mock
// ******************************************************************************************************************************
export const Rating1Mock = (ratings.rating1 as unknown) as Rating;
Rating1Mock.createdBy = UserLukeMock;

export const Rating2Mock = (ratings.rating2 as unknown) as Rating;
Rating2Mock.createdBy = UserLukeMock;

export const Rating3Mock = (ratings.rating3 as unknown) as Rating;
Rating3Mock.createdBy = UserLukeMock;

// Comment Sets
export const RatingSet1 = [Rating1Mock, Rating2Mock, Rating3Mock];

// Comment Lists
export const RatingList1Mock: List<Rating> = { count: RatingSet1.length, entities: RatingSet1 };

// Skill Mock
// ******************************************************************************************************************************
export const Skill1Mock = (skills.skill1 as unknown) as Skill;
export const Skill2Mock = (skills.skill2 as unknown) as Skill;
export const Skill3Mock = (skills.skill3 as unknown) as Skill;

export const SkillSet1 = [Skill1Mock, Skill2Mock, Skill3Mock];
export const SkillSet2 = [Skill1Mock, Skill2Mock];
export const SkillSet3 = [Skill1Mock];

UserMickeyMock.skills = SkillSet2;

// UploadFile Mock
// ******************************************************************************************************************************

export const FileUpload1Mock: UploadFile = {
    id: '1234',
    fileIndex: 1,
    name: 'mypic.jpg',
    lastModifiedDate: new Date(),
    size: 223333,
    type: 'image/jpeg',
    form: undefined,
    progress: undefined
};

// Extension: Format Mock
// ******************************************************************************************************************************
Format1Mock.submissionCount = SubmissionList1Mock.count;
Format1Mock.phaseCount = PhaseList1Mock.count;
Format1Mock.activityCount = ActivityList1Mock.count;
Format1Mock.commentCount = CommentList1Mock.count;

// Meeting Mock
// ******************************************************************************************************************************
export const Meeting1Mock = { url: 'https://meeting.joolia.live/bigbluebutton/api/join?meetingID=123' };
export const Meeting2Mock = {
    url:
        'https://teams.microsoft.com/l/meetup-join/19%3ameeting_ZWVhNDExNTktMmUyZi00OTY0LThiZjctZjA3MWM5YTJjNjg1%40thread.v2/0?context=%7b%22Tid%22%3a%22common%22%2c%22Oid%22%3a%220fbd2cc2-ffb7-4a1e-ace7-0204878779ad%22%7d'
};
export const MeetingAuthorizationUrlMSTeamsMock =
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_type=code&client_id=29ec089d-e7ae-4c17-93b7-53b25904eb7a&scope=OnlineMeetings.ReadWrite&redirect_uri=' +
    encodeURI(location.origin) +
    '/callback&state=eyJlbnRpdHkiOiJGb3JtYXQiLCJpZCI6ImY4ZjczYzhmLTFlMDktNGNmNi1iMDc1LWU4OGFkMGI5YzA0YiIsImZvcm1hdElkIjoiZjhmNzNjOGYtMWUwOS00Y2Y2LWIwNzUtZTg4YWQwYjljMDRiIiwidHlwZSI6Ik1TVGVhbXMifQ%3D%3D';

// Canvas Mock
// ******************************************************************************************************************************
export const Canvas1Mock = Object.assign({}, cloneDeep(canvasTemplateConfig.canvases[0]), canvases.canvas1 as unknown) as Canvas;
Canvas1Mock.slots.forEach((slot) => {
    slot.id = slot.sortOrder.toString();
    slot.submissions = [];
});

export const Canvas2Mock = Object.assign({}, cloneDeep(canvasTemplateConfig.canvases[1]), canvases.canvas2 as unknown) as Canvas;
Canvas2Mock.slots.forEach((slot) => {
    slot.id = slot.sortOrder.toString();
    slot.submissions = [];
});

export const Canvas3Mock = Object.assign({}, cloneDeep(canvasTemplateConfig.canvases[2]), canvases.canvas3 as unknown) as Canvas;
Canvas3Mock.slots.forEach((slot) => {
    slot.id = slot.sortOrder.toString();
    slot.submissions = [];
});

export const Canvas4Mock = Object.assign({}, cloneDeep(canvasTemplateConfig.canvases[3]), canvases.canvas4 as unknown) as Canvas;
Canvas4Mock.slots.forEach((slot) => {
    slot.id = slot.sortOrder.toString();
    slot.submissions = [];
});

export const CanvasSet1 = [Canvas1Mock, Canvas2Mock, Canvas3Mock, Canvas4Mock];
export const CanvasList1Mock: List<Canvas> = { count: CanvasSet1.length, entities: CanvasSet1 };

export const CanvasSubmission1Mock = (canvasSubmissions.canvasSubmission1 as unknown) as CanvasSubmission;
CanvasSubmission1Mock.createdBy = UserLukeMock;
CanvasSubmission1Mock.submittedBy = {
    user: UserLukeMock,
    team: null
};

export const CanvasSubmission2Mock = (canvasSubmissions.canvasSubmission2 as unknown) as CanvasSubmission;
CanvasSubmission2Mock.createdBy = UserLukeMock;
CanvasSubmission2Mock.submittedBy = {
    user: UserLukeMock,
    team: null
};

export const CanvasSubmission3Mock = (canvasSubmissions.canvasSubmission3 as unknown) as CanvasSubmission;
CanvasSubmission3Mock.createdBy = UserLukeMock;
CanvasSubmission3Mock.submittedBy = {
    user: null,
    team: Team1Mock
};

export const CanvasSubmissionSet1 = [CanvasSubmission1Mock, CanvasSubmission2Mock];
export const CanvasSubmissionList1Mock: List<CanvasSubmission> = { count: CanvasSubmissionSet1.length, entities: CanvasSubmissionSet1 };

// Message Mock
// ******************************************************************************************************************************
export const Message1Mock = (messages.message1 as unknown) as Message;
Message1Mock.user = UserLukeMock;

export const Message2Mock = (messages.message2 as unknown) as Message;
Message2Mock.user = UserLeiaMock;

export const MessageSet1 = [Message1Mock, Message2Mock];

export const ChatRoom1Mock = (chatRooms.chatRoom1 as unknown) as ChatRoom;

export const MessageBox1Mock = {
    room: ChatRoom1Mock.room,
    messages: MessageSet1
} as MessageBox;

// Format Member Mock
// ******************************************************************************************************************************
export const Format1MemberLeiaMock: FormatMember = {
    id: UserLeiaMock.id,
    name: UserLeiaMock.name,
    email: UserLeiaMock.email,
    company: UserLeiaMock.company,
    avatar: UserLeiaMock.avatar,
    pending: false,
    role: UserLeiaMock.role,
    skills: UserLeiaMock.skills,
    teamCount: UserLeiaMock.teamCount,
    teams: [Team1Mock]
};
