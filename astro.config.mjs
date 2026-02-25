// @ts-nocheck

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
import { visit } from 'unist-util-visit';
import astroMdx from './astro/mdx/src/index.ts';
import org from './astro/org/src/index.ts';

function rehypeAddShikiThemes() {
  return (tree) => {
    console.log('rehypeAddShikiThemes called');
    visit(tree, 'element', (node) => {
      console.log('element:', node.tagName, node.properties?.className);
      if (
        node.tagName === 'figure' &&
        node.properties?.className?.includes('shiki')
      ) {
        console.log('found shiki figure, adding themes');
        const existingClasses = node.properties.className;
        if (!existingClasses.includes('shiki-themes')) {
          node.properties.className = [
            ...existingClasses,
            'shiki',
            'shiki-themes',
            'github-light',
            'github-dark',
          ];
        }
      }
    });
  };
}

const mdxOptions = {
  remarkPlugins: [
    remarkHeading,
    remarkCodeTab,
    [remarkStructure, { exportAs: 'structuredData' }],
  ],
  rehypePlugins: [
    [
      rehypeCode,
      {
        themes: { light: 'github-light', dark: 'github-dark' },
        defaultColor: false,
      },
    ],
    rehypeAddShikiThemes,
  ],
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
