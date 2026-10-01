#!/bin/sh
# Run explicitly on Linux after an initial release. Uses only its own fixture.
set -eu
BLOG_ROOT=${BLOG_ROOT:-/srv/fieldnotes}
test -L "$BLOG_ROOT/current"
original=$(readlink "$BLOG_ROOT/current")
test -f "$original/index.html"
test ! -e content/posts/release-validation-check
cleanup() {
    if [ -f content/posts/release-validation-check/index.md ]; then
        rm content/posts/release-validation-check/index.md
        rmdir content/posts/release-validation-check
    fi
}
trap cleanup EXIT
sh deploy/release.sh http://127.0.0.1:8088/
test "$(readlink "$BLOG_ROOT/previous")" = "$original"
sh deploy/rollback.sh
test "$(readlink "$BLOG_ROOT/current")" = "$original"
mkdir content/posts/release-validation-check
printf '# Missing metadata must fail validation\n' > content/posts/release-validation-check/index.md
mkdir -p .local
if sh deploy/release.sh http://127.0.0.1:8088/ > .local/expected-release-failure.log 2>&1; then
    echo 'Invalid content unexpectedly produced a release.' >&2
    exit 1
fi
test "$(readlink "$BLOG_ROOT/current")" = "$original"
echo 'Linux release checks passed: staged switch, previous release, rollback, and failed-build preservation.'
