#!/usr/bin/env sh

branch_name="$(git branch --show-current)"

if [ -t 1 ]; then
  red="$(printf '\033[0;31m')"
  yellow="$(printf '\033[1;33m')"
  reset="$(printf '\033[0m')"
else
  red=''
  yellow=''
  reset=''
fi

if [ -z "$branch_name" ]; then
  echo "Cannot validate branch name: no current branch found."
  exit 1
fi

if [ "$branch_name" = "main" ]; then
  exit 0
fi

pattern='^(feat|fix|docs|refactor|test|ci|chore)/([0-9]+-)?[a-z0-9]+(-[a-z0-9]+)*$'

if printf '%s' "$branch_name" | grep -Eq "$pattern"; then
  exit 0
fi

echo
echo "${red}Invalid branch name:${reset} \"$branch_name\""
echo
echo "${yellow}Why it failed:${reset}"
echo "  The branch name does not start with an allowed type prefix."
echo "  It must follow the repository branch naming convention."
echo
echo "${yellow}Expected format:${reset}"
echo "  <type>/<slug>"
echo "  <type>/<issue>-<slug>"
echo
echo "${yellow}Allowed types:${reset}"
echo "  feat, fix, docs, refactor, test, ci, chore"
echo
echo "${yellow}Examples:${reset}"
echo "  feat/add-user"
echo "  feat/123-add-user"
echo
echo "${yellow}Rename branch:${reset}"
echo "  git branch -m feat/add-user"
echo

exit 1
