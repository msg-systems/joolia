# Client Architecture

### Used domains

| Domain/Domain pattern                                       | Usage                     | Description                                                                                                                                          |
| :---------------------------------------------------------- | :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| https://www.joolia.net                                      | Landingpage               | Official Landingpage first contact with possible Customer - Hosting is **not** within Kubernetes - Separate Hosting with AWS Lightsail and Wordpress |
| https://app.joolia.net/6FEB3BD5-566E-4931-ACE2-5AEA4399B110 | Joolia App                | App Itself                                                                                                                                           |
| https://app.joolia.ninja/[UUID]/index.html                  | Test Stack for Joolia App | Test Stack created out of a new implementation                                                                                                       |

### Folder Structure

    +---coverage                      Generated Test Coverage ---do not change---
    +---documentation                 Generated Compodoc Documentation ---do not change---
    +---dist                          Generated Distribution folder ---do not change---
    +---e2e                           E2E Tests
    +---node_modules
    +---mockServer                    MockServer --obsolete--
    \---runtime
            +---build-docker          Dockerfiles
            +---jenkins               scripts used within Jenkins Pipeline
    \---src
        +---app
        |   +---core                  Core Module
        |   |   +---animations
        |   |   +---components
        |   |   +---config
        |   |   +---enum
        |   |   +---guards
        |   |   +---interceptors
        |   |   +---models
        |   |   \---services
        |   +---public                Smart Components
        |   |   \---...
        |   \---shared                Shared Module
        |       +---components        Presentational Components
        |       +---directives
        |       +---pipes
        |       \---services
        +---assets                    Assets
        +---documentation             Documentation source for generating Compodoc
        |   \---devguide
        +---environments              Configuration for Environment
        +---style-paths               global SCSS definitions
        +---testing                   artefacts for unit tests

### Semantic of Version Number

<https://www.semver.org>

### Modules

##### APP

This is the root module. It stores everything that's needed for bootstrapping the application.

##### Core

This module stores the essential parts for running the application.

##### Shared

Everything that's needed multiple times.
Keep in mind - if you store **services** in it they will be **instantiated multiple** times.

##### Business Components (Public)

The App itself in business point of view.

### Compilation

##### Ahead-Of-Time (AOT)

Compilation will be done by using AOT instead of JIT
Short enhancement to the command: `ng build --prod`. When using `--prod` default compilation is AOT.

### Pre-rendering

Pre-rendering is not implemented for this project.

**Reason:** Primarily pre-rendering is needed to enable Search Engine Optimization (SEO).  
Since we don´t want to optimize the content for the app itself this decision was made.
If there is need for SEO the pages will be static and not part of this app.

### Logging

For logging on Client side please keep in mind that the customer will also see the logs.

### Authorization Tokens

Authorization tokens are used for the user to execute certain actions on the platform. As soon as the user logs into the application, the server sends a valid authorization token to the client. Every time the user sends a request to the server, the token is appended to this request and contains information about the identity of the user. Since this application is a Single-Page-Application, the token will be renewed whenever the user calls the API.

If the token is not renewed after a certain time period, the token expires and is not valid anymore. In this case the user has to request a new token by logging into the application again.

### Progressive Web App (PWA)

PWA is now active for Joolia.

#### Service Worker

Currently ServiceWorker are only implemented to watch if there is a new version of the client available.
If so new version will be loaded if customer confirms

### Hot Module Replacement

The Hot Module Replacement (short: HMR) is a feature of Webpack and is used to update the Angular project without recompiling and reloading the whole project.
