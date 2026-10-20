#!/usr/bin/env bash
# Publish Ricard Retreats at the clean address https://ricard-retreats.github.io/
#
# PREPARED, NOT YET RUN. Prerequisite: the GitHub organisation "ricard-retreats" must already
# exist and the logged-in gh account must be allowed to create repositories in it.
# This script does NOT create the organisation.
#
# What it does (only when run with --yes; without it, it just prints the plan):
#   1. checks gh is logged in and the org exists
#   2. creates the public repo ricard-retreats/ricard-retreats.github.io (fails if it already exists)
#   3. copies this site (without .git and assets/raw) to a temp folder
#   4. sets meta.siteUrl in site-config.js to https://ricard-retreats.github.io/ and runs tools/sync-meta.py
#   5. commits and pushes to main
#   6. enables GitHub Pages from main / (root)
# The current repo (fergalfinnerty/ricardo-retreats) is left untouched.
set -euo pipefail

ORG="ricard-retreats"
REPO="ricard-retreats.github.io"
NEW_URL="https://ricard-retreats.github.io/"
SRC="$(cd "$(dirname "$0")/.." && pwd)"

if [[ "${1:-}" != "--yes" ]]; then
  echo "Dry run. Would create $ORG/$REPO, set meta.siteUrl to $NEW_URL, push $SRC and enable Pages."
  echo "Run again with --yes once the '$ORG' organisation exists."
  exit 0
fi

gh auth status >/dev/null 2>&1 || { echo "gh is not logged in"; exit 1; }
gh api "orgs/$ORG" >/dev/null 2>&1 || { echo "Organisation '$ORG' not found. Create it on github.com first."; exit 1; }
if gh api "repos/$ORG/$REPO" >/dev/null 2>&1; then
  echo "Repo $ORG/$REPO already exists; not overwriting. Push to it manually instead."; exit 1
fi

gh repo create "$ORG/$REPO" --public --description "Ricard Retreats website"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
tar -C "$SRC" --exclude=.git --exclude=assets/raw -cf - . | tar -C "$WORK" -xf -

python3 - "$WORK/site-config.js" "$NEW_URL" <<'PY'
import re, sys
path, url = sys.argv[1], sys.argv[2]
s = open(path, encoding="utf-8").read()
s, n = re.subn(r'("siteUrl":\s*")[^"]*(")', lambda m: m.group(1) + url + m.group(2), s, count=1)
if n != 1:
    sys.exit("siteUrl not found in site-config.js")
open(path, "w", encoding="utf-8").write(s)
PY
python3 "$WORK/tools/sync-meta.py"

cd "$WORK"
git init -q -b main
git add -A
git commit -q -m "Ricard Retreats site at $NEW_URL"
git remote add origin "https://github.com/$ORG/$REPO.git"
gh auth setup-git >/dev/null 2>&1 || true
git push -q -u origin main

gh api -X POST "repos/$ORG/$REPO/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null
echo "Pushed. Pages is building; check $NEW_URL in a few minutes before announcing it."
