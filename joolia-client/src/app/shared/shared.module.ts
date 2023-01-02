import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClampDirective, ClampyModule } from '@clampy-js/ngx-clampy';
import { TranslateModule } from '@ngx-translate/core';
import { TextInputHighlightModule } from 'angular-text-input-highlight';
import { FileSizeModule } from 'ngx-filesize';
import { ImageCropperModule } from 'ngx-image-cropper';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxUploaderModule } from 'ngx-uploader';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MaterialModule } from '../core/components';
import { MessengerComponent } from '../public/messenger/messenger.component';
import { ActionBarComponent } from './components/action-bar/action-bar.component';
import { ActivityItemComponent } from './components/activity-item/activity-item.component';
import { ActivityListAddButtonComponent } from './components/activity-list-add-button/activity-list-add-button.component';
import { ActivityListComponent } from './components/activity-list/activity-list.component';
import { ActivityTemplateListItemComponent } from './components/activity-template-list-item/activity-template-list-item.component';
import { ActivityTemplateListComponent } from './components/activity-template-list/activity-template-list.component';
import { AvatarUploadDialogComponent } from './components/avatar-upload/avatar-upload-dialog.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { BaseFormInputComponent } from './components/base-form-input/base-form-input.component';
import { BaseFormRadioSelectionComponent } from './components/base-form-radio-selection/base-form-radio-selection.component';
import { BaseFormSelectComponent } from './components/base-form-select/base-form-select.component';
import { BaseFormTextFieldComponent } from './components/base-form-text-field/base-form-text-field.component';
import { BasePasswordInputComponent } from './components/base-password-input/base-password-input.component';
import { CommentComponent } from './components/comment/comment.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { DescriptionDialogComponent } from './components/description-dialog/description-dialog.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { FileListComponent } from './components/file-list/file-list.component';
import { FormatCreateDialogComponent } from './components/format-create-dialog/format-create-dialog.component';
import { EntitySummaryComponent } from './components/entity-summary/entity-summary.component';
import { InfoBoxComponent } from './components/info-box/info-box.component';
import { InlineDatepickerComponent } from './components/inline-datepicker/inline-datepicker.component';
import { InlineDropdownInputComponent } from './components/inline-dropdown-input/inline-dropdown-input.component';
import { InlineEditChecklistComponent } from './components/inline-edit-checklist/inline-edit-checklist.component';
import { InlineEditTextComponent } from './components/inline-edit-text/inline-edit-text.component';
import { InvitationDialogComponent } from './components/invitation-dialog/invitation-dialog.component';
import { KeyVisualUploadDialogComponent } from './components/key-visual-upload/key-visual-upload-dialog.component';
import { KeyVisualComponent } from './components/key-visual/key-visual.component';
import { LinkCreateDialogComponent } from './components/link-create-dialog/link-create-dialog.component';
import { LinkEditDialogComponent } from './components/link-edit-dialog/link-edit-dialog.component';
import { LinkListComponent } from './components/link-list/link-list.component';
import { ListCardItemComponent } from './components/list-card-item/list-card-item.component';
import { ListRowItemComponent } from './components/list-row-item/list-row-item.component';
import { LoadingIndicatorComponent } from './components/loading-indicator/loading-indicator.component';
import { MainChipComponent } from './components/main-chip/main-chip.component';
import { MediaComponent } from './components/media/media.component';
import { MessengerChatRoomCardComponent } from './components/messenger-chat-room-card/messenger-chat-room-card.component';
import { MessengerChatComponent } from './components/messenger-chat/messenger-chat.component';
import { MessengerOverviewComponent } from './components/messenger-overview/messenger-overview.component';
import { PaginationContainerComponent } from './components/pagination-container/pagination-container.component';
import { PhaseGridListComponent } from './components/phase-grid-list/phase-grid-list.component';
import { ProgressTableComponent } from './components/progress-table/progress-table.component';
import { RatingComponent } from './components/rating/rating.component';
import { RouterTab, RouterTabComponent, RouterTabItem } from './components/router-tab/router-tab.component';
import { SelectTemplateDialogComponent } from './components/select-template-dialog/select-template-dialog.component';
import { SelectionDialogComponent } from './components/selection-dialog/selection-dialog.component';
import { SendMailDialogComponent } from './components/send-mail-dialog/send-mail-dialog.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { SubmitDialogComponent } from './components/submit-dialog/submit-dialog.component';
import { TabNavbarComponent } from './components/tab-navbar/tab-navbar.component';
import { TableFiltersComponent } from './components/table-filters/table-filters.component';
import { TeamAddMembersDialogComponent } from './components/team-add-members-dialog/team-add-members-dialog.component';
import { TeamCreateDialogComponent } from './components/team-create-dialog/team-create-dialog.component';
import { TeamMemberCardComponent } from './components/team-member-card/team-member-card.component';
import { TeamSubmissionsComponent } from './components/team-submissions/team-submissions.component';
import { UserAvatarComponent } from './components/user-avatar/user-avatar.component';
import { UserCardComponent } from './components/user-card/user-card.component';
import { UserroleChipComponent } from './components/userrole-chip/userrole-chip.component';
import { ViewToggleComponent } from './components/view-toggle/view-toggle.component';
import { FormatListComponent } from './components/format-list/format-list.component';
import { EditableChipComponent } from './components/editable-chip/editable-chip.component';
import { BetaTagComponent } from './components/beta-tag/beta-tag.component';
import { AutosizeDirective, DownloadLinkDirective, HasPermissionDirective } from './directives';
import { AddLinkTargetPipe, DecimalProxyPipe, DurationPipe, MomentPipe, NumberMaxPipe, SafeUrlPipe, TimeDescriptionPipe } from './pipes';
import { MeetingStartComponent } from './components/meeting-start/meeting-start.component';
import { FilterToggleGroupComponent } from './components/filter-toggle-group/filter-toggle-group.component';
import { FormatCurrentStateComponent } from './components/format-current-state/format-current-state.component';
import { UserListItemComponent } from './components/user-list-item/user-list-item.component';
import { EditFileDialogComponent } from './components/edit-file-dialog/edit-file-dialog.component';
import { TailButtonComponent } from './components/tail-button/tail-button.component';
import { WorkspaceLicenseSummaryComponent } from './components/workspace-license-summary/workspace-license-summary.component';
import { BorderCardComponent } from './components/border-card/border-card.component';
import { CanvasCreateDialogComponent } from './components/canvas/canvas-create-dialog/canvas-create-dialog.component';
import { CanvasListComponent } from './components/canvas/canvas-list/canvas-list.component';
import { BusinessCanvasComponent } from './components/canvas/business-canvas/business-canvas.component';
import { QuestionnaireCanvasComponent } from './components/canvas/questionnaire-canvas/questionnaire-canvas.component';
import { CustomerJourneyCanvasComponent } from './components/canvas/customer-journey-canvas/customer-journey-canvas.component';
import { BaseCanvasTemplateComponent } from './components/canvas/base-canvas-template/base-canvas-template.component';
import { BaseCanvasComponent } from './components/canvas/base-canvas/base-canvas.component';
import { CanvasSubmissionToolbarComponent } from './components/canvas/canvas-submission-toolbar/canvas-submission-toolbar.component';
import { NavigationButtonComponent } from './components/navigation-button/navigation-button.component';
import { GridsterModule } from 'angular-gridster2';
import { CustomCanvasComponent } from './components/canvas/custom-canvas/custom-canvas.component';
import { MeetingTypeDialogComponent } from './components/meeting-type-dialog/meeting-type-dialog.component';
import { MeetingJoinDialogComponent } from './components/meeting-join-dialog/meeting-join-dialog.component';
import { ColorPickerModule } from '@iplab/ngx-color-picker';
import { AdminConsentDialogComponent } from './components/admin-consent-request-dialog/admin-consent-request-dialog.component';
import { MemberProfileComponent } from './components/member-profile/member-profile.component';

/**
 * Module providing shared elements of the application
 */

export const canvasComponents = [
    BusinessCanvasComponent,
    QuestionnaireCanvasComponent,
    CanvasListComponent,
    CanvasCreateDialogComponent,
    CustomerJourneyCanvasComponent,
    BaseCanvasTemplateComponent,
    BaseCanvasComponent,
    CustomCanvasComponent,
    CanvasSubmissionToolbarComponent
];

@NgModule({
    declarations: [
        BasePasswordInputComponent,
        BaseFormTextFieldComponent,
        BaseFormInputComponent,
        ConfirmationDialogComponent,
        InfoBoxComponent,
        ActionBarComponent,
        SidenavComponent,
        ListCardItemComponent,
        ListRowItemComponent,
        InlineEditChecklistComponent,
        InlineEditTextComponent,
        LoadingIndicatorComponent,
        InvitationDialogComponent,
        ErrorDialogComponent,
        UserCardComponent,
        UserListItemComponent,
        FileListComponent,
        LinkListComponent,
        SelectionDialogComponent,
        SelectTemplateDialogComponent,
        BaseFormSelectComponent,
        PhaseGridListComponent,
        TeamCreateDialogComponent,
        TeamAddMembersDialogComponent,
        TabNavbarComponent,
        InlineDatepickerComponent,
        ActivityListComponent,
        ActivityItemComponent,
        InlineDropdownInputComponent,
        DurationPipe,
        DecimalProxyPipe,
        ActivityListAddButtonComponent,
        MomentPipe,
        DownloadLinkDirective,
        KeyVisualUploadDialogComponent,
        EmptyStateComponent,
        KeyVisualComponent,
        MediaComponent,
        SubmitDialogComponent,
        BaseFormRadioSelectionComponent,
        PaginationContainerComponent,
        ProgressTableComponent,
        HasPermissionDirective,
        MainChipComponent,
        EditableChipComponent,
        UserroleChipComponent,
        SafeUrlPipe,
        TimeDescriptionPipe,
        AvatarUploadDialogComponent,
        UserAvatarComponent,
        BackButtonComponent,
        DescriptionDialogComponent,
        AutosizeDirective,
        TableFiltersComponent,
        NumberMaxPipe,
        FormatCreateDialogComponent,
        EntitySummaryComponent,
        LinkCreateDialogComponent,
        RatingComponent,
        CommentComponent,
        TeamMemberCardComponent,
        TeamSubmissionsComponent,
        ActivityTemplateListComponent,
        ActivityTemplateListItemComponent,
        MessengerChatComponent,
        MessengerOverviewComponent,
        MessengerComponent,
        MessengerChatRoomCardComponent,
        RouterTabComponent,
        RouterTabItem,
        RouterTab,
        LinkEditDialogComponent,
        AddLinkTargetPipe,
        TailButtonComponent,
        ViewToggleComponent,
        FormatListComponent,
        AddLinkTargetPipe,
        BetaTagComponent,
        FilterToggleGroupComponent,
        MeetingStartComponent,
        FormatCurrentStateComponent,
        EditFileDialogComponent,
        WorkspaceLicenseSummaryComponent,
        BorderCardComponent,
        NavigationButtonComponent,
        EditFileDialogComponent,
        SendMailDialogComponent,
        ...canvasComponents,
        MeetingTypeDialogComponent,
        MeetingJoinDialogComponent,
        AdminConsentDialogComponent,
        MemberProfileComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        LayoutModule,
        RouterModule,
        MaterialModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        TranslateModule,
        ClampyModule,
        DragDropModule,
        NgxUploaderModule,
        ImageCropperModule,
        FileSizeModule,
        InfiniteScrollModule,
        TextInputHighlightModule,
        GridsterModule,
        ColorPickerModule,
        ClipboardModule
    ],
    exports: [
        BaseFormInputComponent,
        BaseFormTextFieldComponent,
        BasePasswordInputComponent,
        BaseFormRadioSelectionComponent,
        InlineDatepickerComponent,
        InlineEditChecklistComponent,
        InlineEditTextComponent,
        InlineDropdownInputComponent,
        InfoBoxComponent,
        ActionBarComponent,
        SidenavComponent,
        ListCardItemComponent,
        ListRowItemComponent,
        LoadingIndicatorComponent,
        UserCardComponent,
        UserListItemComponent,
        FileListComponent,
        LinkListComponent,
        PhaseGridListComponent,
        TabNavbarComponent,
        MomentPipe,
        ClampDirective,
        ActivityListComponent,
        DurationPipe,
        DecimalProxyPipe,
        ProgressTableComponent,
        MomentPipe,
        KeyVisualUploadDialogComponent,
        KeyVisualComponent,
        MediaComponent,
        PaginationContainerComponent,
        MainChipComponent,
        EditableChipComponent,
        UserroleChipComponent,
        HasPermissionDirective,
        DownloadLinkDirective,
        SafeUrlPipe,
        TimeDescriptionPipe,
        EmptyStateComponent,
        AvatarUploadDialogComponent,
        UserAvatarComponent,
        BackButtonComponent,
        DescriptionDialogComponent,
        TableFiltersComponent,
        NumberMaxPipe,
        FormatCreateDialogComponent,
        EntitySummaryComponent,
        LinkCreateDialogComponent,
        RatingComponent,
        CommentComponent,
        TeamMemberCardComponent,
        TeamSubmissionsComponent,
        ActivityTemplateListComponent,
        ActivityTemplateListItemComponent,
        MessengerComponent,
        RouterTabComponent,
        RouterTabItem,
        RouterTab,
        LinkEditDialogComponent,
        AddLinkTargetPipe,
        TailButtonComponent,
        ViewToggleComponent,
        FormatListComponent,
        BetaTagComponent,
        FilterToggleGroupComponent,
        FormatCurrentStateComponent,
        EditFileDialogComponent,
        FormatCurrentStateComponent,
        BaseFormSelectComponent,
        WorkspaceLicenseSummaryComponent,
        BorderCardComponent,
        NavigationButtonComponent,
        BaseFormSelectComponent,
        GridsterModule,
        SendMailDialogComponent,
        ...canvasComponents,
        MeetingTypeDialogComponent,
        MeetingJoinDialogComponent,
        AdminConsentDialogComponent,
        MemberProfileComponent
    ]
})
export class SharedModule {}
