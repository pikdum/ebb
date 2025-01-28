FROM ubuntu:24.04
RUN dpkg --add-architecture i386 \
    && apt-get -qq update \
    && apt-get -qq install wget \
    && mkdir -p -m 755 /etc/apt/keyrings \
    && wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get -qq update \
    && apt-get -qq dist-upgrade \
    && apt-get -qq install --no-install-recommends \
        build-essential \
        gh \
        git \
        nodejs \
        npm \
        wine \
        wine32:i386 \
    && npm install -g npm@10 \
    && apt-get -qq clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
