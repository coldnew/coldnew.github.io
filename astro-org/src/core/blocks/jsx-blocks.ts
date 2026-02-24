import { MARKERS } from '../constants';
import type { JsxBlock } from '../types';
import type { BlockContext } from './types';

/**
 * Process JSX blocks in org content
 */
export function processJsxBlocks(
  content: string,
  context: BlockContext
): string {
  let result = content;
  let jsxIndex = 0;

  result = result.replace(/^#\+jsx:\s*(.+)$/gim, (_, jsx: string) => {
    context.jsxBlocks.push({
      jsx: jsx.trim(),
      index: jsxIndex,
    });
    return `${MARKERS.JSX_BLOCK}${jsxIndex++}`;
  });

  return result;
}

/**
 * Restore JSX blocks in markdown
 */
export function restoreJsxBlocks(
  markdown: string,
  context: BlockContext
): string {
  return markdown.replace(
    new RegExp(`${MARKERS.JSX_BLOCK}(\\d+)`, 'g'),
    (_, index: string) => {
      const blockIndex = parseInt(index);
      const block = context.jsxBlocks[blockIndex];
      if (!block) return '';

      return block.jsx;
    }
  );
}
