# Write and publish locally

Your notes live in `content/posts/<slug>/index.md`. Open that file in Typora and keep images in its `images/` directory. Use Typora's image preferences to copy images to `./images` and use relative paths.

## New note

```sh
npm run new -- --title "My thought" --slug my-thought --tag Learning
```

The command creates a draft with the current creation timestamp. Open the new `index.md` in Typora. The slug determines its URL and should not change when you change the title.

## Import an existing Typora file

```sh
npm run import -- "path/to/note.md" --title "My thought" --date "2026-10-01T16:41:00+08:00" --slug my-thought --tag Learning
```

The importer copies supported local images into the new post bundle at the same relative paths, preserves the Markdown body, and leaves the original document untouched. It refuses to overwrite an existing bundle. Markdown reference images are supported. Images must be inside the note's folder or a subfolder, and must be PNG, JPEG, WebP, GIF, SVG, or AVIF. Remote images, raw HTML images, diagrams, and desktop file links are not imported automatically. Standard YAML front matter can supply the title, date, slug, and tags instead of command arguments. For complex Typora syntax, inspect the preview before publishing.

After the first import, edit the imported `index.md` as your canonical note. Re-importing an older external copy would otherwise overwrite later changes, so the helper intentionally refuses it.

## Metadata

```yaml
---
title: "My thought"
date: 2026-10-01T16:41:00+08:00
lastmod: 2026-10-05T20:18:00+08:00
slug: my-thought
tags: [Learning]
draft: false
---
```

`date` is the original creation time. Keep it unchanged. `lastmod` is optional; set it when refining the note. `draft: true` excludes a note from the production build and search index. Use `draft: false` to include it. Future-dated posts are also excluded by default.

## Preview and build

```sh
npm run dev
```

Open http://localhost:1313/. This preview binds only to the local computer and does not require authentication. To preview drafts deliberately, use `npm run dev -- --buildDrafts`. Do not expose the development server to the internet.

```sh
npm run build
npm run verify
```

Generated files are in `public/`, ignored by Git. Source files and assets belong in Git; generated output, installed tools, and dependencies do not.

Inline math uses `$a^2 + b^2 = c^2$`, and display math uses `$$` on separate lines. Escape dollar signs used as currency to prevent them being interpreted as math. Math is rendered while building; all styles and fonts are local.

The two included posts are sample content. Replace or remove them before your first real deployment. To change the journal name or introductory text, edit `hugo.toml`.
