import { visit } from 'unist-util-visit';
import { PATTERNS } from '../constants';
import type { AstNode, CheckboxItem, PluginContext } from '../types';

/**
 * Plugin to handle Org checkboxes in list items
 */
export function orgCheckboxes(_context: PluginContext) {
  return (tree: AstNode) => {
    visit(tree, 'listItem', (node: AstNode) => {
      if ((node as any).checkbox) {
        // Add checkbox marker to the beginning of the content
        let checkboxMarker = '';
        switch ((node as any).checkbox) {
          case 'checked':
            checkboxMarker = '[x] ';
            break;
          case 'unchecked':
            checkboxMarker = '[ ] ';
            break;
          case 'indeterminate':
            checkboxMarker = '[-] ';
            break;
        }

        if (checkboxMarker && node.children && node.children[0]) {
          // Find the first paragraph in the list item
          const firstChild = node.children[0];
          if (
            firstChild.type === 'paragraph' &&
            firstChild.children &&
            firstChild.children[0]
          ) {
            // Prepend checkbox marker to the first text node
            const firstTextNode = firstChild.children[0];
            if (firstTextNode.type === 'text') {
              firstTextNode.value =
                checkboxMarker + (firstTextNode.value || '');
            }
          }
        }
      }
    });
  };
}

/**
 * Extract checkbox items from org content
 */
export function extractCheckboxes(orgContent: string): CheckboxItem[] {
  const checkboxes: CheckboxItem[] = [];
  let match: RegExpExecArray | null;

  match = PATTERNS.CHECKBOX_ITEM.exec(orgContent);
  while (match !== null) {
    checkboxes.push({
      indent: match[1] || '',
      state: match[2],
      text: match[3],
    });
    match = PATTERNS.CHECKBOX_ITEM.exec(orgContent);
  }

  return checkboxes;
}

/**
 * Restore checkboxes in markdown by parsing the original org content
 */
export function restoreCheckboxes(
  orgContent: string,
  markdown: string
): string {
  const checkboxes = extractCheckboxes(orgContent);

  if (checkboxes.length === 0) {
    return markdown;
  }

  // Replace corresponding list items in markdown
  let result = markdown;
  for (const checkbox of checkboxes) {
    const checkboxMarker =
      checkbox.state === 'X' ? '[x]' : checkbox.state === ' ' ? '[ ]' : '[-]';

    // Find and replace the corresponding markdown list item
    // The markdown has different indentation, so we need to find by text content
    const lines = result.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match lines that contain the text and start with * (possibly with indentation)
      if (
        line.includes(checkbox.text) &&
        /^\s*\* /.test(line) &&
        !line.includes('[x]') &&
        !line.includes('[ ]') &&
        !line.includes('[-]')
      ) {
        // Replace the line with checkbox marker
        const indent = line.match(/^(\s*)/)?.[1] || '';
        lines[i] = `${indent}* ${checkboxMarker} ${checkbox.text}`;
        break;
      }
    }
    result = lines.join('\n');
  }

  return result;
}
