# Production Version Release Process

This document is always a work in progress. Help us to improve it!

# Introduction

This document describes the overall process of releasing a new version into production. Mainly the maintenance 
of the _master branch_. The deployment procedure is described in the Joolia DevOps Repository.

# Assumptions & Requirements

1. Git flow is not fully implemented _yet_.
2. The master branch keeps the production releases through tags.
3. The HEAD of master is always the Release Candidate for next version, either major or patch version.
4. In case of patches & hot-fixes the master branch may change its version & last tag to match the appropriate version.
5. You need write permission on master branch.
6. You have AWS credentials for production environment.

# Production Release

## Prepare the branch

Pay attention to what is being released. Adjust version first if necessary.

### Release
    
    cd releases
    ./release-version.sh <patch|minor|major>

Or a specific version:

    cd releases
    ./release-version.sh 2.8.0 

## Push

	git push && git push --tags

## Wait for Jenkins to build the newest image version

The current pipeline looks up for the latest applied tag in order to have
the docker image name hence it is important to wait for this step.

## Now Follow Instructions from DevOps repository

At this point the docker images is ready for deployment in the cluster.

# Post Release & Deployment

After the released version is deployed and running some preparation for
next release is due.

## Archive Migration Scripts (db changed?)

This step is only necessary when there are database changes (including views, procedures & triggers).

1. Move the `db/migrations/*.ts` files to the folder `db/migrations/archived`.
2. Commit the changes.

## Create newer schema schemadump (db changed?)

This step is only necessary when there are database changes (including views, procedures & triggers).

1. Switch to the `production` environment. See instructions to switch environments in the DevOps repository.
2. Go to the `db/deployments` and run `schemadump.sh` to get the latest deployed schema.
3. Commit the newly created dump.

__DO NOT FORGET TO PUSH YOUR CHANGES__

## Update develop branch

1. Pull last changes from master into the current develop branch. 
2. Bump version to the next planned version, normally the next minor. This step can be skipped if you just delivered a patch on master.
3. Tell Team to pull new code from develop into feature/hotfixes branches.
