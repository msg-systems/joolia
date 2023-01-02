import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Component, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs/internal/Subscription';
import { MessengerView } from '../../core/enum/global/messenger.enum';
import { ChatRoom, Message, MessageBox, UserRole } from '../../core/models';
import { ConfigurationService, FormatService, LoggerService, MeetingService, SnackbarService, UtilService } from '../../core/services';
import { MessengerService } from '../../core/services/messenger.service';
import { IMeeting } from '../../core/models/meeting.model';
import { IMeetingJoinDialogConfigData } from '../../core/models/meeting-join-dialog-config-data.model';
import { pick } from 'lodash-es';
import { MeetingTypeDialogComponent } from 'src/app/shared/components/meeting-type-dialog/meeting-type-dialog.component';
import { NavigationType } from 'src/app/core/enum/global/navigation-type.enum';
import { MeetingJoinDialogComponent } from 'src/app/shared/components/meeting-join-dialog/meeting-join-dialog.component';
import { MeetingJoinDialogResult } from 'src/app/core/enum/global/meeting-join-dialog-result.enum';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-messenger',
    templateUrl: './messenger.component.html',
    styleUrls: ['./messenger.component.scss'],
    providers: [MessengerService]
})
export class MessengerComponent implements OnInit, OnDestroy {
    @Input() context: string;

    public show = false;
    public messengerTitle: string;
    public totalMessageCount = 0;
    private subscriptions: Subscription[] = [];
    public availableChatRooms: ChatRoom[];
    public messageBoxes: MessageBox[] = [];
    public xsScreen = false;

    constructor(
        private messengerService: MessengerService,
        private logger: LoggerService,
        private renderer: Renderer2,
        private breakpointObserver: BreakpointObserver,
        private dialog: MatDialog,
        private meetingService: MeetingService,
        private formatService: FormatService,
        private snackbarService: SnackbarService,
        private utilService: UtilService,
        private translateService: TranslateService
    ) {
        this.messengerService.titleChanged.subscribe((title) => (this.messengerTitle = title));
        this.messengerService.totalMessageCountChanged.subscribe((count) => (this.totalMessageCount = count));
        this.subscriptions.push(
            this.breakpointObserver.observe(Breakpoints.XSmall).subscribe((state: BreakpointState) => {
                this.xsScreen = state.matches;
                this.configureScroll();
            })
        );
    }

    ngOnInit() {
        this.messengerService.navigateToView(MessengerView.OVERVIEW);
        this.messengerService.initContext(this.context);
        this.messengerService.availableChatRoomsChanged.subscribe((chatRooms) => {
            this.availableChatRooms = chatRooms;
        });
        this.messengerService.messageBoxChanged.subscribe((m) => {
            this.logger.debug('[Messenger]: Set new Messageboxes');
            this.messageBoxes = m;
        });
    }

    ngOnDestroy() {
        this.messengerService.terminateContext(this.context);
        this.subscriptions.forEach((s) => s.unsubscribe());
        this.renderer.removeClass(document.body, 'no-bg-scroll');
    }

    setMessengerButtonStyle(size?: string) {
        let style;

        const rc = ConfigurationService.getConfiguration().configuration.reCaptcha;

        if (size && size === 'xs') {
            if (this.show === true) {
                style = { bottom: '80px', 'z-index': '99' };
            } else {
                style = rc.enabled || rc.fake ? { bottom: '85px' } : { bottom: '40px' };
            }
        } else {
            style = rc.enabled || rc.fake ? { bottom: '85px' } : { bottom: '40px' };
        }
        return style;
    }

    toggleVisibility() {
        this.show = !this.show;
        if (!this.show) {
            this.navigateBack();
        }
        this.configureScroll();
    }

    configureScroll() {
        if (this.xsScreen) {
            this.renderer[this.show ? 'addClass' : 'removeClass'](document.body, 'no-bg-scroll');
        } else {
            this.renderer.removeClass(document.body, 'no-bg-scroll');
        }
    }

    navigateBack() {
        if (!this.messengerService.isViewActive(MessengerView.OVERVIEW)) {
            this.messengerService.navigateToView(MessengerView.OVERVIEW);
        }
    }

    onStartMeeting(chatRoom: ChatRoom) {
        const userRole = this.formatService.getCurrentFormat().me.userRole;
        const formatId = this.formatService.getCurrentFormat().id;
        if (chatRoom.entity === 'Format') {
            this.startFormatMeeting(chatRoom, userRole, formatId);
        } else if (chatRoom.entity === 'Team') {
            this.startTeamMeeting(chatRoom, formatId);
        }
    }

    startFormatMeeting(chatRoom: ChatRoom, userRole: UserRole, formatId: string) {
        this.subscriptions.push(
            this.meetingService.getFormatMeeting(formatId).subscribe(
                (response) => {
                    if (response) {
                        const canDeleteMeeting = userRole === UserRole.ORGANIZER;
                        this.subscriptions.push(
                            this.showMeetingJoinDialogAndJoinOrDeleteMeeting(
                                response.url,
                                new Date(response.expirationTime),
                                canDeleteMeeting,
                                chatRoom,
                                formatId
                            )
                        );
                    } else {
                        if (userRole === UserRole.ORGANIZER) {
                            this.logger.debug('[Format Meeting] Organizer - not yet started - try to create ...', this.startFormatMeeting);
                            this.subscriptions.push(this.showMeetingTypeDialogAndCreateMeeting(chatRoom, userRole, formatId));
                        } else if (userRole === UserRole.PARTICIPANT) {
                            this.snackbarService.openWithMessage('hints.meeting.notStarted');
                            this.logger.debug('[Format Meeting] Participant - not yet started', this.startFormatMeeting);
                        }
                    }
                },
                (_err) => {
                    this.snackbarService.openWithMessage('errors.meeting.unableToStart');
                    this.logger.error('[Format Meeting] not able to start meeting', this.startFormatMeeting);
                }
            )
        );
    }

    startTeamMeeting(chatRoom: ChatRoom, formatId: string) {
        this.subscriptions.push(
            this.meetingService.getTeamMeeting(formatId, chatRoom.id).subscribe(
                (response) => {
                    if (response) {
                        const canDeleteMeeting = true;
                        this.subscriptions.push(
                            this.showMeetingJoinDialogAndJoinOrDeleteMeeting(
                                response.url,
                                new Date(response.expirationTime),
                                canDeleteMeeting,
                                chatRoom,
                                formatId
                            )
                        );
                    } else {
                        this.logger.debug('[Team Meeting] Participant - not yet started - try to create ...', this.startTeamMeeting);
                        this.subscriptions.push(this.showMeetingTypeDialogAndCreateMeeting(chatRoom, UserRole.PARTICIPANT, formatId));
                    }
                },
                (_err) => {
                    this.snackbarService.openWithMessage('errors.meeting.unableToStart');
                    this.logger.error('[Team Meeting] not able to start meeting', this.startTeamMeeting);
                }
            )
        );
    }

    showMeetingTypeDialogAndCreateMeeting(chatRoom: ChatRoom, userRole: UserRole, formatId: string): Subscription {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.data = {
            title: chatRoom.title
        };

        return this.dialog
            .open(MeetingTypeDialogComponent, dialogConfig)
            .afterClosed()
            .subscribe((selectedMeetingType) => {
                if (selectedMeetingType !== undefined) {
                    const meeting: IMeeting = {
                        ...pick(chatRoom, ['entity', 'id']),
                        userRole: userRole,
                        type: selectedMeetingType,
                        formatId: formatId
                    };
                    this.meetingService.authorizeAndCreateMeeting(meeting);
                }
            });
    }

    showMeetingJoinDialogAndJoinOrDeleteMeeting(
        meetingUrl: string,
        expirationTime: Date,
        canDeleteMeeting: boolean,
        chatRoom: ChatRoom,
        formatId: string
    ): Subscription {
        const meetingType = this.utilService.getTypeOfMeetingFromUrl(meetingUrl);
        const translatedMeetingType = this.translateService.instant(`dialog.startMeeting.${meetingType}`);

        const dialogConfigData: IMeetingJoinDialogConfigData = {
            title: chatRoom.title,
            canDeleteMeeting: canDeleteMeeting,
            meetingUrl: meetingUrl,
            expirationTime: expirationTime,
            meetingType: meetingType
        };

        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.data = dialogConfigData;

        return this.dialog
            .open(MeetingJoinDialogComponent, dialogConfig)
            .afterClosed()
            .subscribe((result) => {
                if (result === MeetingJoinDialogResult.JOIN) {
                    this.meetingService.joinMeeting(meetingUrl, NavigationType.NEW_TAB);
                } else if (result === MeetingJoinDialogResult.DELETE) {
                    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                        width: '400px',
                        data: {
                            headerKey: 'dialog.delete.cancellationHeader',
                            contentKey: 'dialog.delete.meetingCancellation',
                            contentParams: { objectName: `${translatedMeetingType} - ${chatRoom.title} Meeting` },
                            cancelKey: 'buttons.cancel',
                            confirmKey: 'buttons.confirm'
                        }
                    });

                    dialogRef.afterClosed().subscribe((confirmation: boolean) => {
                        if (confirmation) {
                            this.meetingService.deleteMeeting(chatRoom.entity, chatRoom.id, formatId);
                        }
                    });
                }
            });
    }

    onOpenChatRoom(roomId: string) {
        this.messengerService.navigateToView(MessengerView.CHAT, roomId);
    }

    isOverviewActive() {
        return this.messengerService.isViewActive(MessengerView.OVERVIEW);
    }

    isChatActive() {
        return this.messengerService.isViewActive(MessengerView.CHAT);
    }

    getChatMessagesForCurrentRoom() {
        return this.messengerService.getChatMessagesForCurrentRoom();
    }

    onSendMessage(m: Message) {
        this.messengerService.sendMessage(m);
    }
}
