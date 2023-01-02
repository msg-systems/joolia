#!/usr/bin/env bash

#
# Helper script to create a rudimentar relase notes based on changes since last tag.
# Assumes the version in package.json is already adjusted.
#

#
# Sets a more sane and predictable bash environment.
# For instance any command that fails (exit code > 0) will finish the script.
#
set -o errexit -o pipefail -o noclobber -o nounset

#
# helper to extract field from package.json file
#
function get_pkg_field() {
  cat ../package.json \
    | grep $1 \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g' \
    | tr -d '[[:space:]]'
}

npm version --no-git-tag-version "${1}"

RELEASE_NOTES="$(date +'%Y%m%d').txt"
VERSION=$(get_pkg_field "version")
echo "${VERSION}" >> "${RELEASE_NOTES}"

git log --no-merges "$(git describe --tags --abbrev=0)..HEAD" --pretty=format:"%h %s" >> "${RELEASE_NOTES}"
git add .

git --no-pager diff

git commit -am "Releasing version ${VERSION}"
git tag "${VERSION}"

echo
echo "Run git push && git push --tags to finish"
echo
