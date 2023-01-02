# Code

Thou shall follow the official Angular style guide: [https://angular.io/guide/styleguide](https://angular.io/guide/styleguide)

## Comments

-   Comments need to fulfill these **standards to generate the documentation:**
    ```
    /**
     * This is a comment
     */
    ```
    or
    ```
    /** This is a comment */
    ```
-   **Comments are strongly encouraged.** It is very useful to be able to read comments and understand the intentions of a given block of code.
-   **Comments need to be clear,** just like the code they are annotating.
-   Make sure your comments are **meaningful**.
-   Comment with `// TODO:` to annotate solutions that need to be implemented.

## Variables

-   All variables must be declared prior to using them.
    This aids in code readability and helps prevent undeclared variables from being hoisted into the global scope.

## Events

-   Name of event should **tell what happened**, be in **present tense** and **camelCase**.
    ```
    e.g. fileCreated
    ```
-   Handler Methods name starts with **"on"**
    ```
    e.g. onFileCreated
    ```

# Angular

## Overall

### File Name:

The naming convention of **Angular CLI** will be used.

```
user.service.ts, user.module.ts
```

-   **Multiple Words** in **kebab-case**:
    ```
    user-list.service.ts,
    user-list.module.ts
    ```
-   **Consistent Naming:** (e.g. filename needs to match its modules name)
    ```
    Filename:     user-list.service.ts
    Declaration:  UserListService
    ```

### Lifecycle Hooks:

-   **OnChange** will not be triggered if it is a reference type and not a primitive
-   **ngdoCheck** should _not_ store very calculation intensive coding (**Performance!**)

## HTML (Angular related)

### Avoid logic in html file - use functions or variables.

Bad:

```
<div *ngIf="x && y && z || a">
```

Good:

```
<div *ngIf="isDisplayed()">
```

Good:

```
<div *ngIf="show">
```

### ViewChild

Only allowed for read access - do not change values.

Due to the changes in Angular 8 another field has to be specified when using ViewChild (e.g. static).

### ngFor

Keep in mind that there is `tracked by`

## Components

### Types of Components

There are two types of components in the application:

-   **Smart Components**  
    **Naming Convention:** app-component-name  
    **Description:** Can receive application specific injections in the constructor

-   **Presentational Components**  
    **Naming Convention:** component-name  
    **Description:** _Not allowed_ to use application specific logic.

### View Encapsulation

Do not change default. If there is need to do this please contact architecture.

### Avoid In-File HTML and CSS if possible

The definition should not be part of the component file. Put the definition in its intended file.

## Directives

-   Use **Renderer2** instead of ElementRef.

## Modules

-   Do not share modules by exporting them to use them in another module.
    Current exception: "MaterialModule"

## Services

-   Do not provide services in a shared module (**Multiple Instances!**) unless you need to.
-   Services should be stored in:
    -   Core Module
    -   Public Modules  
        Important (Multiple Instances) - When the service is defined there and the Module itself is lazy loaded you will have the same as storing the service in shared module.

## HTTP

HTTPClient is used.
**Reason:** New features of the HTTPClient will be used like

-   Interceptors allow middleware logic to be inserted into the pipeline
-   Immutable request/response objects
-   Progress events for both request upload and response download

## Lazy Loading

Main Goal is to reduce the size of the client and load only modules which are needed.  
There are 3 possibilities to choose when a new module will be implemented.

-   No Lazy Loading for specific module
-   Lazy Loading for specific module
-   Preload Lazy Loading Module

Due to the changes in Angular 8 the way how lazy loading is implemented changed. Instead of using string imports use dynamic imports.

-   Old (string import):

    ```
    loadChildren: '../submission/submission.module#SubmissionModule'
    ```

-   New (dynamic import):

    ```
    loadChildren: () => import('../submission/submission.module').then((m) => m.SubmissionModule)
    ```

## Routing

-   Usage of absolute paths is preferred instead of relative paths
-   Use lowercase routes and try to separate the route in logical way if it's too long

    Bad:

    ```
    <a [routerLink]="['/signupconfirmation']" >
    ```

    Good:

    ```
    <a [routerLink]="['/signup/confirmation']">
    ```

-   **Don´t use href** attribute for navigation as it will trigger a full page reload - use **routerLink** instead.
    In HTML code, we should rather use `[routerLink]` instead of `routerLink` , in other words with property binding, since it will be written the same way as you navigate programmatically (with array).

    Bad:

    ````
    <a href="/home" >

      ```
    Good:
    ````

    <a [routerLink]="['/home']">

    ```
    - Use `canActivate: [AuthenticationGuard]` to protect a route from users that are not logged in.
    - Use `canActivateChildren: [AuthenticationGuard]` to protect all child routes from users that are not logged in.
    ```

# HTML

### Attributes

Do not put each attribute in a separate line.

Bad:

```
<a href="https://www.joolia.cloud"
target="_blank"
...
>
```

Good:

```
<a href="https://www.joolia.cloud" target="_blank">
```

### Keep Code Clean

Define appropriate structure within HTML - use comments and formatting.

# SCSS

### Naming

-   Long scss class names should be separated by several hyphens to keep the the same form like other already existing class names.

    Examples:

    ```
    .sign-up-card { ... }
    .sidebar-header { ... }
    .activity-main-card { ... }
    ```

### Typography

Do not set any styles regarding fonts (e.g. font-size) in new scss classes.
Use the predefined typography classes for a unified styling (https://material.angular.io/guide/typography)[https://material.angular.io/guide/typography]

If a more unique style is needed, define your own typography sheet globally.

### Media Queries

Avoid as far as possible to define own media queries in (s)css.  
Use Angular integrated features instead.  
e.g. (https://material.angular.io/cdk/layout/overview)[https://material.angular.io/cdk/layout/overview]  
and (https://github.com/angular/flex-layout)[https://github.com/angular/flex-layout]

Use **BreakpointObserver** instead of adding listeners for media-breakpoints.

If there is nevertheless the need to define new media queries please match with Architecture.

# TS

see <https://github.com/Platypi/style_typescript>

# JS

see <http://www.w3schools.com/js/js_conventions.asp>
