import { htmlToJsx } from 'html-to-jsx-transform';
import { MARKERS } from '../constants';
import type { ExportBlock, ExportHtmlBlock } from '../types';
import type { BlockContext } from './types';

/**
 * Process export HTML blocks in org content
 */
export function processExportHtmlBlocks(
  content: string,
  context: BlockContext
): string {
  let result = content;
  let exportHtmlIndex = 0;

  result = result.replace(
    /#\+begin_export html(.*)?\s*\n([\s\S]*?)#\+end_export/g,
    (_, properties: string, html: string) => {
      // Check for :noexport: property
      if (properties && properties.trim().includes(':noexport:')) {
        return '';
      }

      context.exportHtmlBlocks.push({
        html: html.trim(),
        index: exportHtmlIndex,
      });
      return `${MARKERS.EXPORT_HTML_BLOCK}${exportHtmlIndex++}`;
    }
  );

  return result;
}

/**
 * Process generic export blocks in org content
 */
export function processExportBlocks(
  content: string,
  context: BlockContext
): string {
  let result = content;
  let exportIndex = 0;

  result = result.replace(
    /#\+begin_export (\w+)(.*)?\s*\n([\s\S]*?)#\+end_export/g,
    (_, type: string, properties: string, content: string) => {
      // Skip html type as it needs special JSX conversion
      if (type === 'html') {
        return _;
      }

      // Check for :noexport: property
      if (properties && properties.trim().includes(':noexport:')) {
        return '';
      }

      context.exportBlocks.push({
        content: content.trim(),
        type: type,
        index: exportIndex,
      });
      return `${MARKERS.EXPORT_BLOCK}${exportIndex++}`;
    }
  );

  return result;
}

/**
 * Restore export HTML blocks in markdown
 */
export function restoreExportHtmlBlocks(
  markdown: string,
  context: BlockContext
): string {
  return markdown.replace(
    new RegExp(`${MARKERS.EXPORT_HTML_BLOCK}(\\d+)`, 'g'),
    (_, index: string) => {
      const blockIndex = parseInt(index);
      const block = context.exportHtmlBlocks[blockIndex];
      if (!block) return '';

      return htmlToJsx(block.html);
    }
  );
}

/**
 * Restore generic export blocks in markdown
 */
export function restoreExportBlocks(
  markdown: string,
  context: BlockContext
): string {
  return markdown.replace(
    new RegExp(`${MARKERS.EXPORT_BLOCK}(\\d+)`, 'g'),
    (_, index: string) => {
      const blockIndex = parseInt(index);
      const block = context.exportBlocks[blockIndex];
      if (!block) return '';

      return block.content;
    }
  );
}
