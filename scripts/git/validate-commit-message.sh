#!/usr/bin/env sh

message_file="$1"
details_file="/tmp/prep-tracker-commitlint.txt"

if [ -t 1 ]; then
  red="$(printf '\033[0;31m')"
  yellow="$(printf '\033[1;33m')"
  reset="$(printf '\033[0m')"
else
  red=''
  yellow=''
  reset=''
fi

if [ -z "$message_file" ]; then
  echo "Cannot validate commit message: no commit message file provided."
  exit 1
fi

commit_message="$(cat "$message_file" 2>/dev/null)"

if npx --no -- commitlint --edit "$message_file" >"$details_file" 2>&1; then
  exit 0
fi

echo
echo "${red}Invalid commit message:${reset} \"$commit_message\""
echo
echo "${yellow}Why it failed:${reset}"
echo "  This message starts like plain text."
echo "  It must start with an allowed commit type such as feat, fix, docs, or chore."
echo
echo "${yellow}Expected format:${reset}"
echo "  type(scope): message"
echo "  type: message"
echo
echo "${yellow}Allowed types:${reset}"
echo "  feat, fix, docs, refactor, test, ci, chore"
echo
echo "${yellow}Examples:${reset}"
echo "  chore(hooks): add commit message validation"
echo "  chore: add commit message validation"
echo
echo "${yellow}Command:${reset}"
echo "  git commit -m \"chore(hooks): add commit message validation\""
echo

exit 1
