#!/bin/sh
# Run on Linux from the cloned repository. This script never exposes a web port.
set -eu
if [ "$#" -ne 1 ]; then echo 'Usage: sh deploy/release.sh https://notes.example.com/' >&2; exit 1; fi
case "$1" in https://*) ;; *) echo 'A production HTTPS URL is required.' >&2; exit 1 ;; esac
BLOG_ROOT=${BLOG_ROOT:-/srv/fieldnotes}
case "$BLOG_ROOT" in /*) ;; *) echo 'BLOG_ROOT must be an absolute path.' >&2; exit 1 ;; esac
if [ -e "$BLOG_ROOT/current" ] && [ ! -L "$BLOG_ROOT/current" ]; then echo 'current must be a symlink; refusing to overwrite.' >&2; exit 1; fi
npm ci --no-audit --no-fund
npm run setup
npm run build -- --baseURL "$1"
npm run verify
release="$BLOG_ROOT/releases/$(date -u +%Y%m%dT%H%M%SZ)-$$"
mkdir -p "$release"
cp -R public/. "$release/"
test -f "$release/index.html"
if [ -L "$BLOG_ROOT/current" ]; then
    previous=$(readlink "$BLOG_ROOT/current")
    ln -s "$previous" "$BLOG_ROOT/previous.new"
    mv -Tf "$BLOG_ROOT/previous.new" "$BLOG_ROOT/previous"
fi
ln -s "$release" "$BLOG_ROOT/current.new"
mv -Tf "$BLOG_ROOT/current.new" "$BLOG_ROOT/current"
printf 'Release ready: %s\n' "$release"
printf 'Verify HTTPS authentication before considering this deployed.\n'
