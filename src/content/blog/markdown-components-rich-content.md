---
title: 'Markdown Components for Rich Content'
description: 'Building reusable markdown components for callouts, code blocks, tables, and more'
excerpt: 'Create a consistent content experience with reusable markdown components that support dark mode and accessibility.'
slug: 'markdown-components-rich-content'
publishedAt: 2026-07-25
author: 'Aiko Tanaka'
category: 'Design'
tags: ['markdown', 'components', 'mdx', 'design']
series: 'Astro Content Engine'
seriesOrder: 3
cover: '/covers/markdown-components.jpg'
coverAlt: 'Markdown components preview'
keywords: ['markdown', 'components', 'mdx', 'design']
---

Markdown components transform raw markdown into rich, interactive content. In Astro with MDX, you can create reusable components that work seamlessly in your markdown files.

## Callout Component

Callouts draw attention to important information. They support multiple variants: info, warning, danger, and success.

## Code Block Component

Code blocks should support syntax highlighting, line numbers, and copy-to-clipboard functionality.

## Table Component

Tables need to be responsive and accessible, with proper header markup and keyboard navigation.

## Dark Mode Support

Every component must look great in both light and dark modes. Use CSS custom properties to ensure consistent theming.

## Accessibility

Components should use semantic HTML, support keyboard navigation, and include ARIA attributes where appropriate.
