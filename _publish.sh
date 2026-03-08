#! /bin/bash

# clear
# rm -r *_cache *_files

# Make script stop on errors
set -e

BRANCH=$(git branch --show-current)
COMMIT_MSG=${1:-"Publish updates"}

# render only when this is a Quarto project
if command -v quarto >/dev/null 2>&1 && ls *.qmd >/dev/null 2>&1; then
  quarto render
else
  echo "ℹ️ Skipping Quarto render (no Quarto project detected)."
fi

# track changes
git add .
# commit only if something is staged
if git diff --cached --quiet; then
  echo "ℹ️ No changes to commit."
else
  git commit -m "$COMMIT_MSG"
fi

# publish
git push -u origin "$BRANCH"

echo "✅ Published: $BRANCH"

# Make it executable (first time only)
# chmod +x _publish.sh

# Don't forget to do `conda activate envULMS562` before we publish
# If we want a qmd file to be rendered to revealjs, we can say... quarto render --profile slides (make sure it has revealjs as format type)

# We can do this on main or inside a branch.
# Reminder: get into branch via git checkout BRANCH_NAME
