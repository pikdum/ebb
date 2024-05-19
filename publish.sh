#!/usr/bin/env sh
set -eux

npm install
npm run build
rm -rf dist/win-unpacked
rm -rf dist/linux-unpacked
gh release upload "v$(node -p "require('./package.json').version")" dist/* --clobber
