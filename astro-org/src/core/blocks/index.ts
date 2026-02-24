import { processCodeBlocks, restoreCodeBlocks } from './code-blocks';
import { processDrawerBlocks, restoreDrawerBlocks } from './drawer-blocks';
import {
  processExportBlocks,
  processExportHtmlBlocks,
  restoreExportBlocks,
  restoreExportHtmlBlocks,
} from './export-blocks';
import { processHtmlBlocks, restoreHtmlBlocks } from './html-blocks';
import { processJsxBlocks, restoreJsxBlocks } from './jsx-blocks';
import { processLatexBlocks, restoreLatexBlocks } from './latex-blocks';
import type { BlockContext, BlockRegistry } from './types';

/**
 * Block processor registry
 */
export const blockProcessors: BlockRegistry = {
  code: {
    process: processCodeBlocks,
    restore: restoreCodeBlocks,
  },
  latex: {
    process: processLatexBlocks,
    restore: restoreLatexBlocks,
  },
  html: {
    process: processHtmlBlocks,
    restore: restoreHtmlBlocks,
  },
  jsx: {
    process: processJsxBlocks,
    restore: restoreJsxBlocks,
  },
  exportHtml: {
    process: processExportHtmlBlocks,
    restore: restoreExportHtmlBlocks,
  },
  export: {
    process: processExportBlocks,
    restore: restoreExportBlocks,
  },
  drawer: {
    process: processDrawerBlocks,
    restore: restoreDrawerBlocks,
  },
};

/**
 * Process all blocks in org content
 */
export function processBlocks(content: string, context: BlockContext): string {
  let result = content;

  // Process blocks in order
  result = blockProcessors.code.process(result, context);
  result = blockProcessors.latex.process(result, context);
  result = blockProcessors.html.process(result, context);
  result = blockProcessors.jsx.process(result, context);
  result = blockProcessors.exportHtml.process(result, context);
  result = blockProcessors.export.process(result, context);
  result = blockProcessors.drawer.process(result, context);

  return result;
}

/**
 * Restore all blocks in markdown
 */
export function restoreBlocks(markdown: string, context: BlockContext): string {
  let result = markdown;

  // Restore blocks in reverse order
  result = blockProcessors.drawer.restore(result, context);
  result = blockProcessors.export.restore(result, context);
  result = blockProcessors.exportHtml.restore(result, context);
  result = blockProcessors.jsx.restore(result, context);
  result = blockProcessors.html.restore(result, context);
  result = blockProcessors.latex.restore(result, context);
  result = blockProcessors.code.restore(result, context);

  return result;
}
