# Deployment

## Production

**/!\ Before all /!\  
 Please check if there are critical changes in infrastructure / API / ....  
 If there is - please trigger discussion in Daily or plan a meeting immediately**

### Preconditions:

-   Servers has to be deployed first. For Instructions please see Repository of Server
-   Clarify the Version Numbers for current deployment and next development cycle

### Steps:

1. Prepare the branch  
   Pay attention to what is being released. Adjust version first if necessary.

2. Release

    ```
    cd releases
    ./release-version.sh <patch|minor|major>

    Or a specific version:

    cd releases
    ./release-version.sh 2.8.0
    ```

3. Push

    git push && git push --tags

4. Open the Jenkins Pipeline for Branch master
5. Re-run whole pipeline
6. Check Deploy to Production
7. After Pipeline is finished
8. Check if the new Client version is deployed and working
9. Bump version of development branch

    ```
    npm version --no-git-tag-version 2.x.x-dev
    ```

_Commands which helps with tagging_

-   remove all local tags

    ```
    git tag -l | xargs git tag -d
    ```

-   get all tags from remote
    ```
    git fetch –t
    ```

## Staging

### Preconditions:

-   All branches (task/feature/hotfix) are enabled to be deployed as staging environment
-   Server is already deployed in staging environment  
-   Tests in Jenkins for this branch are "green"
-   Prepare the UUID for the deployment. You´ll get it from Server Deployment  
    Example from Server Deployment: "Endpoint is https://api-7eb189d3-0832-45f5-a2c8-00f84124f06d.joolia.ninja"  
    UUID from the example is than: **7eb189d3-0832-45f5-a2c8-00f84124f06d**

### Doing first deploy:

1. Open the Jenkins Pipeline run for the branch that you want to deploy
2. Trigger the full Jenkins pipeline again
3. Question should appear in the "Preconditions"-Jenkins-Task if it should be deployed:  
   Check it and continue
4. Question for "UUID" appears:  
   Enter the UUID that you determined. Don´t know the UUID? See examples above how to determine this.
5. Wait till Pipeline is finished.
6. Step "Deploy to Test" will give you the URL for the Test Stack
   Example: https://app.joolia.ninja/[UUID]/home
7. Validate the developed functionality on the test stack. After you are sure it´s working send a mail with:

-   URL
-   Feature ID: JOOLIA-XXXX  
    to trigger the review.

### Steps update deploy:

1. see steps of _Steps first deploy_
2. Perform the invalidation of the CloudFront Distribution. 
   Current limitation for that is - you have to have access to the relevant AWS Account

### Hints:

-   Opening the URL of the Test Stack https://app.joolia.ninja/[UUID]/home shows 404  
    Solution: Remove all after the UUID e.g. /home  
    Result: Page should be loaded

-   Reloading with Key "F5" or similar redirects to 404
    Solution: do not reload - current implementation does not support it
