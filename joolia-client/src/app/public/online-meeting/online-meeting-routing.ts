import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';

const onlineMeetingRoutes: Routes = [
    {
        path: '',
        component: AuthCallbackComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(onlineMeetingRoutes)],
    exports: [RouterModule]
})
export class OnlineMeetingRoutingModule {}
