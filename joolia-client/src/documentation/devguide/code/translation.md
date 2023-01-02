# Translation

##### General module information

The built-in translation module of Angular will not be used since it does not suffice our needs.
Instead, we are going to use the following 3 modules:

-   `ngx-translate/core` [(Link)](https://github.com/ngx-translate/core)
-   `ngx-translate/http-loader` [(Link)](https://github.com/ngx-translate/http-loader)
-   `ngx-translate-messageformat-compiler` [(Link)](https://github.com/lephyrus/ngx-translate-messageformat-compiler)

##### Implementation of TranslationModule

The module `@ngx-translate/core` provides a service for translations.
All translations are located in the directory `src/assets/i18n`.
In that directory, we have a JSON-file for each supported language that bind our translation keys to their corresponding translation strings.
Since translations are an essential part of the application, the translation module is part of the core module.
To load the JSON files needed for the translation, we have to specify an HttpLoader and a loading function to get the translations for the application.

```
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
      ...
    }),
    ...
  ],
  ...
})
```

The way how messages are formatted is configured in the core module within the TranslateModule and in the providers.
The default configuration is imported from the module and can be further configured as it is pleased.
The used languages have to be specified directly in the message format configuration or else the massage formatter tries to apply every language available to it.

```
@NgModule({
  imports: [
    TranslateModule.forRoot({
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatCompiler
      },
      ...
    }),
    ...
  ],
  providers: [
    { provide: MESSAGE_FORMAT_CONFIG, useValue: { locales: ['de', 'en'] }},
    ...
  ],
  ...
})
```

The TranslationService is initialized in the `app.component.ts`.
There, we define the provided languages and which one will be chosen by default.

```
constructor(private translate: TranslateService) {

  translate.addLangs(['en', 'de']);
  translate.setDefaultLang('en');

  const browserLang = translate.getBrowserLang();
  translate.use(browserLang.match(/en|de/) ? browserLang : 'en');
}
```

##### Rules in translation files

-   We do not want any duplicated translations strings.
-   Translation keys have to show in which context the translation key will be used (e.g. project).
-   Translation keys are written in camelcase style:
    ```
      "signIn": {
          "termsAndConditions": "Terms and Conditions"
      }
    ```

##### Translations in action

Translations can be handled in different ways.
To use the TranslationService, it still has to be provided in the constructor of the component.
There are 3 different ways to handle translations:

-   Via service:

```
translate.get('hello', {value: 'world'}).subscribe((res: string) => {
console.log(res);
//=> 'hello world'
});
```

-   Via pipe:

```
<div>{{ 'hello' | translate:param }}</div>
```

-   Via directive:

```
<div [translate]="'hello'" [translateParams]="{value: 'world'}"></div>
```

or

```
<div translate [translateParams]="{value: 'world'}">hello</div>
```

**IMPORTANT:** To guarantee a common code style, only pipes should be used in all HTML files and the service method should only be used when needed.

##### Pluralization

The module ‘ngx-translate-messageformat-compiler’ is used to enable pluralization for the translations. Pluralization enables to choose a translation string dynamically by given parameters.

```
"things": "There {count, plural, =0{is nothing} one{is a thing} other{are several things}}",
"gender": "{gender, select, male{He is} female{She is} other{They are}} {how}"
```
