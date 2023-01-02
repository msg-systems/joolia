import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ImprintComponent } from './imprint/imprint.component';
import { InformationAndTerminologyComponent } from './information-and-terminology/information-and-terminology.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';

const legalRoutes: Routes = [
    { path: '', redirectTo: 'imprint', pathMatch: 'full' },
    { path: 'imprint', component: ImprintComponent },
    { path: 'information-and-terminology', component: InformationAndTerminologyComponent },
    { path: 'privacy-policy', component: PrivacyPolicyComponent },
    { path: 'terms-and-conditions', component: TermsAndConditionsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(legalRoutes)],
    exports: [RouterModule]
})
export class LegalPagesRoutingModule {}
