/*
 * Stores all const which are valid globally. This file does not store some stage specific configuration
 */
import { NgxLoggerLevel } from 'ngx-logger';
import { IConfig } from './global-config.interface';
// @ts-ignore
import { version } from '../../package.json';
import { permissionConfig } from './permission-config';
import { canvasTemplateConfig } from './canvas-config';
import { UserRoleFilter, UserStatusFilter } from '../app/core/enum/global/filter.enum';

export const globalConfig: IConfig = {
    supportedLanguages: ['en', 'de'],
    supportedLanguagesRegex: /en|de/,

    /* This is the maximum maxLength value the chrome browser can use. This is needed if we set the maxLength value optionally.*/
    supportedBrowserMaxLengthValue: 524288,

    microsoftTeamsBaseAuthorizationUrl:
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_type=code&client_id=29ec089d-e7ae-4c17-93b7-53b25904eb7a&scope=OnlineMeetings.ReadWrite',

    validations: {
        meetingUrl: {
            zoom: '^.*(https:\\/\\/|http:\\/\\/)?(zoom.us\\/|v\\/|u\\/\\w\\/|j\\/|\\?v=|\\&v=|\\?v=)([^#\\&\\?]*).*',
            teams: '^.*(https:\\/\\/|http:\\/\\/)?(teams.microsoft.com){1}(\\/|v\\/|u\\/\\w\\/|l\\/meetup-join\\/)([^#\\&\\?]*).*',
            skype: '^.*(https:\\/\\/|http:\\/\\/)?(join.skype.com\\/|v\\/|u\\/\\w\\/|j\\/|\\?v=|\\&v=|\\?v=)([^#\\&\\?]*).*'
        },
        email: '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$',
        password: '^(?=.*[^a-zA-Z]).{8,}$',
        debounceTime: 500,
        videoURL: '^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=|\\&v=|\\?v=)([^#\\&\\?]*).*',
        url:
            '^' +
            // protocol identifier; if protocol is not stated, it will be added on server side
            '(?:(?:https?|ftp)://)?' +
            // user:pass authentication
            '(?:\\S+(?::\\S*)?@)?' +
            '(?:' +
            // IP address exclusion
            // private & local networks
            '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
            '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
            '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
            // IP address dotted notation octets
            // excludes loopback network 0.0.0.0
            // excludes reserved space >= 224.0.0.0
            // excludes network & broacast addresses
            // (first & last IP address of each class)-b
            '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
            '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
            '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
            '|' +
            // host name
            '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
            // domain name
            '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
            // TLD identifier
            '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
            // TLD may end with dot
            '\\.?' +
            ')' +
            // resource path
            '(?:[/?#]\\S*)?' +
            '$',
        protocol: '^((ftp|https?):\\/\\/)'
    },
    // MySQL can store up to 65535 bytes, one UTF-8 character can take up to 4 bytes, so there is a technical limit at 16383 characters
    characterLimits: {
        activity: {
            name: 55,
            shortDescription: 150,
            description: 10000 // note the technical limit mentioned above, don't blindly increase this value
        },
        library: {
            name: 55
        },
        phase: {
            name: 55
        },
        team: {
            name: 40
        },
        user: {
            name: 40,
            company: 40
        },
        workspace: {
            name: 55,
            description: 150
        },
        format: {
            name: 55,
            shortDescription: 150,
            description: 10000 // note the technical limit mentioned above, don't blindly increase this value
        },
        step: {
            description: 600
        },
        submission: {
            name: 55,
            description: 10000 // note the technical limit mentioned above, don't blindly increase this value
        },
        message: {
            // Websockets have a limit of around 9 exabytes for a single frame.
            // Redis has a limit of 512MiB, so around 128M characters.
            // Chrome becomes quite slow (rendering) after a few million characters and crashes between 5-6 million characters.
            // Firefox can handle 10 million characters without crashing, but becomes slow as well.
            text: 1000
        },
        userComment: {
            comment: 1000
        },
        link: {
            description: 150
        },
        invitation: {
            text: 1000
        },
        mailMessage: {
            text: { min: 10, max: 1000 }
        },
        file: {
            name: 255
        },
        canvas: {
            name: 55
        },
        slot: {
            title: 55
        },
        canvasSubmission: {
            text: 200
        }
    },
    pagination: {
        workspace: {
            initialAmount: 50,
            loadMore: 20
        },
        library: {
            initialAmount: 50,
            loadMore: 20
        },
        format: {
            initialAmount: 30,
            loadMore: 10
        },
        phase: {
            initialAmount: 30,
            loadMore: 10
        },
        team: {
            initialAmount: 50,
            loadMore: 20
        },
        member: {
            initialAmount: 40,
            loadMore: 15
        },
        formatTemplate: {
            initialAmount: 30,
            loadMore: 10
        },
        phaseTemplate: {
            initialAmount: 30,
            loadMore: 10
        },
        activityTemplate: {
            initialAmount: 30,
            loadMore: 10
        },
        workspaceOverview: {
            adminAmount: 3,
            formatAmount: 5
        }
    },
    ranges: {
        duration: {
            activity: {
                minutes: {
                    from: 15,
                    to: 600,
                    step: 15
                },
                days: {
                    from: 1440, // (24 hours * 60 minutes)
                    to: 43200, // (30 days * 24 hours  * 60 minutes)
                    step: 1440
                }
            }
        },
        rating: {
            to: 5
        },
        mailAddresses: {
            max: 500
        },
        userSkills: {
            max: 3
        }
    },
    loggerConfig: {
        level: NgxLoggerLevel.DEBUG,
        disableConsoleLogging: false
    },
    snackBarConfig: {
        duration: 4000
    },
    tableConfigs: {
        activityProgress: {
            columns: ['name', 'progress', 'action'],
            availablePaginationSizes: [10, 20, 30, 40, 50],
            defaultPaginationSize: 20,
            defaultSortingKey: 'name'
        },
        formatSubmissions: {
            columns: [
                'expandIcon',
                'avatar',
                'submittedBy',
                'phase',
                'method',
                'name',
                'averageRating',
                'fileCount',
                'commentCount',
                'date',
                'action'
            ],
            availablePaginationSizes: [10, 20, 30, 40, 50],
            defaultPaginationSize: 20,
            defaultSortingKey: 'date',
            filters: [
                { key: 'submittedByUser', label: 'submitterUser', value: null },
                { key: 'submittedByTeam', label: 'submitterTeam', value: null },
                { key: 'phase', label: 'phase', value: null }
            ]
        },
        activitySubmissions: {
            columns: ['avatar', 'submitter', 'name', 'averageRating', 'commentCount', 'action'],
            availablePaginationSizes: [10, 20, 30, 40, 50],
            defaultPaginationSize: 20,
            defaultSortingKey: 'date'
        },
        teamSubmissions: {
            columns: ['activity', 'name', 'action'],
            availablePaginationSizes: [10, 20, 30, 40, 50],
            defaultPaginationSize: 20,
            defaultSortingKey: 'date'
        },
        workspaceAdministration: {
            columns: ['avatar', 'name', 'email', 'company', 'role', 'lastLogin', 'formatCount', 'action'],
            availablePaginationSizes: [10, 20, 30, 40, 50],
            defaultPaginationSize: 20,
            defaultSortingKey: 'name'
        }
    },

    mail: null,

    reCaptcha: {
        enabled: true,
        siteKey: '6LdESpQUAAAAAKmya5J3H7pb3nakzy-vUXTq-4RK',
        fake: false
    },

    fileServiceConfig: {
        openFileDirectlyMimeTypeRegex: /^image\/.*|application\/pdf$/
    },
    ngxUploadServiceConfig: {
        UploaderOptions: {
            concurrency: 2,
            // allowedContentTypes : ['*'],
            maxUploads: 30
        }
    },
    links: {
        contact: 'mailto:info@joolia.cloud'
    },
    editorDescription: {
        keys: ['bold', 'italics', 'ul', 'ol', 'emphasis', 'strong_emphasis', 'link']
    },
    cookieBanner: {
        delay: 1000
    },
    client: {
        version: version
    },
    websocket: {
        transport: ['websocket', 'polling'],
        namespaces: {
            app: '/',
            notifications: '/notifications'
        },
        rooms: {
            maintenance: '/maintenance/',
            chat: {
                format: '/chat/format/',
                workspace: '/chat/workspace/',
                team: '/team/'
            },
            notifications: {
                canvas: '/notification/canvas/',
                format: '/notification/format/',
                activity: '/notification/activity/',
                submission: '/notification/submission/'
            }
        }
    },
    jwtToken: {
        defaultRenewalTimeout: 30000
    },
    icons: {
        submissionModifyConfig: {
            team: {
                value: 'team',
                icon: 'category'
            },
            member: {
                value: 'member',
                icon: 'people'
            }
        },
        submissionViewConfig: {
            submitter: {
                value: 'submitter',
                icon: 'visibility_off'
            },
            member: {
                value: 'member',
                icon: 'visibility'
            }
        },
        libraryCategories: {
            explore: 'not_listed_location',
            ideate: 'emoji_objects',
            test: 'track_changes',
            prototype: 'games',
            implement: 'code'
        }
    },
    infiniteScrollConfig: {
        scrollDistance: 1,
        scrollThrottle: 300
    },
    queryParams: {
        format: {
            select: {
                details:
                    'id,name,shortDescription,description,meetingLink,keyVisual,me,memberCount,teamCount,submissionCount,' +
                    'phaseCount,activityCount,commentCount,workspaceId,workspaceName,createdById',
                overview: 'id,name,shortDescription,memberCount,keyVisual,workspaceName,startDate,endDate,me,containsTechnicalUser',
                submissionOverviewMembers: 'id,name,avatar',
                members: 'id,name,company,email,role,teamCount,pending,avatar,skills'
            }
        },
        formatTemplate: {
            select: {
                details: 'id,name,shortDescription,description,createdBy,phaseTemplateCount,activityTemplateCount,keyVisual,category',
                overview: 'id,name,shortDescription,phaseTemplateCount,activityTemplateCount,keyVisual,category',
                create: 'id,name,shortDescription,phaseTemplateCount,activityTemplateCount,library,keyVisual,category'
            }
        },
        activity: {
            select: {
                details: 'id,name,shortDescription,duration,configuration,keyVisual,links',
                detailsMain: 'id,name,shortDescription,description,duration,configuration,keyVisual,collaborationLinks',
                detailsProgress: 'id,description,checkedBy',
                overview: ''
            }
        },
        activityTemplate: {
            select: {
                details: 'id,name,shortDescription,description,createdBy,duration,stepTemplates,configuration,keyVisual,category,canvases',
                overview: 'id,name,duration,shortDescription,keyVisual,category',
                create: 'id,name,shortDescription,duration,library,keyVisual,category'
            }
        },
        phase: {
            select: {
                details: 'id,name,startDate,durationUnit',
                detailsActivity: 'id,name,duration',
                overview: 'id,name,startDate,endDate,duration,durationUnit,activityCount,status,visible'
            }
        },
        phaseTemplate: {
            select: {
                details: 'id,name,createdBy,library,activityTemplateCount,duration,durationUnit,activityTemplates,category',
                overview: 'id,name,activityTemplateCount,duration,durationUnit,category',
                create: 'id,name,duration,durationUnit,library,activityTemplateCount,category'
            }
        },
        library: {
            select: {
                detailsOverview: 'id,name,templateCount,formatTemplateCount,phaseTemplateCount,activityTemplateCount',
                members: 'id,name,email,company,pending,avatar,skills',
                overview: 'id,name,memberCount,templateCount'
            }
        },
        submission: {
            select: {
                activityOverview: 'id,name,submittedBy,activity,createdAt,commentCount,averageRating',
                teamOverview: 'id,name,submittedBy,activity',
                overview: 'id,name,submittedBy,commentCount,averageRating,fileCount,activity,createdAt,description',
                details: 'id,name,description,submittedBy,createdAt,averageRating'
            }
        },
        team: {
            select: {
                members: 'id,name,avatar,skills',
                overview: 'id,name,avatar,createdBy,members'
            }
        },
        workspace: {
            select: {
                overview: 'id,name,description,formatCount,memberCount,logoId',
                formatOverview: 'id,name,shortDescription,memberCount,keyVisual,workspace,startDate,endDate,me',
                members: 'id,name,email,role, company,pending,avatarId,skills',
                adminMembersOverview: 'id,name,email,company,role,lastLogin,formatCount,pending,avatarId',
                details: 'id,name,me,licensesCount,formatCount,memberCount,logoId,tenant,domain,consentDate'
            }
        }
    },
    filters: {
        formatMember: {
            userRole: [
                { label: 'labels.filter.organizer', icon: 'admin_panel_settings', value: UserRoleFilter.ORGANIZER },
                { label: 'labels.filter.participant', icon: 'group', value: UserRoleFilter.PARTICIPANT }
            ],
            userStatus: [
                { label: 'labels.filter.registered', icon: 'how_to_reg', value: UserStatusFilter.REGISTERED },
                { label: 'labels.filter.pending', icon: 'mail_outline', value: UserStatusFilter.PENDING }
            ]
        },
        libraryMember: {
            userStatus: [
                { label: 'labels.filter.registered', icon: 'how_to_reg', value: UserStatusFilter.REGISTERED },
                { label: 'labels.filter.pending', icon: 'mail_outline', value: UserStatusFilter.PENDING }
            ]
        },
        workspaceMember: {
            userRole: [
                { label: 'labels.filter.admin', icon: 'admin_panel_settings', value: UserRoleFilter.ADMIN },
                { label: 'labels.filter.participant', icon: 'group', value: UserRoleFilter.PARTICIPANT }
            ],
            userStatus: [
                { label: 'labels.filter.registered', icon: 'how_to_reg', value: UserStatusFilter.REGISTERED },
                { label: 'labels.filter.pending', icon: 'mail_outline', value: UserStatusFilter.PENDING }
            ]
        }
    },
    canvas: {
        selectableCanvases: canvasTemplateConfig.canvases,
        canvasSlotTypes: canvasTemplateConfig.canvasSlotType,
        canvasImages: canvasTemplateConfig.canvasImages,
        canvasGridsterConfig: canvasTemplateConfig.canvasGridsterConfig,
        canvasSubmissionColorPresents: canvasTemplateConfig.canvasSubmissionColorPresents
    },
    permission: permissionConfig
};
