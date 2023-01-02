import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Action } from '../../../core/models';

/**
 * The ActionBarButtonsComponent is a toolbar contains multiple action buttons. When clicking a button, the corresponding given function
 * will be executed.
 */
@Component({
    selector: 'action-bar',
    templateUrl: './action-bar.component.html',
    styleUrls: ['./action-bar.component.scss']
})
export class ActionBarComponent implements OnInit, OnDestroy {
    @Input() showBackButton = false;
    @Input() backRouterLink: any[] | string = null;
    @Input() backLabelKey: string = null;
    @Input() backLabelParams: any = null;
    @Input() actions: Action[] = [];
    @Input() changeAction: Observable<{ actionKey: string; disabled: boolean }>;

    private eventSubscription: Subscription;

    constructor() {}

    executeActionFunction(action: Action) {
        if (action.actionFunction) {
            action.actionFunction();
        }
    }

    ngOnInit() {
        if (this.changeAction) {
            this.eventSubscription = this.changeAction.subscribe((data) => this.enableDisableActionButton(data));
        }
    }

    ngOnDestroy() {
        if (this.eventSubscription) {
            this.eventSubscription.unsubscribe();
        }
    }

    enableDisableActionButton(data: { actionKey: string; disabled: boolean }) {
        const action = this.actions.find((a) => a.actionKey === data.actionKey);
        if (action) {
            action.disabled = data.disabled;
        }
    }
}
