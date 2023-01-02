#!/usr/bin/env bash

#
# helper to extract field from package.json file
#
function get_pkg_field() {
  cat package.json \
    | grep $1 \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g' \
    | tr -d '[[:space:]]'
}
