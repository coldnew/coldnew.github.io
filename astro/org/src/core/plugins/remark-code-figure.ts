import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

export interface RemarkCodeFigureOptions {
  theme?: string;
}

export const remarkCodeFigure: Plugin<[RemarkCodeFigureOptions?], Root> =
  () => (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (!parent || parent.type !== 'root') return;

      const _lang = node.lang || '';
      const meta = node.meta || '';

      // Extract title from meta if present (e.g., title="file.js")
      let title = '';
      const titleMatch = meta.match(/title="([^"]*)"/);
      if (titleMatch) {
        title = titleMatch[1];
      }

      // Create a custom container that will be transformed to figure
      const container: any = {
        type: 'container',
        data: {
          hName: 'figure',
          hProperties: {
            className: [
              'my-4',
              'rounded-xl',
              'shiki',
              'relative',
              'border',
              'shadow-sm',
              'not-prose',
              'overflow-hidden',
              'text-sm',
            ],
            dir: 'ltr',
            tabIndex: 0,
          },
        },
        children: [node],
      };

      if (title) {
        container.children.unshift({
          type: 'html',
          value: `<div class="px-4 py-2 text-xs border-b border-[var(--shiki-border)] font-mono">${title}</div>`,
        });
      }

      // Add copy button
      container.children.push({
        type: 'html',
        value: `<button type="button" class="absolute top-3 end-3 z-10 p-1.5 rounded-md bg-fd-muted text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground" aria-label="Copy code"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg></button>`,
      });

      if (index !== undefined) {
        (parent as any).children[index] = container;
      }
    });
  };
