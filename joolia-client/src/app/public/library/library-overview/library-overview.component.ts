import { Component, OnInit } from '@angular/core';
import { LibraryService } from 'src/app/core/services/library.service';
import { Action, Library, List, SidenavItem } from '../../../core/models';
import { ConfigurationService, IQueryParams, SnackbarService, UserService } from '../../../core/services';
import { EMPTY, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LibraryCreateDialogComponent } from '../library-create-dialog/library-create-dialog.component';
import { catchError } from 'rxjs/operators';
import { ErrorDialogComponent } from '../../../shared/components/error-dialog/error-dialog.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';

/**
 * The LibraryOverviewComponent displays all libraries the user has access to. From here the user can switch between which libraries
 * should be shown, delete libraries and can create new libraries.
 */
@Component({
    selector: 'app-library-overview',
    templateUrl: './library-overview.component.html',
    styleUrls: ['./library-overview.component.scss']
})
export class LibraryOverviewComponent implements OnInit {
    actionBarActions: Action[] = [];
    libraryMenuActions: Action[] = [];

    libraryNameMaxLength: number;
    libraryList: List<Library>;
    isLoading = false;
    noMoreLoadable = false;
    subscriptions: Subscription[] = [];
    infiniteScrollDistance: number;
    infiniteScrollThrottle: number;
    loading: boolean;

    constructor(
        private libraryService: LibraryService,
        private userService: UserService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private translate: TranslateService,
        private snackBarService: SnackbarService
    ) {
        this.loading = false;
    }

    ngOnInit() {
        this.libraryNameMaxLength = ConfigurationService.getConfiguration().configuration.characterLimits.library.name;

        this.subscriptions.push(
            this.userService.loggedInUserChanged.subscribe(() => {
                this.checkAdminValidation();
            })
        );

        this.subscriptions.push(
            this.libraryService.libraryListChanged.subscribe((libraryList: List<Library>) => {
                this.libraryList = libraryList;
                this.noMoreLoadable = this.libraryList.entities.length >= this.libraryList.count;
                this.isLoading = false;
            })
        );

        this.subscriptions.push(
            this.route.queryParams.subscribe(() => {
                this.getInitialLibraries();
            })
        );

        this.checkAdminValidation();
    }

    checkAdminValidation() {
        this.actionBarActions = [
            {
                actionKey: 'buttons.createLibrary',
                actionFunction: this.onLibraryCreate.bind(this)
            }
        ];

        this.libraryMenuActions = [
            {
                actionKey: 'buttons.delete',
                actionFunction: this.onLibraryDelete.bind(this)
            }
        ];
    }

    getInitialLibraries() {
        this.loadMore(0, ConfigurationService.getConfiguration().configuration.pagination.library.initialAmount);
    }

    onLoadMore() {
        this.loadMore(
            this.libraryList.entities.length,
            ConfigurationService.getConfiguration().configuration.pagination.library.loadMore,
            true
        );
    }

    getQueryParams() {
        const queryParams: IQueryParams = {
            select: ConfigurationService.getQueryParams().library.select.overview
        };

        if (this.route.snapshot.queryParams.recentlyUsed) {
            queryParams['order'] = '-updatedAt';
        } else {
            queryParams['order'] = 'name';
        }

        return queryParams;
    }

    loadMore(skip: number, take: number, loadMore?: boolean) {
        const queryParams = this.getQueryParams();

        queryParams['skip'] = skip;
        queryParams['take'] = take;

        this.isLoading = true;
        this.libraryService.loadLibraries(queryParams, loadMore).subscribe();
    }

    onLibraryCreate() {
        const dialogRef = this.dialog.open(LibraryCreateDialogComponent, { width: '400px' });

        dialogRef.afterClosed().subscribe((library: Library) => {
            if (library) {
                this.libraryService.createLibrary(library).subscribe(
                    () => {},
                    (error) => {
                        this.dialog.open(ErrorDialogComponent, {
                            width: '400px',
                            data: {
                                headerKey: 'dialog.errors.title',
                                contentKey: 'dialog.errors.content.libraryCreationError',
                                confirmKey: 'dialog.errors.confirm'
                            }
                        });
                    }
                );
            }
        });
    }

    onLibraryUpdate(libraryId, newLibraryName) {
        const library = this.libraryList.entities.find((l) => l.id === libraryId);
        if (library.name !== newLibraryName) {
            library.name = newLibraryName;
            const updatedLibrary = {
                name: newLibraryName
            };

            this.libraryService
                .patchLibrary(libraryId, updatedLibrary)
                .pipe(
                    catchError(() => {
                        this.dialog.open(ErrorDialogComponent, {
                            width: '400px',
                            data: {
                                headerKey: 'dialog.errors.title',
                                contentKey: 'dialog.errors.content.libraryNotFound',
                                confirmKey: 'dialog.errors.confirm'
                            }
                        });
                        return EMPTY;
                    })
                )
                .subscribe();
        }
    }

    onLibraryDelete(libraryId: string) {
        const selectedLibrary = this.libraryList.entities.find((library) => library.id === libraryId);
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                headerKey: 'dialog.delete.header',
                contentKey: 'dialog.delete.libraryDeletion',
                contentParams: { objectName: selectedLibrary.name },
                cancelKey: 'buttons.cancel',
                confirmKey: 'buttons.delete'
            }
        });

        dialogRef.afterClosed().subscribe((confirmation: boolean) => {
            if (confirmation) {
                this.libraryService.deleteLibrary(libraryId).subscribe(
                    () => {
                        this.snackBarService.openWithMessage('snackbar.libraryDeleted', { objectName: selectedLibrary.name });
                    },
                    (error) => {
                        this.dialog.open(ErrorDialogComponent, {
                            width: '400px',
                            data: {
                                headerKey: 'dialog.errors.title',
                                contentKey: 'dialog.errors.content.libraryDeletionError',
                                confirmKey: 'dialog.errors.confirm'
                            }
                        });
                    }
                );
            }
        });
    }

    onLibraryClick(libraryId: string) {
        this.loading = true;
        this.router.navigate(['library', libraryId]);
    }
}
