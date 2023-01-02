import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService, SnackbarService } from '../../../core/services';

@Component({
    selector: 'description-dialog',
    templateUrl: './description-dialog.component.html',
    styleUrls: ['./description-dialog.component.scss']
})
export class DescriptionDialogComponent implements OnInit {
    keys: string[] = [];

    constructor(
        private dialogRef: MatDialogRef<DescriptionDialogComponent>,
        private translate: TranslateService,
        private snackbarService: SnackbarService
    ) {}

    ngOnInit() {
        const editorDescriptionKeys = ConfigurationService.getConfiguration().configuration.editorDescription.keys;

        for (let i = 0; i < editorDescriptionKeys.length; i++) {
            this.keys.push('dialog.description.' + editorDescriptionKeys[i]);
        }
    }

    onCopyClicked(key: string) {
        const fullKey = key + '.leftSide';

        /*
         * gets the code-text from i18n.
         * creates a invisible select-box with this text.
         * copies the text into clipboard and removes the select-box.
         * necessary because missing possibility to insert directly into clipboard.
         */
        this.translate.get(fullKey).subscribe((textToCopy) => {
            const selectBox = document.createElement('textarea');
            selectBox.style.position = 'fixed';
            selectBox.style.left = '0';
            selectBox.style.top = '0';
            selectBox.style.opacity = '0';
            selectBox.value = textToCopy;
            document.body.appendChild(selectBox);
            selectBox.focus();
            selectBox.select();
            document.execCommand('copy');
            document.body.removeChild(selectBox);
        });

        this.snackbarService.openWithMessage('dialog.description.snackbarHint');
    }
}
