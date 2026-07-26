/// <reference types="astro/client" />

declare module '*.md' {
  export function render(): Promise<{ Content: unknown }>;
  export const frontmatter: Record<string, unknown>;
}
