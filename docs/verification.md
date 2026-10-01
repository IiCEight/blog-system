# Local verification

Date: 2026-10-01, Asia/Shanghai.

## Completed

- Hugo 0.167.0 built the site successfully on Windows; official binary checksum verified.
- Generated pages, local asset links, tags, archive, and search index verified. RSS/sitemap outputs and source files are excluded.
- Typora import fixture verified: inline and reference images, original-file preservation, existing-post overwrite refusal, missing-image rejection, and draft exclusion from pages/search.
- Headless Edge checked homepage, archive, tags, search, and the Markdown guide at 360px, 768px, and 1440px. No page-wide overflow.
- Search checked for successful, empty, and no-result states; text is rendered without HTML injection.
- Inline/block math and bundled images rendered. A narrow-screen code overflow was fixed.
- Keyboard skip link, reduced-motion scrolling, and reading without JavaScript checked. Enlarged root text checked on the desktop article; this is not a full accessibility audit or a comprehensive browser-zoom test.
- Desktop homepage and mobile article screenshots visually inspected.
- Linux release and rollback scripts passed shell syntax checks; execution on the actual Linux server is still pending.
- Caddy 2.11.4 checksum verified. Production-style configuration adapted and validated locally, with loopback HTTP and disposable test credentials. Anonymous and wrong-password access denied for pages, image, CSS, search index, and missing route; valid credentials allow existing files. This does not verify production TLS.

## Pending

- Real user Typora sample, including any nonstandard HTML, diagrams, or unusual math.
- Tencent Cloud server provisioning, GitHub repository, domain/DNS, and production HTTPS/authentication smoke checks.
- Release/rollback execution on Linux and backup/restore exercise. Shell scripts are prepared but are not claimed to be deployment-tested.

Browser screenshots and temporary test output live in ignored `.local/`. Downloaded tool executables, credentials, dependencies, caches, and generated pages are excluded from Git.
