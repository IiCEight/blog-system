# Later: deploy from GitHub on Tencent Cloud

The GitHub repository is `git@github.com:IiCEight/blog-system.git`. The user authorized deployment through the `tencent` SSH alias and selected an SSH tunnel before configuring a domain. The server runs Ubuntu 24.04 with Node.js 22. Deployment verification is recorded separately in `docs/verification.md`.

## Private access through an SSH tunnel

Use `deploy/Caddyfile.tunnel` for a listener on **127.0.0.1:8088 only**. The configuration disables Caddy's admin port and automatic HTTPS for this loopback listener, and still requires a username and password. HTTP is confined to loopback; SSH encrypts the connection between your computer and the server.

```sh
ssh -N -o ExitOnForwardFailure=yes -L 1314:127.0.0.1:8088 tencent
```

Keep the tunnel running and open http://localhost:1314/. The normal local development preview remains at port 1313. Other devices also need an SSH tunnel or, later, a configured HTTPS domain. No internet-facing web firewall rule is needed for this mode.

Run releases on the server with `sh deploy/release.sh http://127.0.0.1:8088/`. Only the explicit loopback URL exception allows HTTP; a public address must use HTTPS. A dedicated `fieldnotes-caddy` service keeps the private listener running after SSH disconnects. Credentials stay outside the repository.

If the server cannot authenticate to GitHub, a Git bundle transferred over SSH can be cloned while preserving the verified source commit and history. This is an initial transport fallback; direct GitHub pulls still require working server GitHub access.

## Intended workflow

1. Create a private GitHub repository and push this local source repository.
2. On the server, install Git, Node.js 22 or newer, and Caddy using instructions for that distribution.
3. Clone the private repository using a read-only deploy key. Keep the key on the server, outside source control.
4. Create `/srv/fieldnotes/releases` and assign ownership to the deployment user. Caddy needs read/traverse access to release directories. Use restrictive source permissions, but readable generated output behind authenticated Caddy.
5. Run `sh deploy/release.sh https://your-domain/` from the cloned repository. It installs the locked dependencies, verifies the pinned Hugo download, validates Markdown, builds, and stages a release before switching the served directory. Run releases sequentially, not concurrently.
6. Configure Caddy using `deploy/Caddyfile.example`, replacing the domain. Caddy is the only network entry point; Hugo is used only for builds, not as a public server.
7. Test authentication and HTTPS on the real domain before calling deployment complete.

The server build needs outbound access to GitHub and the npm registry. If this is unreliable on Tencent Cloud, build locally and transfer generated output over SSH instead; do not introduce unverified download mirrors.

## Authentication

Set `BLOG_USER` and `BLOG_PASSWORD_HASH` in Caddy's service environment. Generate a password hash with Caddy's interactive `caddy hash-password` command. Keep the password, hash, and SSH keys out of Git. Basic authentication uses the browser's native username/password prompt; it is not a custom login screen.

Use HTTPS. Configure DNS to point your domain to the server and allow TCP 80/443 through both the host firewall and Tencent security group. Do not expose development or alternate static-serving ports. The example protects the full site, including images, assets, and the search index. Its public error responses contain no article content.

Authentication tests must check an article, image, search index, CSS asset, and missing route: anonymous requests must not reveal private content; authenticated requests should succeed where the file exists. Verify redirects and authentication challenges over HTTPS. These checks remain pending until a real server is available.

## Update and rollback

After publishing edits to GitHub, run `git pull --ff-only`, followed by the same release command. Failed validation or build leaves the active release unchanged. Use `sh deploy/rollback.sh` to restore the previous release. Releases are retained; prune old releases deliberately after confirming backups. Do not delete the targets of the current or previous symlinks.

## Backup and restore

Back up the Git repository with Markdown and image bundles, Caddy configuration, and Caddy's persistent certificate state. Keep authentication configuration and deploy keys in a separate encrypted backup; do not add them to the repository. Git alone is not an independent backup if all copies share the same account or server.

To restore, clone or restore the repository, install prerequisites, restore Caddy configuration and protected service environment, then build a new release. Run the authentication smoke checks again. Generated `public/` is reproducible and need not be authoritative.

## Official references

- Hugo installation: https://gohugo.io/installation/
- Hugo mathematical rendering: https://gohugo.io/render-hooks/passthrough/
- Caddy authentication: https://caddyserver.com/docs/caddyfile/directives/basic_auth
- Caddy automatic HTTPS: https://caddyserver.com/docs/automatic-https
