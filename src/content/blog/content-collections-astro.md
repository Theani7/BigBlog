---
title: 'Content Collections: The Heart of Astro'
description: "Understanding Astro 7's content collections and how to structure your content"
excerpt: "Deep dive into Astro 7's content collections, schemas, and loaders for type-safe content management."
slug: 'content-collections-astro'
publishedAt: 2026-07-20
author: 'Sarah Chen'
category: 'Engineering'
tags: ['astro', 'content', 'collections']
series: 'Astro Content Engine'
seriesOrder: 2
cover: '/covers/content-collections.jpg'
coverAlt: 'Content collection diagram'
keywords: ['astro', 'content collections', 'schema', 'zod']
---

Content collections are the backbone of any Astro project. They provide type safety, validation, and a clean API for querying your content.

## Defining Collections

Each collection is defined in `src/content.config.ts` using `defineCollection()` and a Zod schema. The schema validates every piece of content at build time, preventing invalid data from ever reaching production.

## Loaders

Astro 7 provides two built-in loaders:

- **`glob()`** — Loads markdown files from a directory
- **`file()`** — Loads data from a single JSON, YAML, or TOML file

## Querying Content

Use `getCollection()` and `getEntry()` to query your content at build time. These functions are fully typed and provide autocomplete in your IDE.

## Best Practices

- Always define a schema for every collection
- Use `slug` in frontmatter for custom URLs
- Keep content files co-located with their collection
- Validate early, validate often
