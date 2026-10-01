# Implementation plan

Status: implemented and deployed on Tencent following user review. Source is pushed to GitHub and synchronized to the server through verified Git bundles because direct server GitHub access is unreliable. The user selected a private SSH tunnel; public-domain HTTPS is deferred.

## Architecture

```text
Typora -> Markdown + image bundles
                    |
              Validate + Hugo build
                    |
          Git push / server clone or pull
                    |
        Server build + staged Linux release
                    |
          Caddy: HTTPS + authentication
                    |
           Desktop / tablet / phone
```

Hugo provides content parsing, templates, taxonomy pages, and static output. A project-owned theme provides the frontend. Caddy provides the only production HTTP entry point. There is no application API or persistent database.

Use the existing Linux server and its preferred packaging; Docker is optional, not assumed to be installed. Pin tested tool and dependency versions when implementation starts. Follow the selected server's actual deployment layout rather than assuming root access.

## Frontend direction

Visual thesis: an expressive private editorial journal with a strong typographic identity and calm article reading.

- User-requested pink palette: dark plum ink (#24121c), soft white surfaces (#fff9fc), raspberry accents (#bf185d), and a bright pink featured-post surface (#ff94c2). Use dark text on bright pink and white text only on the deeper raspberry accent.
- Locally served display typography for headlines, readable body typography, and monospace code.
- Homepage: compact navigation, large journal title, and an asymmetric chronological post layout. Recent writing appears in the first viewport; no marketing sections or filler.
- Archive and tag views: structured rows with date, title, and tags; search remains easy to reach.
- Article: restrained 65–75 character reading measure, creation/update dates, clear heading hierarchy, and a desktop table of contents. On mobile, the contents can expand above the article.
- Motion: short hover and entrance transitions; content stays visible with JavaScript disabled. Honor reduced motion. No scroll hijacking, custom cursor, loading spectacle, or animations that block reading.
- Functional labels and body text remain readable; decorative typography never replaces accessible navigation.

Homepage and article mockups were reviewed; the user approved the layout and requested pink, then approved the revised palette. The Hugo frontend now follows that design.

## Content rendering

Use Hugo page bundles with relative assets and stable `/posts/<slug>/` URLs. Hugo front matter stores creation and update dates. Do not change a slug merely because the title changes.

Use syntax highlighting and a locally served math renderer compatible with the tested Typora fixtures. Restrict arbitrary raw HTML by default. Determine diagram requirements from a real sample instead of enabling multiple speculative renderers.

Build a compact static title/body search index from published posts. Load it only when search is used. Drafts must not enter the index. The index contains private content and must have the same access boundary as HTML.

## Access and privacy

For the initial single-user site, protect the entire Caddy site with HTTP Basic Authentication using a hashed password. The deployed mode uses an SSH-encrypted tunnel to an explicit `127.0.0.1:8088` HTTP listener; public-domain deployment must use HTTPS. This produces the browser's native authentication prompt, not a custom application login screen; logout and session management are limited by browser behavior.

If a branded login page, multiple accounts, or explicit logout becomes necessary, revisit authentication as a separate change. Do not simulate authentication with frontend JavaScript.

Serve only generated output through Caddy. Do not expose source files, Git history, environment files, or private configuration. Avoid alternate unauthenticated static hosts or ports. All article assets and search data remain behind the same access check. Configure private caching and disable unused feed outputs. The source repository was verified public during deployment; it must be made private before personal notes are committed.

## Publishing and recovery

- Run validation and production build locally; drafts and future-dated content stay out unless explicitly supported later.
- The user's chosen deployment flow is GitHub source push, clone/pull on Tencent Cloud, and a server build copied into a new release directory before switching the served release atomically. SSH transfer of locally built output remains a fallback if server downloads are unavailable.
- Keep the previous release for rollback. Failed build/upload must not damage the active release.
- Never put plaintext passwords or SSH keys in repository files, command logs, or frontend output.
- Preserve source and image bundles through ordinary backups; document restore and rollback.
- Local previews bind to loopback and are not a replacement for production authentication tests.

## Validation approach

Use a representative Markdown fixture rather than many implementation-mirroring unit tests. Verify generated routes/assets, draft exclusion, date preservation, search contents, and keyboard/mobile behavior. Test production-style Caddy access locally or on the intended staging server before release. Smoke-test authentication for page, image, search-index, and 404 routes. Do not call deployment complete without a successful HTTPS and access-control check on the actual target.

## References

- [Hugo page bundles](https://gohugo.io/content-management/page-bundles/)
- [Hugo front matter](https://gohugo.io/content-management/front-matter/)
- [Hugo content capabilities](https://gohugo.io/content-management/)
- [Caddy basic authentication](https://caddyserver.com/docs/caddyfile/directives/basic_auth)
- [Caddy HTTPS setup](https://caddyserver.com/docs/quick-starts/https)
