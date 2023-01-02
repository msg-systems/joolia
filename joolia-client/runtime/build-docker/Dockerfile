FROM node:12.18.0-alpine

#Workaround
ENV npm_config_unsafe_perm=true

LABEL authors="JOOLIA"
LABEL version="1.0"
LABEL description="JOOLIA Client - Build Docker Image / Node.js 12.18.0 / Angular CLI 9.1.12 / Chromium"

#Linux Setup
RUN apk upgrade && apk add

RUN npm cache clean --force

RUN npm install -g npm@latest

#Create Homefolder
RUN mkdir joolia-client
RUN cd joolia-client
WORKDIR joolia-client

#Angular CLI
RUN npm install -g @angular/cli@9.1.12

#AWS CLI
RUN apk -v --update add \
            python \
            py-pip \
            groff \
            less \
            mailcap \
            && \
        pip install --upgrade awscli==1.16.103 s3cmd==2.0.1 python-magic && \
        apk -v --purge del py-pip && \
        rm /var/cache/apk/*

#Chromium
RUN sed -i -e 's/v3.8/edge/g' /etc/apk/repositories  \
    && apk add --no-cache \
    python \
    build-base \
    git \
    bash \
    openjdk8-jre-base \
    # chromium dependencies
    nss \
    chromium-chromedriver \
    chromium \
    && apk upgrade --no-cache --available

ENV CHROME_BIN /usr/bin/chromium-browser

