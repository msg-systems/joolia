import { Component, OnInit } from '@angular/core';
import { Library } from '../../../../../core/models';
import { Subscription } from 'rxjs/internal/Subscription';
import { LibraryService } from '../../../../../core/services';

@Component({
    selector: 'app-library-template-details',
    templateUrl: './library-template-details.component.html',
    styleUrls: ['./library-template-details.component.scss']
})
export class LibraryTemplateDetailsComponent implements OnInit {
    library: Library;

    private subscription: Subscription;

    constructor(private libraryService: LibraryService) {}

    ngOnInit() {
        this.library = this.libraryService.getCurrentLibrary();

        this.subscription = this.libraryService.libraryChanged.subscribe((library: Library) => {
            this.library = library;
        });
    }
}
