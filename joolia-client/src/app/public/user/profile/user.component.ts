import { Component, OnInit } from '@angular/core';
import { ConfigurationService, SnackbarService, UserService } from '../../../core/services';
import {
    AvatarUploadDialogDataModel,
    MultiSelectionDialogData,
    MultiSelectOptionData,
    SelectOption,
    Skill,
    User
} from '../../../core/models';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AvatarUploadDialogComponent } from '../../../shared/components/avatar-upload/avatar-upload-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { SelectionDialogComponent } from '../../../shared/components/selection-dialog/selection-dialog.component';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
    user: User;
    userForm: FormGroup;
    userNameMaxLength: number;
    userSkillsMaxLength: number;
    companyMaxLength: number;
    skillSelectOptions: SelectOption[] = [];
    availableSkills: Skill[];

    constructor(
        private userService: UserService,
        private translate: TranslateService,
        private snackbarService: SnackbarService,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.user = this.userService.getCurrentLoggedInUser();

        this.userService.loggedInUserChanged.subscribe((user: User) => {
            this.user = user;
            this.userForm.setValue({
                name: this.user ? this.user.name : '',
                company: this.user ? this.user.company : ''
            });
        });

        const characterLimits = ConfigurationService.getConfiguration().configuration.characterLimits.user;
        this.userNameMaxLength = characterLimits.name;
        this.companyMaxLength = characterLimits.company;
        this.userSkillsMaxLength = ConfigurationService.getConfiguration().configuration.ranges.userSkills.max;

        this.userForm = new FormGroup({
            name: new FormControl(this.user ? this.user.name : '', [Validators.required, Validators.maxLength(this.userNameMaxLength)]),
            company: new FormControl(this.user ? this.user.company : '')
        });
    }

    onSubmit() {
        Object.values(this.userForm.controls).forEach((control) => {
            control.markAsTouched();
        });

        if (this.userForm.valid) {
            const body = {};

            if (this.user.name !== this.userForm.value['name']) {
                body['name'] = this.userForm.value['name'];
            }

            if (this.user.company !== this.userForm.value['company']) {
                body['company'] = this.userForm.value['company'];
            }
            if (body) {
                this.userService.updateProfile(body).subscribe(() => this.snackbarService.openWithMessage('labels.updateProfileSuccess'));
            }
        }
    }

    onUploadAvatar() {
        const parent = `/user/${this.user.id}/profile`;
        const data: AvatarUploadDialogDataModel = {
            headingKey: 'dialog.uploadAvatar.header',
            roundAvatar: true,
            onImageUploadOutput: this.userService.onAvatarUploadOutput.bind(this.userService, parent)
        };

        this.dialog.open(AvatarUploadDialogComponent, {
            minWidth: '320px',
            data
        });
    }

    onSkillDelete(skill: Skill) {
        const translatedSkill = this.translate.instant('skill.' + skill.name);
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.skill',
                contentParams: { objectName: translatedSkill },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.userService.deleteSkill(skill.id).subscribe(
                    () => {
                        this.snackbarService.openWithMessage('snackbar.skillDeleted', { objectName: translatedSkill });
                    },
                    (err) => {
                        this.snackbarService.openWithMessage('snackbar.skillDeletionError');
                    }
                );
            }
        });
    }

    onAddSkill() {
        this.userService.getAllAvailableSkills().subscribe((skills) => {
            this.removeUsedSkills(skills);
            this.availableSkills = skills;

            this.translate.get('skills').subscribe(() => {
                this.skillSelectOptions.length = 0;
                for (const skill of this.availableSkills) {
                    this.skillSelectOptions.push({ display: this.translate.instant('skill.' + skill.name), value: skill.id });
                }
                this.skillSelectOptions.sort((a: SelectOption, b: SelectOption) => a.display.localeCompare(b.display));

                this.openSkillDialogAndProcess();
            });
        });
    }

    removeUsedSkills(skills: Skill[]) {
        if (this.user.skills) {
            this.user.skills.forEach((s) => {
                const index = skills.findIndex((a) => a.name === s.name);
                if (index > -1) {
                    skills.splice(index, 1);
                }
            });
        }
    }

    openSkillDialogAndProcess() {
        const skillSelectionDetails: MultiSelectOptionData = {
            entityName: 'skill',
            selectOptions: this.skillSelectOptions,
            required: true
        };

        const data: MultiSelectionDialogData = {
            headerKey: 'dialog.addSkill.header',
            contentKey: 'dialog.addSkill.content',
            cancelKey: 'buttons.cancel',
            confirmKey: 'buttons.addSkill',
            selectionDetails: [skillSelectionDetails]
        };

        const dialogRef = this.dialog.open(SelectionDialogComponent, { minWidth: '340px', data });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.userService.addSkill([result['skill']]).subscribe(
                    () => {
                        this.snackbarService.openWithMessage('labels.updateProfileSuccess');
                    },
                    (err) => {
                        this.snackbarService.openWithMessage('snackbar.skillCreationError');
                    }
                );
            }
        });
    }
}
