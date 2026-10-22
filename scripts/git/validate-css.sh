#!/usr/bin/env sh

set -eu

git diff --cached --name-only --diff-filter=ACMR -z -- '*.css' |
  xargs -0 -r npx stylelint