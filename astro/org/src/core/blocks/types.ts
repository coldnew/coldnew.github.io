import type {
  CalloutBlock,
  CodeBlock,
  ExampleBlock,
  ExportBlock,
  ExportHtmlBlock,
  HtmlBlock,
  JsxBlock,
  LatexBlock,
} from '../types';

/**
 * Block processing context
 */
export interface BlockContext {
  codeBlocks: CodeBlock[];
  latexBlocks: LatexBlock[];
  htmlBlocks: HtmlBlock[];
  jsxBlocks: JsxBlock[];
  exportHtmlBlocks: ExportHtmlBlock[];
  exportBlocks: ExportBlock[];
  calloutBlocks: CalloutBlock[];
  exampleBlocks: ExampleBlock[];
}

/**
 * Block processor interface
 */
export interface BlockProcessor {
  process: (content: string, context: BlockContext) => string;
  restore: (markdown: string, context: BlockContext) => string;
}

/**
 * Block registry interface
 */
export interface BlockRegistry {
  [key: string]: BlockProcessor;
}

/**
 * Create a block context with all arrays initialized
 */
export function createBlockContext(): BlockContext {
  return {
    codeBlocks: [],
    latexBlocks: [],
    htmlBlocks: [],
    jsxBlocks: [],
    exportHtmlBlocks: [],
    exportBlocks: [],
    calloutBlocks: [],
    exampleBlocks: [],
  };
}

/**
 * Create a test block context with optional updates
 */
export function createTestBlockContext(
  updates: Partial<BlockContext> = {}
): BlockContext {
  return { ...createBlockContext(), ...updates };
}
