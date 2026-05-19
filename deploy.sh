#!/bin/bash
# ─────────────────────────────────────────────
#  DEPLOY SCRIPT — Selete's Portfolio
#  Run this script any time you make changes.
#  It will push everything to GitHub Pages.
# ─────────────────────────────────────────────

# Move into the project folder
cd "$(dirname "$0")"

echo ""
echo "🚀 Deploying your portfolio to GitHub Pages..."
echo ""

# Stage all changed files
git add .

# Create a commit with today's date & time
TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
git commit -m "Update portfolio — $TIMESTAMP"

# Push to GitHub (force ensures local version always wins)
git push origin main --force 2>/dev/null || git push origin master --force 2>/dev/null || git push -u origin main --force

echo ""
echo "✅ Done! Your site will be live in ~60 seconds at:"
echo "   https://selete-tetteh.github.io"
echo ""
