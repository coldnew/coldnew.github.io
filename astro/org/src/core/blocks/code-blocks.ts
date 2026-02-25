import { MARKERS, PATTERNS } from '../constants';
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
 * Find the matching end for nested blocks (case-insensitive)
 */
function findMatchingEnd(content: string, startIndex: number): number {
  let nestingLevel = 1;
  let searchIndex = startIndex;
  const lowerContent = content.toLowerCase();

  while (searchIndex < content.length && nestingLevel > 0) {
    const nextBegin = lowerContent.indexOf('#+begin_src', searchIndex);
    const nextEnd = lowerContent.indexOf('#+end_src', searchIndex);

    if (nextEnd === -1) return -1;

    if (nextBegin !== -1 && nextBegin < nextEnd) {
      nestingLevel++;
      searchIndex = nextBegin + '#+begin_src'.length;
    } else {
      nestingLevel--;
      if (nestingLevel === 0) {
        return nextEnd + '#+end_src'.length;
      }
      searchIndex = nextEnd + '#+end_src'.length;
    }
  }

  return -1;
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

  // Handle text blocks first (with proper nesting support, case-insensitive)
  while (true) {
    const lowerResult = result.toLowerCase();
    const beginIndex = lowerResult.indexOf('#+begin_src text', 0);
    if (beginIndex === -1) break;

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

  // Handle org blocks (with proper nesting support, case-insensitive)
  while (true) {
    const lowerResult = result.toLowerCase();
    const beginIndex = lowerResult.indexOf('#+begin_src org', 0);
    if (beginIndex === -1) break;

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
      _blockContent: string
    ) => {
      const normalizedLang = lang.toLowerCase();
      const parsedArgs = parseHeaderArgs(headerArgs);
      context.codeBlocks.push({
        original: _match,
        lang: normalizedLang || '',
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
      const blockIndex = parseInt(index, 10);
      const block = context.codeBlocks[blockIndex];
      if (!block) return '';

      const { original, lang } = block;

      if (lang === 'text') {
        // For text blocks, extract content between begin and end markers (case-insensitive)
        const beginMatch = original.match(/#\+begin_src\s+text\n/i);
        const endMatch = original.match(/\n?#\+end_src\s*$/i);

        if (beginMatch && endMatch && beginMatch.index !== undefined) {
          const contentStart = beginMatch.index + beginMatch[0].length;
          const contentEnd = endMatch.index || original.length;
          const content = original.substring(contentStart, contentEnd);
          const trimmedContent = dedent(
            content.replace(/^\n+/, '').replace(/\n+$/, '')
          );
          return `\`\`\`text\n${trimmedContent}\n\`\`\``;
        }
        return original;
      } else if (lang === 'org') {
        // For org blocks, extract content and put in text code block without processing inner blocks
        const beginMatch = original.match(/#\+begin_src\s+org\n/i);
        const endMatch = original.match(/\n?#\+end_src\s*$/i);

        if (beginMatch && endMatch && beginMatch.index !== undefined) {
          const contentStart = beginMatch.index + beginMatch[0].length;
          const contentEnd = endMatch.index || original.length;
          const content = original.substring(contentStart, contentEnd);
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
            const normalizedLang = (blockLang || '').toLowerCase();
            const language =
              normalizedLang === 'math' ? 'latex' : normalizedLang;
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
