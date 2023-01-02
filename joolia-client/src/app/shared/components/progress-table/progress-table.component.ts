import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CheckedBy, ProgressRow, Step, StepCheckedEvent } from '../../../core/models';
import { detailExpandAnimation } from '../../../core/animations';
import { ConfigurationService } from '../../../core/services';

/**
 * The ProgressTableComponent displays a table with one row for each given team / member.
 * The rows can be expanded (only one at a time) to show the checklist of the given steps for the selected team / member
 * and to (un)check the steps for this team / member.
 */
@Component({
    selector: 'progress-table',
    templateUrl: './progress-table.component.html',
    styleUrls: ['./progress-table.component.scss'],
    animations: [detailExpandAnimation]
})
export class ProgressTableComponent implements OnChanges {
    @Input() teamsOrMembers: CheckedBy[];
    @Input() steps: Step[];
    @Input() checkable: boolean;
    @Input() notExpandable = false;
    @Input() noTeamsOrMembersLabel: string;
    @Output() stepChecked: EventEmitter<StepCheckedEvent> = new EventEmitter<StepCheckedEvent>();

    data: ProgressRow[] = [];

    displayedColumns;
    sortingKey: string;
    expandedRow: ProgressRow = null;

    constructor() {}

    ngOnChanges(simpleChanges: SimpleChanges) {
        const configuration = ConfigurationService.getConfiguration().configuration.tableConfigs.activityProgress;
        this.displayedColumns = configuration.columns;
        this.sortingKey = configuration.defaultSortingKey;

        const steps = simpleChanges.steps;
        const teamsOrMembers = simpleChanges.teamsOrMembers;
        const newData = [];
        const resetData =
            this.data.length === 0 ||
            (teamsOrMembers && this.data.length / 2 !== teamsOrMembers.currentValue.length) ||
            (steps && this.data.find((r) => r.isDetailRow).stepList.length !== steps.currentValue.length);

        if (this.steps && this.teamsOrMembers) {
            this.teamsOrMembers.forEach((tom) => {
                const checkedSteps = this.steps.filter((s) => s.checkedBy.includes(tom.id)).map((s) => s.id);

                const stepList = this.steps.map((step: Step) => {
                    return { itemId: step.id, content: step.description, checked: checkedSteps.includes(step.id) };
                });

                const row = <ProgressRow>{
                    id: tom.id,
                    name: tom.name,
                    progressText: `${checkedSteps.length}/${this.steps.length}`,
                    progressPercentage: (checkedSteps.length / this.steps.length) * 100,
                    isDetailRow: false
                };

                const detail = <ProgressRow>{
                    id: tom.id,
                    name: tom.name,
                    stepList,
                    isDetailRow: true
                };

                if (resetData) {
                    newData.push(row);
                    newData.push(detail);
                } else {
                    // this is for updating UI after changing the progress of a team
                    const existingRow = this.data.find((r) => !r.isDetailRow && r.id === tom.id);
                    existingRow.progressText = row.progressText;
                    existingRow.progressPercentage = row.progressPercentage;
                    const existingDetail = this.data.find((r) => r.isDetailRow && r.id === tom.id);
                    existingDetail.stepList = stepList;
                }
            });
        }
        // this is for updating UI after added or removed steps
        if (resetData) {
            this.data = newData.sort(this.sortRows.bind(this));
        }
    }

    private sortRows(a: ProgressRow, b: ProgressRow) {
        const cmpNames = a[this.sortingKey].localeCompare(b[this.sortingKey]);
        if (cmpNames === 0) {
            const cmpIds = a.id.localeCompare(b.id);
            if (cmpIds === 0) {
                return a.isDetailRow ? 1 : -1;
            } else {
                return cmpIds;
            }
        } else {
            return cmpNames;
        }
    }

    isDetailRow(i: number, row: ProgressRow) {
        return row.isDetailRow;
    }

    expandRow(row: ProgressRow) {
        this.expandedRow = this.expandedRow && this.expandedRow.id === row.id ? null : row;
    }

    onCheckStep(checkedById: string, stepId: string) {
        const done = !this.data.find((row) => row.isDetailRow && row.id === checkedById).stepList.find((step) => step.itemId === stepId)
            .checked;
        this.stepChecked.emit(<StepCheckedEvent>{
            checkedById,
            stepId,
            done
        });
    }
}
