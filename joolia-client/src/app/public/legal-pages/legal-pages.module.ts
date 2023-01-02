import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../../core/components';
import { TranslateModule } from '@ngx-translate/core';
import { LegalPagesRoutingModule } from './legal-pages-routing.module';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ImprintComponent } from './imprint/imprint.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { InformationAndTerminologyComponent } from './information-and-terminology/information-and-terminology.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [PrivacyPolicyComponent, ImprintComponent, TermsAndConditionsComponent, InformationAndTerminologyComponent],
    imports: [CommonModule, SharedModule, MaterialModule, FlexLayoutModule, TranslateModule, LegalPagesRoutingModule]
})
export class LegalPagesModule {}
