import fs from 'node:fs';
import path from 'node:path';
import rehype2remark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import parse from 'uniorg-parse';
import uniorg2rehype from 'uniorg-rehype';
import { visit } from 'unist-util-visit';
import { processBlocks, restoreBlocks } from './blocks';
import { createBlockContext } from './blocks/types';
import {
  extractOrgKeywords,
  getCalloutTypeFromOrgType,
  processKeywords,
} from './keywords';
import {
  orgCaptions,
  orgCheckboxes,
  orgTableAlignment,
  rehypeCaptionsAndTableAlignment,
  restoreCheckboxes,
} from './plugins';
import type { ConversionOptions, ConversionResult } from './types';
import { createPluginContext } from './types';
import { generateDefaultTitle } from './utils';

/**
 * Simple YAML frontmatter parser (no external dependencies)
 * Parses ---frontmatter--- style YAML at the start of the content
 */
function parseFrontmatter(content: string): {
  content: string;
  data: Record<string, any>;
} {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { content, data: {} };
  }

  const frontmatterContent = match[1];
  const result: Record<string, any> = {};

  // Simple YAML parser for basic key-value pairs
  const lines = frontmatterContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();

    // Handle different value types
    if (value === '' || value === 'true' || value === 'false') {
      result[key] = value === 'true';
    } else if (value.startsWith('"') && value.endsWith('"')) {
      result[key] = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      result[key] = value.slice(1, -1);
    } else if (!Number.isNaN(Number(value))) {
      result[key] = Number(value);
    } else {
      result[key] = value;
    }
  }

  return {
    content: content.slice(match[0].length),
    data: result,
  };
}

/**
 * Simple YAML stringifier (no external dependencies)
 */
function stringifyFrontmatter(data: Record<string, any>): string {
  const lines = ['---'];

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;

    if (value instanceof Date) {
      lines.push(`${key}: ${value.toISOString()}`);
    } else if (typeof value === 'string') {
      if (value.includes('\n')) {
        lines.push(`${key}: |`);
        for (const line of value.split('\n')) {
          lines.push(`  ${line}`);
        }
      } else if (
        value.includes(':') ||
        value.includes('#') ||
        value.includes('"')
      ) {
        lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
      } else {
        lines.push(`${key}: ${value}`);
      }
    } else if (typeof value === 'boolean') {
      lines.push(`${key}: ${value}`);
    } else if (typeof value === 'number') {
      lines.push(`${key}: ${value}`);
    } else if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        if (typeof item === 'string') {
          if (item.includes(':') || item.includes('#') || item.includes('"')) {
            lines.push(`  - "${item.replace(/"/g, '\\"')}"`);
          } else {
            lines.push(`  - ${item}`);
          }
        } else {
          lines.push(`  - ${JSON.stringify(item)}`);
        }
      }
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }

  lines.push('---\n');
  return lines.join('\n');
}

/**
 * Plugin to convert figure elements to HTML strings
 */
function convertFiguresToHtml() {
  return (tree: any) => {
    visit(tree, 'element', (element: any, index?: number, parent?: any) => {
      if (element.tagName === 'figure' && index !== undefined && parent) {
        const img = element.children[0];
        const figcaption = element.children[1];
        const imgSrc = img.properties.src || '';
        const imgAlt = img.properties.alt || '';
        const imgHtml = `<img src="${imgSrc}" alt="${imgAlt}" />`;
        const figcaptionText = figcaption.children[0].value;
        const figcaptionHtml = `<figcaption>${figcaptionText}</figcaption>`;
        const html = `<figure>${imgHtml}${figcaptionHtml}</figure>`;
        const htmlNode = {
          type: 'html',
          value: html,
        };
        parent.children[index] = htmlNode;
      }
    });
  };
}

/**
 * Extract and process #INCLUDE directives
 */
async function processIncludes(
  orgContent: string,
  basePath: string,
  processedFiles: Set<string> = new Set()
): Promise<string> {
  const lines = orgContent.split(/\r?\n/);
  const processedLines: string[] = [];
  const includePattern = /^#\+INCLUDE:\s*"([^"]+)"/;

  for (const line of lines) {
    const match = line.match(includePattern);
    if (match) {
      const includeFile = match[1];
      const includePath = path.resolve(basePath, includeFile);

      // Prevent circular includes
      if (processedFiles.has(includePath)) {
        processedLines.push(
          `<!-- Circular include skipped: ${includeFile} -->`
        );
        continue;
      }

      if (fs.existsSync(includePath)) {
        const includeContent = fs.readFileSync(includePath, 'utf8');
        const includeBasePath = path.dirname(includePath);

        // Recursively process includes in the included file
        const processedIncludeContent = await processIncludes(
          includeContent,
          includeBasePath,
          new Set([...processedFiles, includePath])
        );

        // Include the processed content directly
        processedLines.push(processedIncludeContent);
      } else {
        processedLines.push(`<!-- Include file not found: ${includeFile} -->`);
      }
    } else {
      processedLines.push(line);
    }
  }

  return processedLines.join('\n');
}

/**
 * Simple synchronous YAML frontmatter parser (no fs dependency)
 * Parses ---frontmatter--- style YAML at the start of the content
 */
function _parseYamlFrontmatterSync(content: string): {
  content: string;
  data: Record<string, any>;
} {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { content, data: {} };
  }

  const frontmatterContent = match[1];
  const result: Record<string, any> = {};

  // Simple YAML parser for basic key-value pairs
  const lines = frontmatterContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();

    // Handle different value types
    if (value === '' || value === 'true' || value === 'false') {
      result[key] = value === 'true';
    } else if (value.startsWith('"') && value.endsWith('"')) {
      result[key] = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      result[key] = value.slice(1, -1);
    } else if (!Number.isNaN(Number(value))) {
      result[key] = Number(value);
    } else {
      result[key] = value;
    }
  }

  return {
    content: content.slice(match[0].length),
    data: result,
  };
}

/**
 * Convert Org-mode content to MDX synchronously (for Turbopack compatibility)
 *
 * This is a simplified synchronous version that skips async operations like file includes.
 */
export function convertOrgToMdxSync(
  orgContent: string,
  filename: string,
  options: ConversionOptions = {}
): ConversionResult {
  // Check for and strip YAML frontmatter (--- ... ---) using sync parser
  let yamlFrontmatter: Record<string, any> = {};
  if (orgContent.trim().startsWith('---')) {
    try {
      const parsed = parseFrontmatter(orgContent);
      orgContent = parsed.content;
      yamlFrontmatter = parsed.data;
    } catch (_error) {
      // If parsing fails, continue without frontmatter stripping
    }
  }

  // Extract keywords first
  const rawKeywords = extractOrgKeywords(orgContent);

  // Create processing context
  const processingContext = {
    filename,
    options,
    originalContent: orgContent,
  };

  // Process keywords using the new system
  let keywords = processKeywords(rawKeywords, processingContext);

  // Merge YAML frontmatter with extracted keywords (YAML takes precedence)
  keywords = { ...keywords, ...yamlFrontmatter };

  // Set defaults (only if not already set)
  if (!keywords.title) {
    keywords.title = options.defaultTitle || generateDefaultTitle(filename);
  }
  if (!keywords.description) {
    keywords.description =
      options.defaultDescription || 'Generated from Org-mode';
  }

  // Create block context for modular processing
  const blockContext = createBlockContext();

  // Process all blocks using the modular system
  orgContent = processBlocks(orgContent, blockContext);

  // Handle example blocks
  const exampleBlocks: Array<{ content: string }> = [];
  orgContent = orgContent.replace(
    /#\+begin_example\s*\n([\s\S]*?)#\+end_example/g,
    (_, content) => {
      exampleBlocks.push({ content });
      return `EXAMPLEBLOCKMARKER${exampleBlocks.length - 1}`;
    }
  );

  // Handle comment blocks
  orgContent = orgContent.replace(
    /#\+begin_comment\s*\n([\s\S]*?)#\+end_comment/g,
    () => {
      return '';
    }
  );

  // Extract callouts for separate processing
  const callouts: Array<{ type: string; content: string; index: number }> = [];
  let calloutIndex = 0;
  orgContent = orgContent.replace(
    /#\+begin_(\w+)\s*\n([\s\S]*?)#\+end_\1/g,
    (_, type: string, content: string) => {
      const calloutType = getCalloutTypeFromOrgType(type);
      if (calloutType) {
        callouts.push({
          type: calloutType,
          content: content.trim(),
          index: calloutIndex,
        });
        const placeholder = `CALLOUTMARKER${calloutIndex}`;
        calloutIndex++;
        return placeholder;
      }
      return _;
    }
  );

  // Convert using unified pipeline
  const processor = unified()
    .use(parse)
    .use(uniorg2rehype)
    .use(rehype2remark)
    .use(remarkGfm)
    .use(remarkStringify);

  const file = processor.processSync(orgContent);

  let markdown = String(file).trim();

  // Restore callouts
  for (const callout of callouts) {
    const calloutMarkdown = processor
      .processSync(callout.content)
      .toString()
      .trim();
    const marker = `CALLOUTMARKER${callout.index}`;
    markdown = markdown.replace(
      marker,
      `<Callout type="${callout.type}">\n${calloutMarkdown}\n</Callout>`
    );
  }

  // Restore all blocks using the modular system
  markdown = restoreBlocks(markdown, blockContext);

  // Restore example blocks
  markdown = markdown.replace(/EXAMPLEBLOCKMARKER(\d+)/g, (_, index) => {
    const block = exampleBlocks[parseInt(index, 10)];
    const trimmed = block.content.replace(/^\n+/, '').replace(/\n+$/, '');
    return `\`\`\`\n${trimmed}\n\`\`\``;
  });

  // Generate frontmatter using sync stringifier
  const frontmatter = stringifyFrontmatter(keywords);

  // Unescape HTML tags
  markdown = markdown.replace(/\\</g, '<').replace(/\\>/g, '>');

  return {
    frontmatter,
    markdown,
  };
}

/**
 * Convert Org-mode content to MDX with frontmatter
 *
 * This function serializes Org-mode syntax into MDX format,
 * extracting keywords into frontmatter and converting the content
 * through a unified AST pipeline.
 */
export async function convertOrgToMdx(
  orgContent: string,
  filename: string,
  options: ConversionOptions = {},
  processedFiles: Set<string> = new Set()
): Promise<ConversionResult> {
  const basePath = options.basePath || process.cwd();

  // Check for and strip YAML frontmatter (--- ... ---)
  let yamlFrontmatter: Record<string, any> = {};
  if (orgContent.trim().startsWith('---')) {
    try {
      const parsed = parseFrontmatter(orgContent);
      orgContent = parsed.content;
      yamlFrontmatter = parsed.data;
    } catch (_error) {
      // If parsing fails, continue without frontmatter stripping
    }
  }

  // Extract keywords first before modifying content
  const rawKeywords = extractOrgKeywords(orgContent);

  // Process includes
  orgContent = await processIncludes(orgContent, basePath, processedFiles);

  // Create processing context
  const processingContext = {
    filename,
    options,
    originalContent: orgContent,
  };

  // Process keywords using the new system
  let keywords = processKeywords(rawKeywords, processingContext);

  // Merge YAML frontmatter with extracted keywords (YAML takes precedence)
  keywords = { ...keywords, ...yamlFrontmatter };

  // Set defaults (only if not already set)
  if (!keywords.title) {
    keywords.title = options.defaultTitle || generateDefaultTitle(filename);
  }
  if (!keywords.description) {
    keywords.description =
      options.defaultDescription || 'Generated from Org-mode';
  }

  // Create block context for modular processing
  const blockContext = createBlockContext();

  // Create plugin context for modular plugins
  const pluginContext = createPluginContext();

  // Process all blocks using the modular system
  orgContent = processBlocks(orgContent, blockContext);

  // Handle example blocks (keeping separate for now)
  const exampleBlocks: Array<{ content: string }> = [];
  orgContent = orgContent.replace(
    /#\+begin_example\s*\n([\s\S]*?)#\+end_example/g,
    (_, content) => {
      exampleBlocks.push({ content });
      return `EXAMPLEBLOCKMARKER${exampleBlocks.length - 1}`;
    }
  );

  // Handle comment blocks
  orgContent = orgContent.replace(
    /#\+begin_comment\s*\n([\s\S]*?)#\+end_comment/g,
    () => {
      return '';
    }
  );

  // Extract callouts for separate processing
  const callouts: Array<{ type: string; content: string; index: number }> = [];
  let calloutIndex = 0;
  orgContent = orgContent.replace(
    /#\+begin_(\w+)\s*\n([\s\S]*?)#\+end_\1/g,
    (_, type: string, content: string) => {
      const calloutType = getCalloutTypeFromOrgType(type);
      if (calloutType) {
        callouts.push({
          type: calloutType,
          content: content.trim(),
          index: calloutIndex,
        });
        const placeholder = `CALLOUTMARKER${calloutIndex}`;
        calloutIndex++;
        return placeholder;
      }
      return _;
    }
  );

  // Convert using direct AST pipeline (inspired by org2mdx)
  const processor = unified()
    .use(parse)
    .use(orgCaptions, pluginContext)
    .use(orgCheckboxes, pluginContext)
    .use(orgTableAlignment, pluginContext)
    .use(uniorg2rehype)
    .use(rehypeCaptionsAndTableAlignment, pluginContext)
    .use(convertFiguresToHtml)
    .use(rehype2remark)
    .use(remarkGfm)
    .use(remarkStringify);

  const file = processor.processSync(orgContent);
  let markdown = String(file).trim();

  // Post-process markdown to restore checkboxes
  markdown = restoreCheckboxes(orgContent, markdown);

  // Process and restore callouts
  for (const callout of callouts) {
    // Process callout content separately
    const calloutMarkdown = processor
      .processSync(callout.content)
      .toString()
      .trim();
    // Replace marker with Callout component
    const marker = `CALLOUTMARKER${callout.index}`;
    markdown = markdown.replace(
      marker,
      `<Callout type="${callout.type}">\n${calloutMarkdown}\n</Callout>`
    );
  }

  // Restore all blocks using the modular system
  markdown = restoreBlocks(markdown, blockContext);

  // Restore example blocks
  markdown = markdown.replace(/EXAMPLEBLOCKMARKER(\d+)/g, (_, index) => {
    const block = exampleBlocks[parseInt(index, 10)];
    const trimmed = block.content.replace(/^\n+/, '').replace(/\n+$/, '');
    return `\`\`\`\n${trimmed}\n\`\`\``;
  });

  // Perform schema validation if provided
  if (options.schema) {
    try {
      // Try Zod-style validation first
      if (typeof options.schema.parse === 'function') {
        options.schema.parse(keywords);
      }
      // Try Standard Schema V1 validation
      else if (typeof options.schema['~standard'] === 'object') {
        const result = await options.schema['~standard'].validate(keywords);
        if (result.issues) {
          const errorMessages = result.issues
            .map(
              (issue: any) =>
                `${issue.path?.join('.') || 'field'}: ${issue.message}`
            )
            .join(', ');
          throw new Error(`Schema validation failed: ${errorMessages}`);
        }
      } else {
        console.warn('[ORG] Unknown schema type provided');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Schema validation failed for ${filename}: ${error.message}`
        );
      }
      throw new Error(
        `Schema validation failed for ${filename}: Unknown error`
      );
    }
  }

  // Generate frontmatter
  const frontmatter = stringifyFrontmatter(keywords);

  // Unescape HTML tags in html nodes
  markdown = markdown.replace(/\\</g, '<').replace(/\\>/g, '>');

  return {
    frontmatter,
    markdown,
  };
}
