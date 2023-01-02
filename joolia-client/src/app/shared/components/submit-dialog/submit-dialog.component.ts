import { Component, Inject, OnInit, Self } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Activity, FileMeta, Format, Phase, SelectOption, SubmitDialogDataModel } from '../../../core/models';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
    ActivityService,
    ConfigurationService,
    FormatService,
    NgxUploadService,
    PhaseService,
    SnackbarService,
    SubmissionService
} from '../../../core/services';
import { UploadOutput } from 'ngx-uploader';
import { TranslateService } from '@ngx-translate/core';
import { NgxOutputEvents } from '../../../core/enum/global/upload.enum';

@Component({
    selector: 'app-submit-dialog',
    templateUrl: './submit-dialog.component.html',
    styleUrls: ['./submit-dialog.component.scss']
})
export class SubmitDialogComponent implements OnInit {
    submitDialogForm: FormGroup;
    files: FileMeta[] = [];
    characterLimits;
    currentActivity: Activity;
    teams: SelectOption[];
    isSubmitting = false;
    noTeamsError = false;
    outdatedActivityError = false;
    createdSubmissionId: string;
    format: Format;
    phase: Phase;

    constructor(
        private dialogRef: MatDialogRef<SubmitDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: SubmitDialogDataModel,
        private ngxUS: NgxUploadService,
        private submissionService: SubmissionService,
        private formatService: FormatService,
        private phaseService: PhaseService,
        private activityService: ActivityService,
        private translate: TranslateService,
        private snackbarService: SnackbarService
    ) {
        this.format = this.formatService.getCurrentFormat();
        this.phase = this.phaseService.getCurrentPhase();
    }

    ngOnInit() {
        this.characterLimits = ConfigurationService.getConfiguration().configuration.characterLimits.submission;
        this.currentActivity = this.activityService.getCurrentActivity();

        this.submitDialogForm = new FormGroup({
            name: new FormControl('', [Validators.required]),
            description: new FormControl()
        });

        if (this.data.teams && this.data.teams.length === 0) {
            this.noTeamsError = true;
        } else {
            if (this.data.members.length > 1) {
                const member = this.data.members[0].value;
                const membersForm = new FormControl(member, [Validators.required]);
                membersForm.valueChanges.subscribe((value) => {
                    if (this.data.teams) {
                        this.teams = this.data.teams.filter((t) => t.value.members.find((m) => m.id === value.id));
                        this.submitDialogForm.get('team').setValue(this.teams[0].value);
                    }
                });
                this.submitDialogForm.addControl('member', membersForm);
                this.teams = this.data.teams ? this.data.teams.filter((t) => t.value.members.find((m) => m.id === member.id)) : null;
            } else {
                this.teams = this.data.teams || null;
            }

            if (this.data.teams) {
                this.submitDialogForm.addControl('team', new FormControl(this.teams[0].value, [Validators.required]));
            }
        }
    }

    onUploadOutput(output: UploadOutput) {
        switch (output.type) {
            case NgxOutputEvents.ALLADDEDTOQUEUE:
                // perform upload on click 'submit'
                break;
            case NgxOutputEvents.ADDEDTOQUEUE:
                this.files.push(<FileMeta>{
                    id: output.file.id,
                    name: output.file.name,
                    upload: output.file
                });
                break;
            case NgxOutputEvents.DONE:
                this.ngxUS.ondone(output, [], true);
                if (this.ngxUS.checkAllUploadDone()) {
                    this.snackbarService.openWithMessage('upload.successful', { fileName: this.submitDialogForm.value.name });
                    this.dialogRef.close(this.submissionService.getCurrentSubmission());
                }
                break;
            case NgxOutputEvents.REJECTED:
                this.ngxUS.onrejected(output, []);
                break;
            case NgxOutputEvents.CANCELLED:
                this.cancelSubmission();
                break;
        }
    }

    onFileDelete(fileId) {
        this.ngxUS.abortFileUpload(this.files.find((file) => file.id === fileId));
        this.files = this.files.filter((file) => file.id !== fileId);
    }

    onSubmit() {
        Object.values(this.submitDialogForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.submitDialogForm.valid) {
            const form = this.submitDialogForm.value;
            const body = {
                name: form.name,
                description: form.description,
                submittedById: form.team ? form.team.id : form.member ? form.member.id : this.data.members[0].value.id
            };

            this.isSubmitting = true;

            this.submissionService.createSubmission(this.format.id, this.phase.id, this.currentActivity.id, body).subscribe(
                (createdSubmission) => {
                    if (this.files.length === 0) {
                        this.dialogRef.close(createdSubmission);
                    } else {
                        this.createdSubmissionId = createdSubmission.id;
                        const parent =
                            `/format/${this.format.id}/phase/${this.phase.id}/activity/${this.currentActivity.id}` +
                            `/submission/${createdSubmission.id}`;
                        this.ngxUS.onallAddedToQueue(<UploadOutput>{ type: NgxOutputEvents.ALLADDEDTOQUEUE }, this.files, parent);
                    }
                },
                (err) => {
                    if (err.status === 400) {
                        this.outdatedActivityError = true;
                    }

                    this.isSubmitting = false;
                }
            );
        }
    }

    cancelSubmission() {
        this.isSubmitting = false;
        this.submissionService
            .deleteSubmission(this.format.id, this.phase.id, this.currentActivity.id, this.createdSubmissionId)
            .subscribe();
    }
}
