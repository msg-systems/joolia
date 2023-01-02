import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

/**
 * Add the template content to the DOM if the users userRole allows it.
 */
@Directive({ selector: '[appHasPermission]' })
export class HasPermissionDirective {
    private hasView = false;

    constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}

    @Input() set appHasPermission(permission: boolean) {
        if (permission && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!permission && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }
}
