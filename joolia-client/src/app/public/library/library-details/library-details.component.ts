import { Component, OnDestroy, OnInit } from '@angular/core';
import { Library, SidenavItem } from '../../../core/models';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfigurationService, IQueryParams, LibraryService, UtilService } from '../../../core/services';

/**
 * The LibraryDetailsComponent displays the details of a library. From here the user can navigate to view the templates and members of the
 * library.
 */
@Component({
    selector: 'app-library-details',
    templateUrl: './library-details.component.html',
    styleUrls: ['./library-details.component.scss']
})
export class LibraryDetailsComponent implements OnInit, OnDestroy {
    sidenavItems: SidenavItem[] = [
        {
            sidenavKey: 'sidenav.library.templates',
            sidenavRouterLink: `template`,
            icon: 'library_books'
        },
        {
            sidenavKey: 'sidenav.library.members',
            sidenavRouterLink: `members`,
            icon: 'people'
        }
    ];

    library: Library;
    subscriptions: Subscription[] = [];

    constructor(private libraryService: LibraryService, private route: ActivatedRoute, private utilService: UtilService) {}

    ngOnInit() {
        this.subscriptions.push(
            this.libraryService.libraryChanged.subscribe((library) => {
                this.library = library;
            })
        );

        this.loadLibrary();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    private loadLibrary() {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().library.select.detailsOverview
        };

        this.libraryService.loadLibrary(this.route.snapshot.params['libraryId'], queryParams).subscribe(
            (data) => {},
            (err) => {
                this.utilService.logAndNavigate(err.error, this, this.loadLibrary, 'snackbar.libraryNotFound', '/library/overview');
            }
        );
    }
}
