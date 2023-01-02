import { Component, Input } from '@angular/core';

@Component({
    selector: 'main-chip',
    templateUrl: './main-chip.component.html',
    styleUrls: ['./main-chip.component.scss']
})
export class MainChipComponent {
    @Input() message: string;
    @Input() noContent = false;
    @Input() icon: string;
    @Input() outline = false;

    constructor() {}
}
