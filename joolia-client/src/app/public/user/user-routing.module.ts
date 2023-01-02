import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './profile/user.component';

/**
 * The UserRoutingModule handles all routes used for the navigation to and between profile pages
 */
const userRoutes: Routes = [
    {
        path: '',
        component: UserComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(userRoutes)],
    exports: [RouterModule]
})
export class UserRoutingModule {}
