# Testing
### Testing the Client
- Automated testing
- Integration Browserstack? - To Clarify
- Manual testing on Mac mini (Safari)
- Simulate "Retina" 5K Resolution

### Component Tests
The component tests are based on Jasmine and Karma. 
Every component/service/etc. has its own testfile named after the following convention `*.component.spec.ts`.
To mock services use either use the stubs in [./testing/unitTest](/testing/unitTest)  
or `jasmine.createSpyObj`,
further information on https://jasmine.github.io/2.0/introduction.html#section-Spies. 
Spy objects always need at least one method name, otherwise the tests would be failed.  
For example: `const routerSpy = jasmine.createSpyObj('Router', ['navigate']);`

To start the tests use `npm run test`.

A code coverage report is generated in the coverage folder in the project tree.

For further information visit https://angular.io/guide/testing.

#### Debug
To debug a component test class set browsers to `['Chrome']` and singleRun to `false` in `karma.conf.js`.

### E2E Tests
Start the End-to-end tests with `npm run e2e`
