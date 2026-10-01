# Tasks and review gates

Local implementation and private Tencent SSH-tunnel deployment are complete. Remaining user-content, repository-privacy, and public-domain checks are recorded in `docs/verification.md`.

## Phase 0: review

- [x] Record confirmed requirements, scope, architecture, and acceptance criteria.
- [x] User confirms the file-based workflow and authorizes local development with Git.
- [x] Prepare homepage and article mockups for visual review in `design/mockups/`.
- [x] User reviews and approves the frontend layout and pink palette before implementation.

These gates reflect the user's request to review before implementation, not an additional deployment permission policy.

## Phase 1: foundation and Markdown

- [x] Establish Hugo project at the workspace root; keep the unused notebook scaffold untouched. Pin tested tooling. (R01, R11)
- [x] Define post bundle templates and metadata validation; preserve original files and stable URLs. (R02, R03, R04)
- [x] Implement rendering for a representative Markdown fixture, relative images, syntax highlighting, and locally served math assets. (R01, R02, R12)
- [x] Verify production excludes drafts; configure explicit creation dates independent of rebuild time. (R03, R04)

## Phase 2: custom frontend

- [x] Implement approved homepage and article layouts with responsive typography and navigation. (R07, R08)
- [x] Add archive, tag views, and static title/body search. (R05)
- [x] Implement keyboard focus and reduced-motion behavior; verify enlarged text and narrow-screen layouts. Full browser-zoom audit remains separate. (R09)
- [x] Verify asset loading is self-contained and content is readable without JavaScript. (R12)

## Phase 3: private hosting and publishing

- [x] Inspect Tencent Ubuntu/runtime setup and configure loopback-only Caddy with site-wide authentication through the user-selected SSH tunnel. Public-domain HTTPS is deferred. (R06)
- [x] Implement and exercise Linux staged release, previous-release tracking, rollback, and failed-build preservation. (R10)
- [x] Document Typora image settings, metadata, publishing, backups, and restore. (R02, R03, R11)

## Phase 4: acceptance and handoff

- [ ] Compare a real Typora sample with rendered output; record unsupported syntax if any. (R01, R02)
- [x] Verify local routes, archive, tags, search, import, image failures, and draft exclusion. Stable slugs are explicit in metadata; real-note republishing remains part of user acceptance. (R03, R04, R05)
- [x] Verify 360px, 768px, and 1440px layouts, keyboard skip link, enlarged desktop article text, and reduced motion. (R07, R08, R09)
- [x] Verify Caddy access control locally and on Tencent through the tunnel; inspect sockets to confirm loopback-only binding. Public-domain HTTPS is deferred. (R06)
- [x] Verify failed builds preserve the live release and rollback restores it on Linux. (R10)
- [x] Rebuild an independent Git clone with image assets in a separate directory. Full encrypted service backup remains pending. (R11)
- [x] Record successful local checks separately from pending server checks in `docs/verification.md`. (R06, R10)
