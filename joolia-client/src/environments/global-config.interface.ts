import { LoggerConfig } from 'ngx-logger';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { UploaderOptions } from 'ngx-uploader';
import { Canvas, FilterToggleGroupItem, TableFilter } from '../app/core/models';
import { CanvasImageConfig, CanvasSlotTypeConfig } from './canvas-config';
import { PermissionConfig } from './permission-config';
import { GridsterConfig } from 'angular-gridster2';

interface ITableConfig {
    columns: string[];
    availablePaginationSizes: number[];
    defaultPaginationSize: number;
    defaultSortingKey: string;
    filters?: TableFilter[];
}

export interface IConfig {
    supportedLanguages: Array<string>;
    supportedLanguagesRegex: RegExp;
    supportedBrowserMaxLengthValue: number;
    microsoftTeamsBaseAuthorizationUrl: string;
    validations: {
        meetingUrl: {
            zoom: string;
            teams: string;
            skype: string;
        };
        email: string;
        password: string;
        debounceTime: number;
        videoURL: string;
        url: string;
        protocol: string;
    };
    characterLimits: {
        activity: {
            name: number;
            shortDescription: number;
            description: number;
        };
        library: {
            name: number;
        };
        phase: {
            name: number;
        };
        team: {
            name: number;
        };
        user: {
            name: number;
            company: number;
        };
        workspace: {
            name: number;
            description: number;
        };
        format: {
            name: number;
            shortDescription: number;
            description: number;
        };
        step: {
            description: number;
        };
        submission: {
            name: number;
            description: number;
        };
        message: {
            text: number;
        };
        userComment: {
            comment: number;
        };
        link: {
            description: number;
        };
        invitation: {
            text: number;
        };
        mailMessage: {
            text: { min: number; max: number };
        };
        canvas: {
            name: number;
        };
        slot: {
            title: number;
        };
        canvasSubmission: {
            text: number;
        };
        file: {
            name: number;
        };
    };
    pagination: {
        workspace: {
            initialAmount: number;
            loadMore: number;
        };
        library: {
            initialAmount: number;
            loadMore: number;
        };
        format: {
            initialAmount: number;
            loadMore: number;
        };
        phase: {
            initialAmount: number;
            loadMore: number;
        };
        team: {
            initialAmount: number;
            loadMore: number;
        };
        member: {
            initialAmount: number;
            loadMore: number;
        };
        formatTemplate: {
            initialAmount: number;
            loadMore: number;
        };
        phaseTemplate: {
            initialAmount: number;
            loadMore: number;
        };
        activityTemplate: {
            initialAmount: number;
            loadMore: number;
        };
        workspaceOverview: {
            adminAmount: number;
            formatAmount: number;
        };
    };
    ranges: {
        duration: {
            activity: {
                minutes: {
                    from: number;
                    to: number;
                    step: number;
                };
                days: {
                    from: number;
                    to: number;
                    step: number;
                };
            };
        };
        rating: {
            to: number;
        };
        mailAddresses: {
            max: number;
        };
        userSkills: {
            max: number;
        };
    };
    loggerConfig: LoggerConfig;
    snackBarConfig: MatSnackBarConfig;
    tableConfigs: {
        activityProgress: ITableConfig;
        formatSubmissions: ITableConfig;
        activitySubmissions: ITableConfig;
        teamSubmissions: ITableConfig;
        workspaceAdministration: ITableConfig;
    };
    mail: boolean;
    reCaptcha: {
        enabled: boolean;
        siteKey?: string;
        fake: boolean;
    };
    fileServiceConfig: {
        openFileDirectlyMimeTypeRegex: RegExp;
    };
    ngxUploadServiceConfig: {
        UploaderOptions: UploaderOptions;
    };
    links: {
        contact: string;
    };
    editorDescription: {
        keys: string[];
    };
    cookieBanner: {
        delay: number;
    };
    client: {
        version: string;
    };
    websocket: {
        transport: string[];
        namespaces: {
            app: string;
            notifications: string;
        };
        rooms: {
            maintenance: string;
            chat: {
                format: string;
                workspace: string;
                team: string;
            };
            notifications: {
                canvas: string;
                format: string;
                activity: string;
                submission: string;
            };
        };
    };
    jwtToken: {
        defaultRenewalTimeout: number;
    };
    icons: {
        submissionModifyConfig: {
            team: { value: string; icon: string };
            member: { value: string; icon: string };
        };
        submissionViewConfig: {
            submitter: { value: string; icon: string };
            member: { value: string; icon: string };
        };
        libraryCategories: {
            ideate: string;
            explore: string;
            test: string;
            prototype: string;
            implement: string;
        };
    };
    infiniteScrollConfig: {
        scrollDistance: number;
        scrollThrottle: number;
    };
    queryParams: {
        format: {
            select: {
                details: string;
                overview: string;
                submissionOverviewMembers: string;
                members: string;
            };
        };
        formatTemplate: {
            select: {
                details: string;
                overview: string;
                create: string;
            };
        };
        activity: {
            select: {
                details: string;
                detailsMain: string;
                detailsProgress: string;
                overview: string;
            };
        };
        activityTemplate: {
            select: {
                details: string;
                overview: string;
                create: string;
            };
        };
        phase: {
            select: {
                details: string;
                detailsActivity: string;
                overview: string;
            };
        };
        phaseTemplate: {
            select: {
                details: string;
                overview: string;
                create: string;
            };
        };
        library: {
            select: {
                overview: string;
                members: string;
                detailsOverview: string;
            };
        };
        submission: {
            select: {
                activityOverview: string;
                teamOverview: string;
                overview: string;
                details: string;
            };
        };
        team: {
            select: {
                members: string;
                overview: string;
            };
        };
        workspace: {
            select: {
                overview: string;
                formatOverview: string;
                members: string;
                adminMembersOverview: string;
                details: string;
            };
        };
    };
    filters: {
        formatMember: {
            userRole: FilterToggleGroupItem[];
            userStatus: FilterToggleGroupItem[];
        };
        libraryMember: {
            userStatus: FilterToggleGroupItem[];
        };
        workspaceMember: {
            userRole: FilterToggleGroupItem[];
            userStatus: FilterToggleGroupItem[];
        };
    };
    canvas: {
        selectableCanvases: Partial<Canvas>[];
        canvasSlotTypes: Array<CanvasSlotTypeConfig>;
        canvasImages: Array<CanvasImageConfig>;
        canvasGridsterConfig: Array<GridsterConfig>;
        canvasSubmissionColorPresents: Array<string>;
    };
    permission: PermissionConfig;
}
