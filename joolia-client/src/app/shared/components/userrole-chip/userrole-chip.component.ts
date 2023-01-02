import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { UserRole } from '../../../core/models';

@Component({
    selector: 'userrole-chip',
    templateUrl: './userrole-chip.component.html',
    styleUrls: ['./userrole-chip.component.scss']
})
export class UserroleChipComponent implements OnInit, OnChanges {
    @Input() userRole: UserRole;

    highlighted: boolean;
    label: string;

    constructor() {}

    ngOnInit() {
        this.updateChip();
    }

    ngOnChanges(changes): void {
        this.updateChip();
    }

    updateChip() {
        switch (this.userRole) {
            case UserRole.ORGANIZER:
                this.label = 'labels.organizer';
                this.highlighted = true;
                break;
            case UserRole.ADMIN:
                this.label = 'labels.admin';
                this.highlighted = true;
                break;
            case UserRole.TECHNICAL:
                this.label = 'labels.technical';
                this.highlighted = false;
                break;
            default:
                this.label = 'labels.participant';
                this.highlighted = false;
                break;
        }
    }
}
