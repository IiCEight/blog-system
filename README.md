# Private Markdown blog

A private, self-hosted blog written in Typora, generated with Hugo, and served on a Linux server through Caddy. The frontend will be custom designed. There is no CMS or database in the first version.

## Current status

Implemented and checked locally. The pink frontend, Markdown rendering, archive, tags, search, and Typora import are working. Local Caddy access-control checks passed. Remote deployment and production HTTPS checks are deferred until the GitHub repository and Tencent Cloud server details are available.

## Start locally

Requires Node.js 22 or newer and Git. From this project directory:

```sh
npm ci
npm run setup
npm run dev
```

Open http://localhost:1313/. Setup downloads the pinned official Hugo binary into `.tools/` and verifies its checksum. Nothing is installed globally. The preview binds only to this computer and deliberately has no login.

```sh
npm run new -- --title "My first thought" --slug my-first-thought --tag Learning
npm run build
npm run verify
```

Open the created `content/posts/my-first-thought/index.md` in Typora. Set `draft: false` when ready. Read [the writing guide](docs/writing.md) for importing existing notes and local images.

## Checks

- `npm run test:content`: import, image handling, original-file preservation, overwrite refusal, invalid-image detection, and draft exclusion.
- `npm run test:ui`: responsive pages and search, using an installed Chromium browser. Set `BROWSER_PATH` when needed; start the local preview first.
- `npm run test:auth`: site-wide Caddy access checks on loopback. Requires `CADDY_PATH` or a Caddy executable in `.tools/caddy/`.

See [local verification results](docs/verification.md) for tested scope and remaining deployment checks.

This project uses spec-driven development (SDD): agree on requirements and acceptance criteria, review the design, implement tasks, then verify against the specification.

1. [Requirements and acceptance criteria](specs/001-private-markdown-blog/spec.md)
2. [Architecture and visual design](specs/001-private-markdown-blog/plan.md)
3. [Implementation and verification tasks](specs/001-private-markdown-blog/tasks.md)

The user confirmed the file-based workflow, approved the pink design, and authorized local development with Git. Source is kept locally until the user creates the GitHub repository. The planned deployment flow is GitHub push, server clone/pull, Hugo build, and a staged release behind Caddy; see [deployment preparation](docs/deployment.md).

The `notebook/` directory is an unused scaffold from the earlier Sites proposal. It is untouched, excluded from Git, and not part of this Hugo project. Production code lives at the project root; `design/mockups/` preserves the design review artifacts.
