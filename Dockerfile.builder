FROM ubuntu:24.04

RUN dpkg --add-architecture i386 \
    && apt-get -qq update \
    && apt-get -qq install -y --no-install-recommends wget curl ca-certificates \
    && mkdir -p -m 755 /etc/apt/keyrings \
    && wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get -qq update \
    && apt-get -qq dist-upgrade -y \
    && apt-get -qq install --no-install-recommends \
        build-essential \
        gh \
        git \
        wine \
        wine32:i386

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get -qq install -y --no-install-recommends nodejs \
    && npm install -g npm@11

RUN apt-get -qq clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
