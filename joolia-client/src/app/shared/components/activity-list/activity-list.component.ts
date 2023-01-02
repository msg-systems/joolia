import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Activity, List } from '../../../core/models';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ActivityService } from '../../../core/services';
import { Router } from '@angular/router';

@Component({
    selector: 'app-activity-list',
    templateUrl: './activity-list.component.html',
    styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit, OnChanges, OnDestroy {
    @Input() activityList: List<Activity>;
    @Input() startDate: moment.Moment;
    @Input() isHourSchedule: boolean;
    @Input() isAddAllowed = false;
    @Input() isDeleteAllowed = false;
    @Output() activityDropped: EventEmitter<any> = new EventEmitter();
    @Output() activityDeleted: EventEmitter<any> = new EventEmitter();
    @Output() activityCreated: EventEmitter<number> = new EventEmitter<number>();
    @Output() activityClicked: EventEmitter<string> = new EventEmitter<string>();
    @Output() activityFromTemplateClicked: EventEmitter<number> = new EventEmitter<number>();
    showButtons = true;
    dragging = false;
    timeSlots: moment.Moment[] = [];
    focusedActivityId: string;
    private subscriptions: Subscription[] = [];

    constructor(private activityService: ActivityService, private activeRoute: Router) {}

    ngOnInit() {
        this.calculateSlots();
        this.setFocusedActivity(this.activityService.getCurrentActivity());
        const activitySelected = this.activeRoute.url.includes('activity');
        if (this.focusedActivityId === null && this.activityList.count > 0 && !activitySelected) {
            // waiting for the subscription to fire takes too long, empty-state would be shown for a brief moment
            this.focusedActivityId = this.activityList.entities[0].id;

            this.activityClicked.emit(this.activityList.entities[0].id);
        }

        this.subscriptions.push(
            this.activityService.activityChanged.subscribe((activity: Activity) => {
                this.setFocusedActivity(activity);
            })
        );

        this.subscriptions.push(
            this.activityService.activityListChanged.subscribe(() => {
                this.calculateSlots();
            })
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('startDate')) {
            this.calculateSlots();
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    setFocusedActivity(activity: Activity) {
        this.focusedActivityId = activity ? activity.id : null;
    }

    drop(event) {
        this.activityDropped.emit(event);
    }

    addActivity(position: number, template: boolean) {
        if (template) {
            this.activityFromTemplateClicked.emit(position + 1);
        } else {
            this.activityCreated.emit(position + 1);
        }
    }

    onActivityClick(id: string) {
        this.activityClicked.emit(id);
    }

    deleteActivity(item) {
        this.activityDeleted.emit(item);
    }

    getHeight(activity: Activity) {
        // "units" of time; one unit is 15 minutes or 1 day, depending on the type of scheduling
        const units = activity.duration / (this.isHourSchedule ? 15 : 24 * 60);
        let height = Math.log(units);
        height *= 48; // scale it by some value (chosen more or less randomly)
        height += 64; // add constant offset that results in a height that allows one line of text for the title
        return height + 'px';
    }

    calculateSlots() {
        this.timeSlots = [];
        this.activityList.entities.forEach((activity, i) => {
            if (i === 0) {
                this.timeSlots.push(moment(this.startDate));
            } else {
                const startDate = moment(this.timeSlots[i - 1]).add(this.activityList.entities[i - 1].duration, 'minutes');
                this.timeSlots.push(startDate);
            }
        });
    }

    getTimeslot(i: number) {
        if (!this.timeSlots) {
            this.calculateSlots();
        }
        return this.timeSlots[i];
    }

    dragStarted() {
        document.body.style.cursor = 'move';
        this.showButtons = false;
        this.dragging = true;
    }

    dragEnded() {
        document.body.style.cursor = 'default';
        this.showButtons = true;
        this.dragging = false;
    }
}
