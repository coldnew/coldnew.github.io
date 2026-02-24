declare module 'astro:content' {
  interface Render {
    '.mdx': Promise<{
      Content: import('astro').MDXContent;
      headings: import('astro').MarkdownHeading[];
      remarkPluginFrontmatter: Record<string, any>;
      // biome-ignore lint/complexity/noBannedTypes: Following Astro's MDX types pattern
      components: import('astro').MDXInstance<{}>['components'];
    }>;
  }
}
