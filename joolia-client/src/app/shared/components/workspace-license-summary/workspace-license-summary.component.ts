import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'workspace-license-summary',
    templateUrl: './workspace-license-summary.component.html',
    styleUrls: ['./workspace-license-summary.component.scss']
})
export class WorkspaceLicenseSummaryComponent implements OnInit {
    @Input() licenseAmount: number;
    @Input() usedLicenseAmount: number;
    percentageUsage: number;
    allLicensesUsed: boolean;

    ngOnInit() {
        this.percentageUsage = this.usedLicenseAmount < this.licenseAmount ? (this.usedLicenseAmount / this.licenseAmount) * 100 : 100;
        this.allLicensesUsed = this.usedLicenseAmount >= this.licenseAmount;
    }
}
