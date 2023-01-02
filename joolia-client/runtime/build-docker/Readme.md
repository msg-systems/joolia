# Docker image for build

To speed up the build step in the jenkins pipeline a docker image with following preinstalled was pushed to nexus  

- node.js 
- Angular CLI
- AWS CLI 
- Chromium

## Maintain Docker image 
1. Create branch which ends with **_dockerpush**
2. Adjust the dockerfile stored at [./runtime/build-docker/Dockerfile](./runtime/build-docker/Dockerfile) 
3. Adjust the jenkins pipeline to use the new docker image e.g.

    agent { docker { image 'nexus.msg-gbp-ci:8083/joolia-client-builder:**0.1**' } }
    
4. Push / Test / Merge Branch 

