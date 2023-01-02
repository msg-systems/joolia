import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Comment, List, User, UserRole } from 'src/app/core/models';
import { ConfigurationService, UserService } from 'src/app/core/services';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
    characterLimits;
    currentUser: User;
    displayCommentInput = false;

    @Input() comments: List<Comment>;
    @Input() userRole: UserRole.ORGANIZER | UserRole.PARTICIPANT | UserRole.TECHNICAL;
    @Output() sendComment: EventEmitter<Partial<Comment>> = new EventEmitter<Partial<Comment>>();
    @Output() deleteComment: EventEmitter<string> = new EventEmitter<string>();

    constructor(private userService: UserService, private dialog: MatDialog) {}

    ngOnInit() {
        this.characterLimits = ConfigurationService.getConfiguration().configuration.characterLimits.userComment;
        this.currentUser = this.userService.getCurrentLoggedInUser();
        this.displayCommentInput = this.userRole !== UserRole.TECHNICAL;
    }

    onSend(comment: HTMLInputElement) {
        comment.value.replace(new RegExp('/n', 'g'), '<br/>');
        const commentValue = comment.value.trim();

        const userComment: Partial<Comment> = {
            comment: commentValue,
            createdBy: this.userService.getCurrentLoggedInUser()
        };

        this.sendComment.emit(userComment);

        // remove values
        comment.value = '';
    }

    onDelete(comment: Comment) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.commentDeletion',
                contentParams: {},
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.deleteComment.emit(comment.id);
            }
        });
    }

    checkPermission(comment: Comment): boolean {
        return this.userRole === UserRole.ORGANIZER || comment.createdBy.id === this.currentUser.id;
    }
}
