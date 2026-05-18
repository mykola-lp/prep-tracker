#!/usr/bin/env sh

message_file="$1"

if [ -z "$message_file" ]; then
  echo "Cannot validate commit message: no commit message file provided."
  exit 1
fi

if npx --no -- commitlint --edit "$message_file"; then
  exit 0
fi

echo
echo "Commit message is invalid."
echo
echo "Expected format:"
echo "  type(scope): message"
echo "  type: message"
echo
echo "Allowed types:"
echo "  feat, fix, docs, refactor, test, ci, chore"
echo
echo "Valid examples:"
echo "  feat(admin): add dashboard layout"
echo "  fix(auth): handle expired token"
echo "  docs(workflow): update commit naming guide"
echo "  chore(hooks): add commit message validation"
echo "  docs: update workflow guide"
echo
echo "How to fix it:"
echo "  1. Start with an allowed type."
echo "  2. Add an optional scope in parentheses."
echo "  3. Add a short message after a colon."
echo
echo "Example:"
echo "  git commit -m \"chore(hooks): add commit message validation\""

exit 1
