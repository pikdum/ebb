FROM ubuntu:24.04
RUN dpkg --add-architecture i386 && \
    apt-get -qq update && \
    apt-get -qq dist-upgrade && \
    apt-get -qq install --no-install-recommends \
    build-essential \
    git \
    nodejs \
    npm \
    wine \
    wine32:i386 && \
    apt-get -qq clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
