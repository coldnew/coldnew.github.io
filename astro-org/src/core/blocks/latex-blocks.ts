import { MARKERS } from '../constants';
import type { BlockContext } from './types';

/**
 * Process LaTeX blocks in org content
 */
export function processLatexBlocks(
  content: string,
  context: BlockContext
): string {
  let result = content;
  let latexIndex = 0;

  result = result.replace(
    /#\+begin_latex\s*\n([\s\S]*?)#\+end_latex/g,
    (_, blockContent: string) => {
      context.latexBlocks.push({
        content: blockContent.trim(),
        index: latexIndex,
      });
      return `${MARKERS.LATEX_BLOCK}${latexIndex++}`;
    }
  );

  return result;
}

/**
 * Restore LaTeX blocks in markdown
 */
export function restoreLatexBlocks(
  markdown: string,
  context: BlockContext
): string {
  return markdown.replace(
    new RegExp(`${MARKERS.LATEX_BLOCK}(\\d+)`, 'g'),
    (_, index: string) => {
      const blockIndex = parseInt(index, 10);
      const block = context.latexBlocks[blockIndex];
      if (!block) return '';

      return `\`\`\`math\n${block.content}\n\`\`\``;
    }
  );
}
