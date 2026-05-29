#!/usr/bin/env sh

if [ -t 1 ]; then
  red="$(printf '\033[0;31m')"
  yellow="$(printf '\033[1;33m')"
  reset="$(printf '\033[0m')"
else
  red=''
  yellow=''
  reset=''
fi

if git ls-files -z | xargs -0 -r npx prettier --check --ignore-unknown; then
  exit 0
fi

echo
echo "${red}Formatting check failed.${reset}"
echo
echo "${yellow}Why it failed:${reset}"
echo "  Some files do not match the repository Prettier format."
echo
echo "${yellow}Fix:${reset}"
echo "  Run: npm run format"
echo
echo "${yellow}Then commit again.${reset}"
echo

exit 1
