#!/usr/bin/env sh

branch_name="$(git branch --show-current)"

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

echo "Invalid branch name: \"$branch_name\""
echo
echo "Expected format:"
echo "  <type>/<slug>"
echo "  <type>/<issue>-<slug>"
echo
echo "Allowed types:"
echo "  feat, fix, docs, refactor, test, ci, chore"
echo
echo "Examples:"
echo "  feat/add-user"
echo "  feat/123-add-user"
echo "  fix/login-validation"
echo "  docs/setup-readme"
echo
echo "Rename branch:"
echo "  git branch -m feat/add-user"

exit 1
