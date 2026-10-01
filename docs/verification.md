# Local and Tencent deployment verification

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
- Linux release and rollback scripts passed shell syntax checks and execution checks on the actual Linux server, recorded below.
- Caddy 2.11.4 checksum verified. Production-style configuration adapted and validated locally, with loopback HTTP and disposable test credentials. Anonymous and wrong-password access denied for pages, image, CSS, search index, and missing route; valid credentials allow existing files. This does not verify production TLS.

## Pending

- Real user Typora sample, including any nonstandard HTML, diagrams, or unusual math.
- Public-domain hosting, intentionally deferred; private Tailscale HTTPS is verified below.
- An independent encrypted backup of Caddy service credentials and configuration; source restoration has been exercised, but a complete disaster-recovery backup has not been created.
- GitHub source privacy: repository is public and must be made private before personal notes are committed.

## Tencent deployment completed

- Connected using the user's `tencent` SSH alias to Ubuntu 24.04 as `ubuntu`; existing services were preserved.
- Direct server GitHub SSH authentication failed and HTTPS access timed out. Cloned a checksum-verified Git bundle transferred over SSH; the Git history is intact and origin points to the user's GitHub repository.
- Verified official Linux Hugo 0.167.0 and Caddy 2.11.4 checksums on both computers; built and checked the site on Linux.
- Installed and enabled the dedicated `fieldnotes-caddy` system service with credentials outside the repository. Verified active state and boot enablement.
- Corrected Caddy's default listener behavior by adding an explicit `bind 127.0.0.1`. Socket inspection confirms only `127.0.0.1:8088`; direct requests to the server's network address cannot connect.
- Opened local SSH forwarding at `127.0.0.1:1314`. Anonymous requests receive an authentication challenge; valid credentials load homepage, articles, images, and search index. Private caching is enforced. Browser checks confirmed both localhost and loopback access, rendered math, and images.
- The final hostname check found an unmatched empty response for `localhost`. The tunnel listener now uses a host-independent HTTP address with explicit loopback binding; both localhost and 127.0.0.1 were rechecked for authentication and actual page content. The local authentication regression check now covers localhost too.
- Exercised a new staged release and previous-release tracking, rolled back successfully, and confirmed an invalid Markdown build leaves the live release unchanged.
- Rebuilt and verified an independent source clone with its bundled images. This checks source restoration, not a complete encrypted server backup.
- Only sample notes are present. The website is private through SSH and authentication; the GitHub repository itself was verified public.

Browser screenshots and temporary test output live in ignored `.local/`. Downloaded tool executables, credentials, dependencies, caches, and generated pages are excluded from Git.

## Private Tailscale HTTPS completed

- After the user enabled HTTPS certificates and Serve, configured persistent background Serve at `https://your-node.your-tailnet.ts.net/`, proxying to `http://127.0.0.1:8088`.
- Serve status confirms tailnet-only access. JSON configuration has no Funnel entry. Caddy remains active, enabled on boot, and bound only to `127.0.0.1:8088`.
- Requests from the local Tailscale-connected computer validated the HTTPS certificate normally. Anonymous homepage, article, search-index, image, and CSS requests returned 401; authenticated requests returned 200. An authenticated missing route returned 404. Authenticated content retains `private, no-store` caching.
- Headless Edge verified math, a bundled image, 390px reading without page overflow, and live search over HTTPS. The initial default browser launch encountered `ERR_CONNECTION_CLOSED`. Follow-up isolation confirmed the Windows system proxy caused the closure: bypassing only the proxy worked with normal browser protocols. Added an exact-host Windows proxy bypass, preserving all existing entries and saving the previous value in ignored local storage. Rechecked homepage, article, math, image, and search with default Edge settings successfully; no protocol flags or certificate exceptions were needed.
- Existing SSH forwarding remains a fallback; ordinary access on Tailscale devices no longer requires it. Credentials remain outside source control.
