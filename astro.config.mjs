// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import {
  rehypeCode,
  remarkCodeTab,
  remarkHeading,
  remarkStructure,
} from 'fumadocs-core/mdx-plugins';
import org from './astro-org/src/index.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [
    react(),
    mdx({
      extendMarkdownConfig: false,
      syntaxHighlight: false,
      remarkPlugins: [
        remarkHeading,
        remarkCodeTab,
        [remarkStructure, { exportAs: 'structuredData' }],
      ],
      rehypePlugins: [rehypeCode],
    }),
    sitemap(),
    org(),
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['tslib'],
    },
  },
});
