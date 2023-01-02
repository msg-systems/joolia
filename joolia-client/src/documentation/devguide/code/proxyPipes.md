# Proxy Pipes

### Standard Angular Pipes

Standard Angular pipes like DecimalPipe, DatePipe or the CurrencyPipe are implemented relying on the LOCALE_ID value. Since we use TranslateService of `@ngx-translate/core` for Internationalization, the Pipes should use the language currently used in TranslationService. Therefore, the concept of Proxy Pipes is introduced. These pipes simply call the Standard Angular Pipes with the currently used language of TranslationService to transform the input.

### Registering locale data

DatePipe, CurrencyPipe, DecimalPipe and PercentPipe use locale data to format data. By default, Angular only contains locale data for en-US. To use another locale, you must import locale data for that new locale manually.
