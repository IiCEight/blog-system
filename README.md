# Private Markdown blog

A private, self-hosted blog written in Typora, generated with Hugo, and served on a Linux server through Caddy. The frontend will be custom designed. There is no CMS or database in the first version.

## Current status

Implemented locally and deployed on Tencent Cloud through a private SSH tunnel. The pink frontend, Markdown rendering, archive, tags, search, and Typora import are working. Linux release, rollback, failed-build preservation, source restoration, and tunnel authentication checks passed. Public-domain HTTPS remains deferred by choice.

## Open the server-hosted blog

```sh
ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:1314:127.0.0.1:8088 tencent
```

Then open http://localhost:1314/ and sign in. Local login details are in the ignored `.local/tunnel-login.txt` on the computer used for deployment; they are not in GitHub. Caddy listens only on server loopback. Each other device needs its own SSH tunnel until a private HTTPS domain is configured.

**Source privacy:** the GitHub repository was verified public during deployment. Make it private before committing personal Markdown or images. Authentication on the website does not protect publicly committed source content. Only sample notes have been deployed.

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

The user confirmed the file-based workflow, approved the pink design, and authorized local development with Git, then supplied the GitHub repository and `tencent` SSH alias. Source is pushed to GitHub. Because GitHub access from the server is unreliable, the initial server clone used a checksum-verified Git bundle sent over SSH. See [deployment instructions](docs/deployment.md).

The `notebook/` directory is an unused scaffold from the earlier Sites proposal. It is untouched, excluded from Git, and not part of this Hugo project. Production code lives at the project root; `design/mockups/` preserves the design review artifacts.
