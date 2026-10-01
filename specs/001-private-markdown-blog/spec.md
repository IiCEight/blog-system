# Specification: private Markdown blog

Status: local implementation authorized after workflow and pink design review; remote deployment deferred.
Date: 2026-10-01 (Asia/Shanghai).

## Purpose

Publish quick ideas and long learning notes written in Typora, revisit and refine them over time, and read them privately from a phone, tablet, or computer. Use an existing publishing engine with a distinctive custom frontend rather than building a CMS.

## Confirmed constraints

- Linux hosting on the user's Tencent Cloud or JD Cloud server.
- Published content is private and requires authentication.
- Typora Markdown is the source, with Markdown preview provided by Typora.
- English interface.
- Custom, fashion-forward frontend inspired by the visual ambition of Awwwards.
- No content management layer in the first version.
- Specification and design review precede implementation.

## Proposed first-version workflow

1. Create or edit a post bundle locally in Typora.
2. Keep the Markdown file and its relative image folder together.
3. Preview the rendered blog locally.
4. Build and verify locally, then push source to the GitHub repository once the user creates it. Clone/pull on Tencent Cloud and run the release command there; it validates, builds, and stages the generated website before switching Caddy's served directory.
5. Open the private website from another device and authenticate.
6. Edit the same source file later and publish again, keeping the URL and original creation date.

This is file-based publishing. Browser uploads, browser writing, live cross-device editing, and automatic synchronization are not included. Server access details will be needed only for deployment configuration.

## Requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| R01 | Render Typora Markdown | A fixture containing headings, paragraphs, lists, task lists, tables, quotes, links, fenced code, inline math, and block math renders correctly. |
| R02 | Keep images with posts | Nested relative image paths resolve after publishing. Missing local assets or Windows absolute paths cause validation to fail with the affected file and link. |
| R03 | Preserve metadata | Each post has a title, creation date with timezone, and stable URL; tags, summary, and update date are supported. Creation date does not change on rebuild. |
| R04 | Publish evolving notes | Editing a post updates the existing page at the same URL. Drafts are excluded from the production build. No separate idea/note/article workflow is required. |
| R05 | Browse and find writing | Homepage exposes recent posts; archive lists posts by creation date; tag pages group posts; search matches title and body. Search has empty and no-result states. |
| R06 | Require private access | Unauthenticated requests cannot obtain HTML pages, images, search data, feeds, or downloads. Valid credentials grant access over HTTPS. |
| R07 | Provide a custom frontend | Homepage and article layout follow the design in plan.md. No stock theme is presented as the finished design. |
| R08 | Work across devices | At 360px, 768px, and 1440px widths, navigation and reading remain usable without page-wide horizontal scrolling. Long code and tables can scroll within their containers. |
| R09 | Support accessible interaction | Keyboard navigation, visible focus, labeled search, readable contrast, and reduced-motion preferences work. Reading remains usable at 200% zoom. |
| R10 | Publish reliably | Validate and build before upload. A failed validation/build leaves the live site intact. Publish via a staged release; support rollback to the previous release. |
| R11 | Keep content portable | Source Markdown, images, configuration, and theme can be backed up and restored without a proprietary database. Backup instructions include Caddy configuration and persistent certificate state; credentials stay outside source control. |
| R12 | Keep private reading self-contained | Fonts, scripts, styles, and math rendering assets are served locally. No analytics, third-party font calls, or public search service is required. |

## Content contract

```text
content/posts/raft-thought/
  index.md
  images/commit-rule.png
```

```yaml
---
title: "A thought about Raft commit rules"
date: 2026-10-01T16:41:00+08:00
lastmod: 2026-10-05T20:18:00+08:00
slug: raft-thought
tags: [raft, distributed-systems]
draft: false
---
```

The body below the metadata remains ordinary Markdown editable in Typora. A local publishing helper may scaffold or normalize metadata, but must not silently rewrite existing source files or infer creation time from filesystem timestamps. For files without metadata, require the missing title/date explicitly and preserve the original.

Use `![Commit rule](images/commit-rule.png)` for portable images. Arbitrary Typora-specific HTML, diagram syntax, and desktop-local file links are not promised equivalent rendering. Compatibility must be checked with one user-provided sample before rollout; synthetic fixtures are sufficient for initial development.

## Exclusions

CMS, database, browser upload dashboard, online editor, public posts, comments, newsletters, multi-user administration, knowledge graphs, offline writing, and automated server-to-server replication. A private RSS feed is deferred; any later feed must be protected like the rest of the site.

## Review points

1. Confirm that local Typora writing plus command-based publishing is acceptable for version one.
2. Homepage and article layout and the revised pink palette are approved.
3. Deployment details remain pending: chosen server, domain, SSH access, and available runtime. No remote changes are part of the specification phase.
