#!/usr/bin/env bash

#
# Prepares the required environment to properly build the docker image produced by Jenkins
# or the local development environment.
#

source "commons.sh"

build_docker_image=true
use_version_latest=false

#
# Defaults to GBP-Nexus
#
# This is required to push but is not the same used to pull.
# Use nexus.msg-gbp-cx.rocks:8082 for pulling.
#
REPOSITORY_URL="nexus.msg-gbp-ci:8083"

print_usage() {
    printf "Usage: build.sh [-i] [ -u REPOSITORY ] [-n]\n\n"
    printf "i : Flags to skip image generation, used by Jenkins only."
    printf "u : Container Registry Repository URL. Defaults to GBP Nexus."    
    printf "n : [Joolia-Next] Use dev-latest version for continuous delivery based on DEV branch"
    printf "\n\n"
}

while getopts 'inu:h' options; do
    case "${options}" in
        i)
          build_docker_image=false
          ;;
        u)
          REPOSITORY_URL=${OPTARG}
          ;;
        n)
          use_version_latest=true
          ;;
        *)
          print_usage
          exit 1
          ;;
    esac
done


REPO=${JOOLIA_DOCKER_REPO:-$REPOSITORY_URL}

#
# The trusted version is always from package.json.
#

NAME=$(get_pkg_field name)

#
# Ensure a unique docker image name.
# The semantic version and git's current SHA-1 rev are combined to get the final image name.
#
#  nexus.msg-gbp-ci:8083/joolia-server:1.0.0-dev.g206705f
#

PKGVERSION=$(get_pkg_field version)
COMMITSHA1=$(git rev-parse --short HEAD)
VERSION="${PKGVERSION}.${COMMITSHA1}"

#
# This metadata is backed into the final image as environment variable and can be used by the implementation to
# expose its current version and build-time metadata.
#

BUILD_SIGNATURE="${NAME},${VERSION},$(git rev-parse --short HEAD),$(date --utc +%FT%TZ)"

#
# This output is parsed in the CI pipeline. Only change if you know what you are doing ;)
#
if [[ ${use_version_latest} == true ]]; 
then
    echo "${BUILD_SIGNATURE} ${REPO}/${NAME}:dev-latest"
else
    echo "${BUILD_SIGNATURE} ${REPO}/${NAME}:${VERSION}"
fi


if [[ ${build_docker_image} == true ]]; then
    echo "Building the image .."
    ARGBUILDSIGNATURE="--build-arg BUILD_SIGNATURE=\"${BUILD_SIGNATURE}\""
    docker build ${ARGBUILDSIGNATURE} --force-rm --no-cache --squash -t ${REPO}/${NAME}:${VERSION} .
fi
