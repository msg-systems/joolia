# JOOLIA CLIENT

### Purpose of this Documentation

This Documentation is only related to the client part of the Joolia application.  
It describes the standards which are defined within the project to ensure efficiency and quality.  
Additionally it will be the central document which helps new developers to gain knowledge about the project.

### Delimitation

Within this section there is no documentation about the client architecture itself, it will be generated in the other sections of this documentation.

### Versions

| Name             | Version | Documentation                                       | Purpose                                          |
| :--------------- | :------ | :-------------------------------------------------- | :----------------------------------------------- |
| Angular          | 9.1.12  | <https://angular.io/docs>                           | -                                                |
| Angular CLI      | 9.1.12  | https://cli.angular.io/                             | Develop, build and manage our client application |
| Angular Material | 9.2.4   | <https://material.angular.io/components/categories> | -                                                |
| Webpack          | 4.19.1  | https://webpack.js.org/                             | Integrated into Angular CLI                      |
| Compodoc         | -       | <https://compodoc.app/guides/usage.html>            | generate Client Documentation                    |
| Node.js          | 12.18.0 | <https://nodejs.org/en/docs/>                       | -                                                |
| npm              | 6.14.4  | <https://www.npmjs.com/>                            | -                                                |

### UI Components library

In this project we use **Angular Material Design**. Hence we will not mix up the different frameworks the integration of other frameworks like **Bootstrap** or similar is **not allowed**.

### Can I use jQuery?

**No** - There is no need to use to integrate the library itselfs.  
There are already alternatives (partly integrated jQuery) in Angular available.  
Animations => use **@angular/animations**  
Manipulate DOM => use angular integrated features

Found a legitimate reason why you need to integrate jQuery => contact architecture

### Supported devices

The application should support the latest version of Chrome and Safari.

Mobile devices with a resolution of 320x568 or larger are supported.
This covers ~99% of devices according to https://gs.statcounter.com/screen-resolution-stats/mobile-tablet/worldwide.

### Commands

#### App

| Command                             | Description                                                                                                                                                                                                                                                                         |
| :---------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run start`                     | start angular app with dev configuration                                                                                                                                                                                                                                            |
| `npm run start-mock`                | start angular app with dev configuration and starts mockServer                                                                                                                                                                                                                      |
| `npm run start-test`                | start angular app with test configuration                                                                                                                                                                                                                                           |
| `npm run start-prod`                | start angular app with production configuration                                                                                                                                                                                                                                     |
| `npm run build`                     | build angular app                                                                                                                                                                                                                                                                   |
| `npm run build-test`                | build angular app in test mode                                                                                                                                                                                                                                                      |
| `npm run build-prod`                | build angular app in production mode                                                                                                                                                                                                                                                |
| `ng build --prod --build-optimizer` | When using Build Optimizer the vendor chunk will be disabled by default. Total bundle sizes with Build Optimizer are smaller if there is no separate vendor chunk because having vendor code in the same chunk as app code makes it possible for Uglify to remove more unused code. |
| `npm run test`                      | running unit tests                                                                                                                                                                                                                                                                  |
| `npm run test-dev`                  | running unit tests with watch for automatically rerun tests after change                                                                                                                                                                                                            |
| `npm run lint`                      | for linting the project                                                                                                                                                                                                                                                             |
| `npm run pretty`                    | to format the whole project                                                                                                                                                                                                                                                         |
| `npm run e2e`                       | running E2E tests                                                                                                                                                                                                                                                                   |
| `npm run licenses`                  | license check                                                                                                                                                                                                                                                                       |
| `npm run audit`                     | run security audit                                                                                                                                                                                                                                                                  |

#### Documentation

| Command            | Description                 |
| :----------------- | :-------------------------- |
| `npm run compodoc` | generate this Documentation |
