import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { formatAsOrgTimestamp } from './time';
import type { OrgConversionResult } from './types';

/**
 * Convert MDX content to Org-mode with keywords
 *
 * This function deserializes MDX format back into Org-mode syntax,
 * extracting frontmatter into Org keywords and converting the content
 * through a unified AST pipeline.
 */
export async function convertMdxToOrg(
  mdxContent: string,
  _filename: string
): Promise<OrgConversionResult> {
  // Extract frontmatter
  const { data: frontmatter, content: mdxWithoutFrontmatter } =
    matter(mdxContent);

  // Convert frontmatter to Org keywords
  const keywords = Object.entries(frontmatter)
    .map(([key, value]) => {
      let formattedValue = value;
      // If value is a Date object or ISO string, format as org timestamp
      if (value instanceof Date) {
        formattedValue = formatAsOrgTimestamp(value);
      } else if (
        typeof value === 'string' &&
        /^\d{4}-\d{2}-\d{2}/.test(value)
      ) {
        // Check if it's an ISO date string
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          formattedValue = formatAsOrgTimestamp(date);
        }
      }
      return `#+${key.toUpperCase()}: ${formattedValue}`;
    })
    .join('\n');

  // Parse MDX
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMdx);

  const tree = processor.parse(`${mdxWithoutFrontmatter}\n`);

  // Convert AST to Org
  const orgContent = astToOrg(tree);

  return {
    keywords: keywords ? `${keywords}\n\n` : '',
    org: orgContent,
  };
}

/**
 * Convert MDX AST to Org syntax
 */
function astToOrg(node: any, depth = 0): string {
  switch (node.type) {
    case 'root':
      return node.children.map((child: any) => astToOrg(child, depth)).join('');
    case 'heading':
      return (
        '*'.repeat(node.depth) +
        ' ' +
        node.children.map((child: any) => astToOrg(child, depth)).join('') +
        '\n\n'
      );
    case 'paragraph':
      return (
        node.children.map((child: any) => astToOrg(child, depth)).join('') +
        '\n\n'
      );
    case 'text':
      return node.value;
    case 'list':
      return (
        node.children.map((child: any) => astToOrg(child, depth)).join('') +
        '\n'
      );
    case 'listItem': {
      const indent = '  '.repeat(depth);
      return (
        indent +
        '- ' +
        node.children
          .map((child: any) =>
            astToOrg(child, child.type === 'list' ? depth + 1 : depth).trimEnd()
          )
          .join('') +
        '\n'
      );
    }
    case 'code':
      if (node.lang) {
        return `#+begin_src ${node.lang}\n${node.value}\n#+end_src\n\n`;
      } else {
        return `#+begin_example\n${node.value}\n#+end_example\n\n`;
      }
    case 'inlineCode':
      return `=${node.value}=`;
    case 'link':
      return `[[${node.url}][${node.children.map(astToOrg).join('')}]]`;
    case 'strong':
      return `*${node.children.map(astToOrg).join('')}*`;
    case 'emphasis':
      return `/${node.children.map(astToOrg).join('')}/`;
    case 'mdxJsxFlowElement': {
      // Handle include tags
      const jsxStringFlow = mdxJsxToString(node);
      if (jsxStringFlow.includes('<include>')) {
        const start = jsxStringFlow.indexOf('<include>');
        const end = jsxStringFlow.indexOf('</include>', start);
        if (start !== -1 && end !== -1) {
          const fileName = jsxStringFlow.slice(start + 9, end);
          // Convert back to .org extension
          const orgFile = fileName.replace('.shared.org.mdx', '.org');
          return `#+INCLUDE: "${orgFile}"\n`;
        }
      }
      return `#+begin_export jsx\n${jsxStringFlow}\n#+end_export\n\n`;
    }
    case 'mdxJsxTextElement': {
      // Handle include tags
      const jsxStringText = mdxJsxToString(node);
      if (jsxStringText.includes('<include>')) {
        const start = jsxStringText.indexOf('<include>');
        const end = jsxStringText.indexOf('</include>', start);
        if (start !== -1 && end !== -1) {
          const fileName = jsxStringText.slice(start + 9, end);
          // Convert back to .org extension
          const orgFile = fileName.replace('.shared.org.mdx', '.org');
          return `#+INCLUDE: "${orgFile}"`;
        }
      }
      return `#+begin_export jsx\n${mdxJsxToString(node)}\n#+end_export`;
    }
    case 'blockquote':
      return (
        node.children.map((child: any) => astToOrg(child).trimEnd()).join('') +
        '\n\n'
      );
    case 'thematicBreak':
      return '-----\n\n';
    case 'table': {
      const rows = node.children.map(
        (row: any) =>
          '| ' +
          row.children
            .map((cell: any) => cell.children.map(astToOrg).join(''))
            .join(' | ') +
          ' |\n'
      );
      // Add separator row after header
      if (rows.length > 0) {
        const headerRow = node.children[0];
        const separatorParts = headerRow.children.map((cell: any) => {
          const content = cell.children.map(astToOrg).join('');
          return '-'.repeat(content.length + 2); // +2 for spaces around content
        });
        const separator = `|${separatorParts.join('|')}|\n`;
        rows.splice(1, 0, separator);
      }
      return `${rows.join('')}\n`;
    }
    default:
      return '';
  }
}

/**
 * Convert JSX element to string representation
 */
function mdxJsxToString(node: any): string {
  const { name, attributes, children } = node;
  const attrs = attributes
    .map((attr: any) => {
      if (attr.type === 'mdxJsxAttribute') {
        if (attr.value === true) return attr.name;
        if (attr.value === false || attr.value === null) return '';
        return `${attr.name}="${attr.value}"`;
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');

  const childrenStr = children.map(astToOrg).join('');

  if (children.length === 0) {
    return `<${name}${attrs ? ` ${attrs}` : ''} />`;
  }

  return `<${name}${attrs ? ` ${attrs}` : ''}>${childrenStr}</${name}>`;
}
