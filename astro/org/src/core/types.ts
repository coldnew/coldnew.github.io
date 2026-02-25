export interface OrgKeywords {
  title?: string;
  author?: string;
  email?: string;
  date?: string;
  description?: string;
  [key: string]: string | undefined;
}

import type { FrontmatterConfig } from './frontmatter-config';

export interface ConversionOptions {
  defaultTitle?: string;
  defaultDescription?: string;
  basePath?: string; // Base path for resolving includes
  schema?: any; // Schema object (Zod or Standard Schema) for validation
  frontmatterConfig?: FrontmatterConfig; // Configuration for frontmatter processing
}

export interface ConversionResult {
  frontmatter: string;
  markdown: string;
}

export interface OrgConversionResult {
  keywords: string;
  org: string;
}

// AST Node types for better type safety
export interface AstNode {
  type: string;
  children?: AstNode[];
  value?: string;
  properties?: Record<string, any>;
  affiliated?: Record<string, any>;
  checkbox?: string;
  rowType?: string;
  tagName?: string;
}

export interface ParagraphNode extends AstNode {
  type: 'paragraph';
  children: AstNode[];
}

export interface TextNode extends AstNode {
  type: 'text';
  value: string;
}

export interface LinkNode extends AstNode {
  type: 'link';
  children: AstNode[];
}

export interface ListItemNode extends AstNode {
  type: 'listItem';
  children: AstNode[];
  checkbox?: 'checked' | 'unchecked' | 'indeterminate';
}

export interface TableNode extends AstNode {
  type: 'table';
  children: AstNode[];
}

export interface ElementNode extends AstNode {
  type: 'element';
  tagName: string;
  properties?: Record<string, any>;
  children: AstNode[];
}

// Plugin context types
export interface PluginContext {
  tableAlignments: Array<{ index: number; alignments: (string | null)[] }>;
  captions: Array<{ index: number; caption: string }>;
  checkboxes: Array<{ index: number; checked: boolean }>;
}

/**
 * Create a plugin context with all arrays initialized
 */
export function createPluginContext(): PluginContext {
  return {
    tableAlignments: [],
    captions: [],
    checkboxes: [],
  };
}

// Block processing types
export interface CodeBlock {
  original: string;
  lang: string;
  tangle?: string;
  exports?: string;
}

export interface LatexBlock {
  content: string;
  index: number;
}

export interface HtmlBlock {
  html: string;
  index: number;
}

export interface JsxBlock {
  jsx: string;
  index: number;
}

export interface ExportHtmlBlock {
  html: string;
  index: number;
}

export interface ExportBlock {
  content: string;
  type: string;
  index: number;
}

export interface CalloutBlock {
  type: string;
  content: string;
  index: number;
}

export interface ExampleBlock {
  content: string;
}

export interface IncludeBlock {
  file: string;
  index: number;
}

// Checkbox types
export interface CheckboxItem {
  indent: string;
  state: string;
  text: string;
}

// Table alignment types
export interface TableAlignmentInfo {
  index: number;
  alignments: (string | null)[];
}

// Caption types
export interface CaptionInfo {
  index: number;
  caption: string;
}
