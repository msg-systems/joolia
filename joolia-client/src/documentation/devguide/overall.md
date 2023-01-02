# Overall

### Webpack
In Angular respectively Angular CLI the webpack is deeply integrated. 
[Link](https://github.com/angular/angular-cli/wiki/build#bundling--tree-shaking) and [Link](https://angular.io/guide/aot-compiler) 

###### Webpack - Configuration
At the moment the default configuration, which is provided as mentioned above is used.   
If there are requirement to have an addtional configuration of webpack see [Link](https://github.com/manfredsteyer/ngx-build-plus)

### Install new NPM Modules 
If you have to integrate a new NPM Module please pay attention to following checklist: 
1. License - use only licences which are allowed 
2. Costs - do we have to pay something for that  (if please contact architecture / project lead)
3. UI Component library (e.g. Bootstrap not allowed) 
4. GDPR compliance - do we transfer data? do we have to adjust the Privacy Policy? (contact architecture / project lead) 

### Mock Server --obsolete--
For development purpose a mock-server was integrated in this repository. 
In "Overview" it is described how to start the client and the mockserver.
  
`mock-server port: 9100`

### License Check 
In the prebuild step the check for licenses of used packages is implemented  
License List stored at: /licensesRef.json  
Allow Licence List stored at: /licensesRef.json  
  
Invalid License found -> Build will fail   

### Git 

Naming Convention for Branches: 

| Type | Prefix | Example | Remarks | 
| :------- | :------ | :------ | :------ |  
| feature | feature/ | feature/JOOLIA-1 | |
| task | task/ | task/JOOLIA-1 | Base of task braches are always the corresponding feature branch|
| hotfix | hotfix/ | hotfix/JOOLIA-1 | Target is master branch |
| bugfix | bugfix/ | bugfix/JOOLIA-1 | Target is develop branch |
| ...further to be done | | |


### API Contract
The API Docs of the Server Repository reflects the API Contract.    

__MASTER-BRANCH__: Contains the API definition which is in Production  
__FETURE-BRANCH__: Contains the API definition which is in Production - with additions that will be added in the feature     

For the feature branch: client and server needs to align to define the API Docs __BEFORE__ starting with the development.   
After this is done client and server needs to follow this - if there are changes both sides needs to align again. If the defined API Docs do not align to the discussed logic, this has to be stated as an issue and has to be corrected as fast as possible.

 
