import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Format, Permission, SidenavItem } from '../../../core/models';
import { ConfigurationService, FormatService, IQueryParams, UtilService } from '../../../core/services';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessengerComponent } from '../../messenger/messenger.component';
import { MessengerContext } from '../../../core/enum/global/messenger.enum';

@Component({
    selector: 'app-format-details',
    templateUrl: './format-details.component.html',
    styleUrls: ['./format-details.component.scss']
})
export class FormatDetailsComponent implements OnDestroy, OnInit {
    private readonly sidenavItems: SidenavItem[] = [
        {
            sidenavKey: 'sidenav.format.information',
            sidenavRouterLink: `information`,
            icon: 'info'
        },
        {
            sidenavKey: 'sidenav.format.schedule',
            sidenavRouterLink: `phase`,
            icon: 'insert_invitation'
        },
        {
            sidenavKey: 'sidenav.format.members',
            sidenavRouterLink: `members`,
            icon: 'people'
        },
        {
            sidenavKey: 'sidenav.format.teams',
            sidenavRouterLink: `teams`,
            icon: 'category_outline'
        },
        {
            sidenavKey: 'sidenav.format.submissions',
            sidenavRouterLink: `submissions`,
            icon: 'wb_incandescent'
        }
    ];

    format: Format;
    subscriptions: Subscription[] = [];
    currentSidenavItems: SidenavItem[] = [];
    messengerContext: string;
    fakeGoogleRecaptcha: boolean;

    @ViewChild(MessengerComponent)
    private messengerComponent: MessengerComponent;

    constructor(private formatService: FormatService, private route: ActivatedRoute, private utilService: UtilService) {
        this.fakeGoogleRecaptcha = ConfigurationService.getConfiguration().configuration.reCaptcha.fake;
    }

    ngOnInit() {
        this.subscriptions.push(
            this.formatService.formatChanged.subscribe((format: Format) => {
                this.format = format;
                this.setSidenavItems();
            })
        );

        this.messengerContext = MessengerContext.FORMAT;

        this.loadFormat();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    private loadFormat() {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().format.select.details
        };

        this.formatService.loadFormat(this.route.snapshot.params['formatId'], queryParams).subscribe(
            (data) => {},
            (err) => {
                this.utilService.logAndNavigate(err.error, this, this.loadFormat, 'snackbar.formatNotFound', 'format/overview');
            }
        );
    }

    setSidenavItems() {
        if (this.formatService.hasPermission(Permission.GET_SUBMISSIONS, this.format)) {
            this.currentSidenavItems = this.sidenavItems;
        } else {
            this.currentSidenavItems = this.sidenavItems.filter((item) => item.sidenavRouterLink !== `submissions`);
        }
    }
}
