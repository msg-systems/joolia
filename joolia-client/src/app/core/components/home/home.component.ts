import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from '../../services';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    jooliaLogoSrc: string;
    illustrationSrc: string;
    contactLink: string;

    constructor(private translate: TranslateService, private titleService: Title) {}

    ngOnInit() {
        const appBaseHref = ConfigurationService.getConfiguration().appBaseHref;
        this.jooliaLogoSrc = appBaseHref + 'assets/Joolia_Logo_small.png';
        this.illustrationSrc = appBaseHref + 'assets/Joolia_illustration.png';
        this.contactLink = ConfigurationService.getConfiguration().configuration.links.contact;

        this.translate.get('home.pageTitle').subscribe((title: string) => {
            this.titleService.setTitle(title);
        });
    }

    scroll(el: HTMLElement) {
        el.scrollIntoView({ behavior: 'smooth' });
    }

    contactClicked() {
        window.open(this.contactLink, '_self');
    }
}
