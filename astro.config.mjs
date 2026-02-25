// @ts-check

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';
import {
  rehypeCode,
  remarkCodeTab,
  remarkHeading,
  remarkStructure,
} from 'fumadocs-core/mdx-plugins';
import astroMdx from './astro/mdx/src/index.ts';
import org from './astro/org/src/index.ts';

const mdxOptions = {
  remarkPlugins: [
    remarkHeading,
    remarkCodeTab,
    [remarkStructure, { exportAs: 'structuredData' }],
  ],
  rehypePlugins: [rehypeCode],
};

export default defineConfig({
  site: 'https://example.com',
  integrations: [
    react(),
    org({ mdxOptions }),
    astroMdx(mdxOptions),
    sitemap(),
    pagefind(),
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['tslib', 'fumadocs-ui'],
    },
  },
});
