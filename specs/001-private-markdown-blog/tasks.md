# Tasks and review gates

Local implementation is complete. Remote acceptance checks remain pending, as detailed in `docs/verification.md`.

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

- [ ] Collect server/domain/runtime details and configure Caddy HTTPS with site-wide authentication. (R06)
- [x] Implement local validation/build and prepare server-side staged-release/rollback scripts; shell syntax checked, Linux execution pending. (R10)
- [x] Document Typora image settings, metadata, publishing, backups, and restore. (R02, R03, R11)

## Phase 4: acceptance and handoff

- [ ] Compare a real Typora sample with rendered output; record unsupported syntax if any. (R01, R02)
- [x] Verify local routes, archive, tags, search, import, image failures, and draft exclusion. Stable slugs are explicit in metadata; real-note republishing remains part of user acceptance. (R03, R04, R05)
- [x] Verify 360px, 768px, and 1440px layouts, keyboard skip link, enlarged desktop article text, and reduced motion. (R07, R08, R09)
- [x] Verify local Caddy denies anonymous and wrong-password requests for articles, images, search data, assets, and missing routes; valid credentials work. Production HTTPS verification remains pending. (R06)
- [ ] Verify failed builds/uploads preserve the live release and rollback restores it. (R10)
- [ ] Verify backup restoration in a separate directory. (R11)
- [x] Record successful local checks separately from pending server checks in `docs/verification.md`. (R06, R10)
