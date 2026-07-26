---
title: 'Building a Theme System with CSS Variables'
description: 'How to build a robust light/dark/system theme system using CSS custom properties'
excerpt: 'A complete guide to building a theme system that supports light mode, dark mode, and system preference with zero JavaScript.'
slug: 'css-variables-theme-system'
publishedAt: 2026-07-18
author: 'Aiko Tanaka'
category: 'Design'
tags: ['css', 'theme', 'design', 'accessibility']
cover: '/covers/theme-system.jpg'
coverAlt: 'Theme system diagram showing light and dark modes'
keywords: ['css', 'theme', 'dark mode', 'design']
---

A well-designed theme system is essential for modern web applications. CSS custom properties make it possible to build a theme system that works without JavaScript.

## The Approach

We use a `data-theme` attribute on the `<html>` element combined with CSS custom properties. This means:

- No JavaScript needed for theme switching
- Instant transitions between modes
- Full support for `prefers-color-scheme`
- No flash of incorrect theme on page load

## Design Tokens

Every visual property is defined as a CSS custom property. This includes colors, spacing, typography, shadows, and animation durations.

## Responsive Design

The theme system works seamlessly with responsive breakpoints. Use CSS media queries to adapt the layout to any screen size.

## Accessibility

The theme system respects `prefers-reduced-motion` for users who prefer fewer animations. All interactive elements have visible focus states.
