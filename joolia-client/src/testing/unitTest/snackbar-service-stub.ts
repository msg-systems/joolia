import { SnackbarService } from '../../app/core/services';
import { ComponentType } from '@angular/cdk/portal';
import { TemplateRef } from '@angular/core';

export class SnackbarServiceStub implements Partial<SnackbarService> {
    public _openFromTemplateCalls: any[] = [];
    public _openFromComponentCalls: any[] = [];
    public _openWithMessageCalls: any[] = [];

    openWithMessage(message: string, messageParams?: Object, action?: string): any {
        this._openWithMessageCalls.push({ message, messageParams, action });
    }

    openFromComponent(component: ComponentType<any>): any {
        this._openFromComponentCalls.push(component);
    }

    openFromTemplate(template: TemplateRef<any>): any {
        this._openFromTemplateCalls.push(template);
    }

    _resetStubCalls() {
        this._openFromTemplateCalls.length = 0;
        this._openFromComponentCalls.length = 0;
        this._openWithMessageCalls.length = 0;
    }
}
