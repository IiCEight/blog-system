#!/bin/sh
set -eu
BLOG_ROOT=${BLOG_ROOT:-/srv/fieldnotes}
case "$BLOG_ROOT" in /*) ;; *) echo 'BLOG_ROOT must be an absolute path.' >&2; exit 1 ;; esac
test -L "$BLOG_ROOT/previous" || { echo 'No previous release.' >&2; exit 1; }
previous=$(readlink "$BLOG_ROOT/previous")
test -f "$previous/index.html" || { echo 'Previous release is missing.' >&2; exit 1; }
ln -s "$previous" "$BLOG_ROOT/current.rollback"
mv -Tf "$BLOG_ROOT/current.rollback" "$BLOG_ROOT/current"
printf 'Restored: %s\n' "$previous"
