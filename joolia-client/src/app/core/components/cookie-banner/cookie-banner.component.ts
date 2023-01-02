import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-cookie-banner',
    templateUrl: './cookie-banner.component.html',
    styleUrls: ['./cookie-banner.component.scss']
})
export class CookieBannerComponent {
    constructor(private _bottomSheetRef: MatBottomSheetRef<CookieBannerComponent>) {}

    dismiss(accepted: boolean) {
        this._bottomSheetRef.dismiss(accepted);
    }
}
