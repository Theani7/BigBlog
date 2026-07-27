/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

declare module '*.md' {
  export function render(): Promise<{ Content: unknown }>;
  export const frontmatter: Record<string, unknown>;
}
