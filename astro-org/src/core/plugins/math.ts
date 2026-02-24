import { visit } from 'unist-util-visit';
import type { AstNode, PluginContext } from '../types';

/**
 * Custom rehype plugin to handle math, captions and table alignment
 */
export function rehypeCaptionsAndTableAlignment(context: PluginContext) {
  return (tree: AstNode) => {
    let tableIndex = 0;
    let imgIndex = 0;

    visit(
      tree,
      'element',
      (element: AstNode, index?: number, parent?: AstNode) => {
        const elem = element as any; // Type assertion for element properties

        // Handle math expressions
        if (
          (elem.tagName === 'code' || elem.tagName === 'span') &&
          elem.properties?.className?.includes('math')
        ) {
          const className = elem.properties.className;
          const isInline = Array.isArray(className)
            ? className.includes('math-inline')
            : className.includes('math-inline');
          let mathContent = elem.children?.[0]?.value || '';
          // Trim and remove surrounding $ if present
          mathContent = mathContent.trim().replace(/^\$+|\$+$/g, '');

          // Check if this is actually display math by looking at parent context
          // Display math has a newline in the preceding text
          const isDisplayMath =
            parent &&
            (parent as any).children &&
            (parent as any).children.length >= 2 &&
            (parent as any).children[0].type === 'text' &&
            (parent as any).children[0].value.includes('\n');

          if (isInline && !isDisplayMath) {
            // Replace with $...$
            (parent as any).children[index!] = {
              type: 'text',
              value: `$${mathContent}$`,
            };
          } else {
            // Replace with display math $$...$$
            (parent as any).children[index!] = {
              type: 'text',
              value: `$$\n${mathContent}\n$$`,
            };
          }
        }

        // Handle captions for images
        if (elem.tagName === 'img') {
          // Handle file: prefix in src
          if (elem.properties.src && elem.properties.src.startsWith('file:')) {
            elem.properties.src = elem.properties.src.slice(5);
            if (!elem.properties.alt) {
              elem.properties.alt = 'img';
            }
          }

          const captionInfo = context.captions[imgIndex++];
          if (captionInfo && index !== undefined && parent) {
            // Wrap the img in a figure
            const figure = {
              type: 'element',
              tagName: 'figure',
              properties: {},
              children: [
                element,
                {
                  type: 'element',
                  tagName: 'figcaption',
                  properties: {},
                  children: [
                    {
                      type: 'text',
                      value: captionInfo.caption,
                    },
                  ],
                },
              ],
            };

            // Replace the element with figure
            (parent as any).children[index] = figure;
          }
        }

        // Handle table alignment
        if (elem.tagName === 'table') {
          const alignmentInfo = context.tableAlignments[tableIndex++];
          if (!alignmentInfo) return;

          const alignments = alignmentInfo.alignments;

          // Check if we need to create thead/tbody structure
          const tbody = elem.children?.find(
            (child: any) => child.tagName === 'tbody'
          );
          if (tbody && tbody.children && tbody.children.length >= 2) {
            // Assume first row is header, second is separator
            const headerRow = tbody.children[0];
            const separatorRow = tbody.children[1];

            // Check if separator row contains dashes (indicating it's a separator)
            const isSeparator = separatorRow.children?.every((cell: any) =>
              cell.children?.[0]?.value?.trim().match(/^[-]+$/)
            );

            if (isSeparator) {
              // Create thead with header row
              const thead = {
                type: 'element',
                tagName: 'thead',
                properties: {},
                children: [headerRow],
              };

              // Convert header cells to th and apply alignment
              headerRow.children?.forEach((cell: any, index: number) => {
                cell.tagName = 'th';
                if (alignments[index]) {
                  cell.properties = cell.properties || {};
                  cell.properties.align = alignments[index];
                }
              });

              // Remove header and separator from tbody
              tbody.children.splice(0, 2);

              // Add thead to table
              elem.children.unshift(thead);
            }
          }
        }
      }
    );
  };
}
