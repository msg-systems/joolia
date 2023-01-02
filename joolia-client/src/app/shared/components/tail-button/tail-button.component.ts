import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';

@Component({
    selector: 'tail-button',
    styleUrls: ['./tail-button.component.scss'],
    templateUrl: './tail-button.component.html'
})
export class TailButtonComponent<T> {
    /**
     * Optional material icon key
     */
    @Input() icon: string;

    /**
     * I18n text key for deriving the button label
     */
    @Input() label: string;

    /**
     * If provided, the component instance won't raise click events, but open the
     * popup upon clicking on the button.
     *
     * Use in conjunction with @ViewChild(FooterLikeButtonComponent, {static: false}.
     * Refer to the documentation of the method {@link closePopup}.
     *
     * @see closePopup
     */
    @Input() popup: ComponentType<T> | TemplateRef<T>;

    /**
     * If set true no click event is raised and the component is greyed out.
     */
    @Input() disabled: boolean;

    /**
     * Event emitter for onClick events. Will raise only events if no {@link popup} is given.
     */
    @Output() clicked = new EventEmitter<Event>();

    private dialogRef: MatDialogRef<T>;

    constructor(private dialog: MatDialog) {}

    onClick(event) {
        if (this.disabled) {
            return;
        }
        if (this.popup) {
            this.dialogRef = this.dialog.open(this.popup);
        } else {
            this.clicked.emit(event);
        }
    }

    /**
     * Use together with the popup input. In the client components, inject a reference with
     *
     * <pre><code>
     * @ViewChild(FooterLikeButtonComponent, { static: false }) addButton: FooterLikeButtonComponent<any>;
     * </code></pre>
     *
     * in order to be able to close the popup after the user confirmed a selection, for example.
     */
    closePopup() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}
