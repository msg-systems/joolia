import { Component, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { ConfigurationService } from '../../../core/services';
import { HighlightTag } from 'angular-text-input-highlight';
import { TextInputHighlightComponent } from 'angular-text-input-highlight/text-input-highlight.component';

@Component({
    selector: 'inline-edit-text',
    templateUrl: './inline-edit-text.component.html',
    styleUrls: ['./inline-edit-text.component.scss']
})
export class InlineEditTextComponent implements OnInit {
    @Input() allowNewLines: boolean;
    @Input() inputClasses: string;
    @Input() inputText: string;
    @Input() inputPlaceholderKey: string;
    @Input() inputMaxLength: number;
    @Input() editable: boolean;
    @Output() inputChange: EventEmitter<string> = new EventEmitter();
    editMode = false;
    inputMaxLengthTechnical: number;
    inputMaxLengthValue: number;
    @ViewChild('textareaHighlight') private highlightComponent: TextInputHighlightComponent;
    private tags: HighlightTag[];

    constructor(private renderer: Renderer2) {}

    ngOnInit() {
        this.inputMaxLengthTechnical = ConfigurationService.getConfiguration().configuration.supportedBrowserMaxLengthValue;
        this.inputMaxLengthValue = this.inputMaxLength
            ? Math.min(this.inputMaxLength, this.inputMaxLengthTechnical)
            : this.inputMaxLengthTechnical;
        this.updateTags();
    }

    updateTags() {
        this.tags = [];
        if (this.inputText && this.inputText.length > this.inputMaxLengthValue) {
            this.tags.push({ indices: { start: this.inputMaxLengthValue, end: this.inputText.length }, cssClass: 'bg-red' });
        }

        // the component doesn't work correctly when entering newlines; this dirty hack calls an internal method to force an update
        if (this.highlightComponent) {
            this.highlightComponent['textInputElementChanged']();
        }
    }

    toggleEdit() {
        if (!this.editable) {
            return;
        }

        this.editMode = !this.editMode;

        if (this.editMode) {
            setTimeout(() => {
                // this will make the execution after the above boolean has changed
                this.renderer.selectRootElement('#editInput').focus();
            }, 0);
        }
    }

    @HostListener('keydown', ['$event'])
    onKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter' && (!this.allowNewLines || !event.shiftKey)) {
            this.onTextChange();
            return false;
        } else {
            return true;
        }
    }

    onInput() {
        this.updateTags();
    }

    @HostListener('paste', ['$event'])
    onPaste(event: KeyboardEvent) {
        if (!this.allowNewLines) {
            setTimeout(() => {
                this.inputText = this.inputText.replace(/[\r\n]+/g, ' ');
                this.updateTags();
            }, 0);
        }
    }

    onTextChange() {
        if (this.inputText.length <= this.inputMaxLengthValue) {
            this.inputChange.emit(this.inputText);
            this.toggleEdit();
        }
    }

    onClick(event) {
        if (this.editable) {
            this.inputText = this.inputText || '';
            event.stopPropagation();
            this.toggleEdit();
        }
    }
}
