#!/usr/bin/env sh

set -eu

git diff --cached --name-only --diff-filter=ACMR -z -- \
  ':(glob)apps/web/src/**/*.js' \
  ':(glob)apps/web/src/**/*.jsx' |
  xargs -0 -r npx eslint --config apps/web/eslint.config.js
