import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { ConfigurationService } from './app/core/services';
import { hmrBootstrap } from './hmr';

if (environment.production) {
    enableProdMode();
}

const bootstrap = () =>
    platformBrowserDynamic()
        .bootstrapModule(AppModule)
        .then((ngModuleRef) => {
            // TODO: Workaround for version 7.1.x of Angular to registrate service worker needs to be solved with upgrade
            if ('serviceWorker' in navigator && environment.production) {
                navigator.serviceWorker.register(ConfigurationService.getConfiguration().appBaseHref + 'ngsw-worker.js');
            }

            return ngModuleRef;
        });

if (environment.hmr) {
    if (module['hot']) {
        hmrBootstrap(module, bootstrap);
    } else {
        console.log('HMR is not enabled for webpack-dev-server!');
        console.log('Are you using the --hmr flag for ng serve?');
    }
} else {
    bootstrap().catch((err) => console.log(err));
}
