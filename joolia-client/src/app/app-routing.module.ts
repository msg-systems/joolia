import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorComponent, FooterComponent, HomeComponent } from './core/components';
import { AuthenticationGuard, LoggedInGuard } from './core/guards';
import { FileUploadGuard } from './core/guards';

const appRoutes: Routes = [
    { path: 'home', component: HomeComponent, canActivate: [LoggedInGuard] },
    {
        path: '',
        component: FooterComponent,
        canActivate: [FileUploadGuard],
        canActivateChild: [FileUploadGuard],
        children: [
            {
                path: 'user',
                loadChildren: () => import('./public/user/user.module').then((m) => m.UserModule),
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'callback',
                loadChildren: () => import('./public/online-meeting/online-meeting.module').then((m) => m.OnlineMeetingModule),
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'workspace',
                loadChildren: () => import('./public/workspace/workspace.module').then((m) => m.WorkspaceModule),
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'format',
                loadChildren: () => import('./public/format/format.module').then((m) => m.FormatModule),
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'library',
                loadChildren: () => import('./public/library/library.module').then((m) => m.LibraryModule),
                canActivate: [AuthenticationGuard]
            },
            {
                path: 'legal',
                loadChildren: () => import('./public/legal-pages/legal-pages.module').then((m) => m.LegalPagesModule)
            },
            { path: 'error', component: ErrorComponent },
            { path: '', redirectTo: '/home', pathMatch: 'full' },
            { path: '**', redirectTo: '/error' }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            { scrollPositionRestoration: 'enabled' }
            // { preloadingStrategy: PreloadAllModules } // If we want any preloading strategies here
            // , { enableTracing: true } // <-- debugging purposes only
        )
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
