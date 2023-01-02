#!/usr/bin/env bash

REPO=${JOOLIA_DOCKER_REPO:-"nexus.msg-gbp-cx.rocks:8083"}
NAME='joolia-node'
VERSION='12.18.0-stretch'

docker build --force-rm --no-cache --squash -t ${REPO}/${NAME}:${VERSION} .
