import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

export interface RehypeCodeFigureOptions {
  theme?: string;
}

export const rehypeCodeFigure: Plugin<[RehypeCodeFigureOptions?], Root> =
  () => (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'code') return;

      const el = node as unknown as Element;
      const props = el.properties || {};
      const className = (props.className as string[]) || [];

      console.log('[code-figure] Found code, className:', className);

      // Check if this code has shiki styling (indicating it's a code block, not inline)
      const isCodeBlock = className.some(
        (c: string) => c.startsWith('language-') || c.startsWith('shiki')
      );
      if (!isCodeBlock) return;

      // Find the parent pre element
      const preParent = parent as unknown as Element;
      if (!preParent || preParent.tagName !== 'pre') return;

      // Check if pre is already wrapped
      const grandParent =
        preParent && index !== undefined
          ? (parent as unknown as { parent?: Element }).parent
          : undefined;
      if (grandParent && grandParent.tagName === 'figure') return;

      console.log('[code-figure] Wrapping code block in figure');

      const figClasses: (string | number)[] = [
        'my-4',
        'rounded-xl',
        'shiki',
        'relative',
        'border',
        'shadow-sm',
        'not-prose',
        'overflow-hidden',
        'text-sm',
      ];

      const figure: Element = {
        type: 'element',
        tagName: 'figure',
        properties: {
          className: figClasses,
          dir: 'ltr',
          tabIndex: 0,
        },
        children: [],
      };

      const copyButton: Element = {
        type: 'element',
        tagName: 'button',
        properties: {
          type: 'button',
          className: [
            'absolute',
            'top-3',
            'end-3',
            'z-10',
            'p-1.5',
            'rounded-md',
            'bg-fd-muted',
            'text-fd-muted-foreground',
            'hover:bg-fd-accent',
            'hover:text-fd-accent-foreground',
          ],
          'aria-label': 'Copy code',
        },
        children: [
          {
            type: 'element',
            tagName: 'svg',
            properties: {
              xmlns: 'http://www.w3.org/2000/svg',
              width: 16,
              height: 16,
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: 2,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              className: 'lucide lucide-copy',
            },
            children: [],
          },
        ],
      };

      const wrapper: Element = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['overflow-x-auto', 'py-3', 'px-4'],
        },
        children: [preParent],
      };

      figure.children.push(copyButton);
      figure.children.push(wrapper);

      if (
        index !== undefined &&
        parent &&
        (parent as unknown as Element).children
      ) {
        const p = parent as unknown as {
          parent?: Element;
          children: Element[];
        };
        if (p.parent) {
          const gpIndex = p.parent.children.indexOf(preParent);
          if (gpIndex >= 0) {
            p.parent.children[gpIndex] = figure;
          }
        }
      }
    });
  };
