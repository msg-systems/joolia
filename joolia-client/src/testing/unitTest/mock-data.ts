import { cloneDeep, get } from 'lodash-es';
import {
    Activity1Mock,
    Activity1TemplateMock,
    Activity2Mock,
    Activity3Mock,
    ActivityList1Mock,
    ActivityTemplateList1Mock,
    Canvas1Mock,
    Canvas2Mock,
    Canvas3Mock,
    CanvasList1Mock,
    CanvasSubmission1Mock,
    CanvasSubmission2Mock,
    CanvasSubmission3Mock,
    CanvasSubmissionList1Mock,
    Comment1Mock,
    Comment2Mock,
    Comment3Mock,
    Comment4Mock,
    Comment5Mock,
    CommentList1Mock,
    File1Mock,
    FileList1Mock,
    FileSet1,
    FileUpload1Mock,
    Format1MembersListMock,
    Format1Mock,
    Format1TemplateMock,
    Format2Mock,
    FormatList1Mock,
    FormatTemplateList1Mock,
    KeyVisual1Mock,
    KeyVisual2Mock,
    Library1Mock,
    LibraryList1Mock,
    LibrarySet1,
    Meeting1Mock,
    PermissionRole1Mock,
    PermissionRole2Mock,
    PermissionRoleSet1,
    Phase1Mock,
    Phase1TemplateMock,
    Phase2Mock,
    Phase3Mock,
    PhaseList1Mock,
    PhaseSet1,
    PhaseTemplateList1Mock,
    Rating1Mock,
    Rating2Mock,
    Rating3Mock,
    RatingList1Mock,
    Step1Mock,
    Step2Mock,
    Step3Mock,
    Step4Mock,
    Step5Mock,
    Step6Mock,
    StepList1Mock,
    Submission1Mock,
    SubmissionList1Mock,
    Team1ListMock,
    Team1Mock,
    UserAnakinMock,
    UserGeorgeMock,
    UserLeiaMock,
    UserLukeMock,
    UserObiWanMock,
    UserShaakMock,
    UserMickeyMock,
    Workspace1MembersListMock,
    Workspace1Mock,
    Workspace2Mock,
    Workspace3Mock,
    Workspace4Mock,
    Workspace5Mock,
    WorkspaceListMock,
    Skill1Mock,
    Skill2Mock,
    Skill3Mock,
    SkillSet1,
    Message1Mock,
    Message2Mock,
    ChatRoom1Mock,
    MessageBox1Mock,
    Canvas4Mock,
    Meeting2Mock,
    MeetingAuthorizationUrlMSTeamsMock,
    WorkspaceAdminConsentEmail,
    Format1MemberLeiaMock
} from './mock-objects';

const MockData = {
    user: {
        leia: UserLeiaMock,
        luke: UserLukeMock,
        anakin: UserAnakinMock,
        george: UserGeorgeMock,
        obiwan: UserObiWanMock,
        shaak: UserShaakMock,
        mickey: UserMickeyMock
    },
    workspace: {
        workspace1: Workspace1Mock,
        workspace2: Workspace2Mock,
        workspace3: Workspace3Mock,
        workspace4: Workspace4Mock,
        workspace5: Workspace5Mock,
        list: {
            list1: WorkspaceListMock
        },
        adminConsentEmail: WorkspaceAdminConsentEmail,
        member: {
            list: {
                list1: Workspace1MembersListMock
            }
        }
    },
    library: {
        library1: Library1Mock,
        list: {
            list1: LibraryList1Mock
        },
        set: {
            set1: LibrarySet1
        }
    },
    file: {
        file1: File1Mock,
        list: {
            list1: FileList1Mock
        },
        set: {
            set1: FileSet1
        }
    },
    fileupload: {
        fileupload1: FileUpload1Mock
    },
    keyvisual: {
        keyvisual1: KeyVisual1Mock,
        keyvisual2: KeyVisual2Mock
    },
    template: {
        format: {
            template1: Format1TemplateMock,
            list: {
                list1: FormatTemplateList1Mock
            }
        },
        phase: {
            template1: Phase1TemplateMock,
            list: {
                list1: PhaseTemplateList1Mock
            }
        },
        activity: {
            template1: Activity1TemplateMock,
            list: {
                list1: ActivityTemplateList1Mock
            }
        }
    },
    step: {
        step1: Step1Mock,
        step2: Step2Mock,
        step3: Step3Mock,
        step4: Step4Mock,
        step5: Step5Mock,
        step6: Step6Mock,
        list: {
            list1: StepList1Mock
        }
    },
    team: {
        team1: Team1Mock,
        list: {
            list1: Team1ListMock
        }
    },
    format: {
        format1: Format1Mock,
        format2: Format2Mock,
        list: {
            list1: FormatList1Mock
        },
        member: {
            list: {
                list1: Format1MembersListMock
            },
            leia: Format1MemberLeiaMock
        }
    },
    activity: {
        activity1: Activity1Mock,
        activity2: Activity2Mock,
        activity3: Activity3Mock,
        list: {
            list1: ActivityList1Mock
        }
    },
    phase: {
        phase1: Phase1Mock,
        phase2: Phase2Mock,
        phase3: Phase3Mock,
        list: {
            list1: PhaseList1Mock
        },
        set: {
            set1: PhaseSet1
        }
    },
    permissionrole: {
        permissionrole1: PermissionRole1Mock,
        permissionrole2: PermissionRole2Mock,
        set: {
            set1: PermissionRoleSet1
        }
    },
    submission: {
        submission1: Submission1Mock,
        list: {
            list1: SubmissionList1Mock
        }
    },
    comment: {
        comment1: Comment1Mock,
        comment2: Comment2Mock,
        comment3: Comment3Mock,
        comment4: Comment4Mock,
        comment5: Comment5Mock,
        list: {
            list1: CommentList1Mock
        }
    },
    rating: {
        rating1: Rating1Mock,
        rating2: Rating2Mock,
        rating3: Rating3Mock,
        list: { list1: RatingList1Mock }
    },
    meeting: {
        BBB: Meeting1Mock,
        MSTeams: Meeting2Mock,
        authorizationUrlMSTeams: MeetingAuthorizationUrlMSTeamsMock
    },
    skills: {
        skill1: Skill1Mock,
        skill2: Skill2Mock,
        skill3: Skill3Mock,
        set: {
            set1: SkillSet1,
            set2: SkillSet1,
            set3: SkillSet1
        }
    },
    canvas: {
        canvas1: Canvas1Mock,
        canvas2: Canvas2Mock,
        canvas3: Canvas3Mock,
        canvas4: Canvas4Mock,
        list: { list1: CanvasList1Mock }
    },
    canvasSubmission: {
        canvasSubmission1: CanvasSubmission1Mock,
        canvasSubmission2: CanvasSubmission2Mock,
        canvasSubmission3: CanvasSubmission3Mock,
        list: { list1: CanvasSubmissionList1Mock }
    },
    message: {
        message1: Message1Mock,
        message2: Message2Mock
    },
    chatRoom: {
        chatRoom1: ChatRoom1Mock
    },
    messageBox: {
        messageBox1: MessageBox1Mock
    }
};

export function getMockData(mockDataPath) {
    return cloneDeep(get(MockData, mockDataPath));
}
