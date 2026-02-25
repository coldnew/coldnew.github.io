import { visit } from 'unist-util-visit';
import type { AstNode, PluginContext } from '../types';

/**
 * Function to convert Org AST to HTML text (used for captions)
 */
function astToHtml(ast: AstNode[]): string {
  return ast
    .map((node) => {
      if (node.type === 'text') return node.value || '';
      if (node.type === 'bold')
        return `<strong>${astToHtml(node.children || [])}</strong>`;
      if (node.type === 'italic')
        return `<em>${astToHtml(node.children || [])}</em>`;
      if (node.type === 'code') return `<code>${node.value || ''}</code>`;
      if (node.type === 'verbatim') return `<code>${node.value || ''}</code>`;
      return '';
    })
    .join('');
}

/**
 * Plugin to handle Org captions and other affiliated keywords
 */
export function orgCaptions(context: PluginContext) {
  return (tree: AstNode) => {
    context.captions = [];
    let captionIndex = 0;

    visit(tree, ['paragraph', 'link'], (node: AstNode) => {
      if ((node as any).affiliated?.CAPTION) {
        // This node has a caption
        const caption = astToHtml((node as any).affiliated.CAPTION[0]).trim();

        // Store caption info
        context.captions.push({ index: captionIndex++, caption });

        // Remove the affiliated data
        delete (node as any).affiliated;
      }
    });
  };
}
