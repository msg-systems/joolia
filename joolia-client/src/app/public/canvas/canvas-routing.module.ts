import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanvasDetailsComponent } from './canvas-details/canvas-details.component';

/**
 * The CanvasRoutingModule handles all routes used for the navigation to and between canvas pages.
 */
const canvasRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: ':canvasId',
                component: CanvasDetailsComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(canvasRoutes)],
    exports: [RouterModule]
})
export class CanvasRoutingModule {}
