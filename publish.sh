#!/usr/bin/env sh
set -eux

# create a new WINEPREFIX to avoid error:
# errorOut=wine: '/github/home' is not owned by you, refusing to create a configuration directory there
export WINEPREFIX="$(mktemp -d)"
trap 'rm -rf "$WINEPREFIX"' EXIT

npm install
export NODE_ENV=production
npm run build
rm -rf dist/win-unpacked
rm -rf dist/linux-unpacked
gh release upload "v$(node -p "require('./package.json').version")" dist/* --clobber
