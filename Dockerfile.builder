FROM ubuntu:24.04
RUN dpkg --add-architecture i386
RUN apt-get -qq update && apt-get -qq dist-upgrade && apt-get -qq install \
    build-essential \
    git \
    nodejs \
    npm \
    wine
