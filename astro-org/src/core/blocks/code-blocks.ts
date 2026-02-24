import { LANGUAGE_MAPPINGS, MARKERS, PATTERNS } from '../constants';
import type { CodeBlock } from '../types';
import type { BlockContext } from './types';

function dedent(content: string): string {
  const lines = content.split('\n');
  if (lines.length === 0) return content;

  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim().length === 0) continue;
    const leadingSpaces = line.match(/^[ \t]*/)?.[0]?.length ?? 0;
    minIndent = Math.min(minIndent, leadingSpaces);
  }

  if (minIndent === Infinity || minIndent === 0) return content;

  return lines.map((line) => line.slice(minIndent)).join('\n');
}

/**
 * Parse header arguments from org-mode src block
 */
function parseHeaderArgs(headerArgs: string): {
  tangle?: string;
  exports?: string;
} {
  const args: { tangle?: string; exports?: string } = {};
  const parts = headerArgs.trim().split(/\s+/);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith(':tangle')) {
      args.tangle = parts[i + 1];
      i++; // skip value
    } else if (part.startsWith(':exports')) {
      args.exports = parts[i + 1];
      i++; // skip value
    }
  }
  return args;
}

/**
 * Find the matching end for nested blocks
 */
function findMatchingEnd(content: string, startIndex: number): number {
  let nestingLevel = 1;
  let searchIndex = startIndex;

  while (searchIndex < content.length && nestingLevel > 0) {
    const nextBegin = content.indexOf('#+begin_src', searchIndex);
    const nextEnd = content.indexOf('#+end_src', searchIndex);

    if (nextEnd === -1) return -1; // No matching end

    if (nextBegin !== -1 && nextBegin < nextEnd) {
      // Found nested begin_src
      nestingLevel++;
      searchIndex = nextBegin + '#+begin_src'.length;
    } else {
      // Found end_src
      nestingLevel--;
      if (nestingLevel === 0) {
        return nextEnd + '#+end_src'.length;
      }
      searchIndex = nextEnd + '#+end_src'.length;
    }
  }

  return -1; // No matching end found
}

/**
 * Process code blocks in org content
 */
export function processCodeBlocks(
  content: string,
  context: BlockContext
): string {
  let result = content;
  let codeBlockIndex = 0;

  // Handle text blocks first (with proper nesting support)
  while (true) {
    const beginIndex = result.indexOf('#+begin_src text', 0);
    if (beginIndex === -1) break;

    // Find the newline after begin_src text
    const newlineIndex = result.indexOf('\n', beginIndex);
    if (newlineIndex === -1) break;

    const endIndex = findMatchingEnd(result, newlineIndex + 1);
    if (endIndex === -1) break;

    const textBlock = result.substring(beginIndex, endIndex);
    context.codeBlocks.push({
      original: textBlock,
      lang: 'text',
    });
    const marker = `${MARKERS.CODE_BLOCK}${codeBlockIndex++}`;

    result =
      result.substring(0, beginIndex) + marker + result.substring(endIndex);
  }

  // Handle org blocks (with proper nesting support)
  while (true) {
    const beginIndex = result.indexOf('#+begin_src org', 0);
    if (beginIndex === -1) break;

    // Find the newline after begin_src org
    const newlineIndex = result.indexOf('\n', beginIndex);
    if (newlineIndex === -1) break;

    const endIndex = findMatchingEnd(result, newlineIndex + 1);
    if (endIndex === -1) break;

    const orgBlock = result.substring(beginIndex, endIndex);
    context.codeBlocks.push({
      original: orgBlock,
      lang: 'org',
    });
    const marker = `${MARKERS.CODE_BLOCK}${codeBlockIndex++}`;

    result =
      result.substring(0, beginIndex) + marker + result.substring(endIndex);
  }

  // Handle other code blocks with language detection
  result = result.replace(
    PATTERNS.CODE_BLOCK,
    (
      _match: string,
      lang: string = '',
      headerArgs: string = '',
      blockContent: string
    ) => {
      const parsedArgs = parseHeaderArgs(headerArgs);
      context.codeBlocks.push({
        original: _match,
        lang: lang || '',
        tangle: parsedArgs.tangle,
        exports: parsedArgs.exports,
      });
      return `${MARKERS.CODE_BLOCK}${codeBlockIndex++}`;
    }
  );

  return result;
}

/**
 * Restore code blocks in markdown
 */
export function restoreCodeBlocks(
  markdown: string,
  context: BlockContext
): string {
  return markdown.replace(
    new RegExp(`${MARKERS.CODE_BLOCK}(\\d+)`, 'g'),
    (_: string, index: string) => {
      const blockIndex = parseInt(index);
      const block = context.codeBlocks[blockIndex];
      if (!block) return '';

      const { original, lang } = block;

      if (lang === 'text') {
        // For text blocks, extract content between begin and end markers
        const beginMarker = '#+begin_src text\n';
        const endMarker = '\n#+end_src';
        const beginIndex = original.indexOf(beginMarker);
        const endIndex = original.lastIndexOf(endMarker);

        if (beginIndex !== -1 && endIndex !== -1 && endIndex > beginIndex) {
          const content = original.substring(
            beginIndex + beginMarker.length,
            endIndex
          );
          const trimmedContent = dedent(
            content.replace(/^\n+/, '').replace(/\n+$/, '')
          );
          return `\`\`\`text\n${trimmedContent}\n\`\`\``;
        }
        return original;
      } else if (lang === 'org') {
        // For org blocks, extract content and put in text code block without processing inner blocks
        const beginMarker = '#+begin_src org\n';
        const endMarker = '\n#+end_src';
        const beginIndex = original.indexOf(beginMarker);
        const endIndex = original.lastIndexOf(endMarker);

        if (beginIndex !== -1 && endIndex !== -1 && endIndex > beginIndex) {
          const content = original.substring(
            beginIndex + beginMarker.length,
            endIndex
          );
          const trimmedContent = dedent(
            content.replace(/^\n+/, '').replace(/\n+$/, '')
          );
          return `\`\`\`text\n${trimmedContent}\n\`\`\``;
        }
        return original;
      } else {
        // Skip rendering if exports is none
        if (block.exports === 'none') {
          return '';
        }
        // Convert org code block to markdown, recursively restoring inner blocks
        const result = original.replace(
          /#\+begin_src(?:[ \t]+(\w+)(.*)?)?[ \t]*\n([\s\S]*?)#\+end_src/gi,
          (
            _match: string,
            blockLang: string,
            _headerArgs: string,
            content: string
          ) => {
            // Restore any markers in content first
            const restoredContent = content.replace(
              /CODEBLOCKMARKER0/g,
              (_markerMatch: string) => {
                return restoreCodeBlocks('CODEBLOCKMARKER0', context);
              }
            );
            const trimmedContent = dedent(
              restoredContent.replace(/^\n+/, '').replace(/\n+$/, '')
            );
            // Map 'math' language to 'latex' for syntax highlighting
            const language = blockLang === 'math' ? 'latex' : blockLang || '';
            let codeBlock = `\`\`\`${language}\n${trimmedContent}\n\`\`\``;
            if (block.tangle) {
              codeBlock = `\`\`\`${language} title="${block.tangle}"\n${trimmedContent}\n\`\`\``;
            }
            return codeBlock;
          }
        );
        return result;
      }
    }
  );
}
