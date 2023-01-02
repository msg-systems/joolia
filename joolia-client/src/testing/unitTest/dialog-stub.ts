import { of } from 'rxjs';
import { EventEmitter, Output, Directive } from '@angular/core';

export class DialogStub {
    private defaultReplyAfterClosed: any;
    constructor(defaultReplyAfterClosed: any) {
        this.defaultReplyAfterClosed = defaultReplyAfterClosed;
    }

    open() {
        return {
            afterClosed: () => of(this.defaultReplyAfterClosed)
        };
    }

    close() {}

    setDefaultReply(defaultReplyAfterClosed: any) {
        this.defaultReplyAfterClosed = defaultReplyAfterClosed;
    }
}

@Directive()
export class LinkEditDialogStub {
    @Output() deleteLinkClicked: EventEmitter<string> = new EventEmitter<string>();
    @Output() editLinkClicked: EventEmitter<string> = new EventEmitter<string>();

    private defaultReplyAfterClosed: any;

    constructor(data: any) {
        this.defaultReplyAfterClosed = data;
    }

    setDefaultReplyAfterClosed(data: any) {
        this.defaultReplyAfterClosed = data;
    }

    open() {
        return {
            onopen: this,
            afterClosed: () => of(this.defaultReplyAfterClosed)
        };
    }

    close() {}
}
