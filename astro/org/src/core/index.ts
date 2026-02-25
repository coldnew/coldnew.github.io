/**
 * Org-Mode Library - Bidirectional Conversion between Org and MDX
 *
 * This library provides serialization (Org → MDX) and deserialization (MDX → Org)
 * capabilities for converting between Org-mode and MDX formats.
 */

// =============================================================================
// SERIALIZATION (Org → MDX)
// =============================================================================

/**
 * Convert Org-mode content to MDX format
 * @param orgContent - The Org-mode content to convert
 * @param filename - The filename (used for default title generation)
 * @param options - Conversion options
 * @returns Promise resolving to conversion result with frontmatter and markdown
 */
export { convertOrgToMdx } from './serialize';

// =============================================================================
// DESERIALIZATION (MDX → Org)
// =============================================================================

/**
 * Convert MDX content back to Org-mode format
 * @param mdxContent - The MDX content to convert
 * @param filename - The filename (currently unused)
 * @returns Promise resolving to conversion result with keywords and org content
 */
export { convertMdxToOrg } from './deserialize';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Core conversion types and interfaces
 */
export type {
  // AST and plugin types
  AstNode,
  CalloutBlock,
  CaptionInfo,
  // Other types
  CheckboxItem,
  // Block processing types
  CodeBlock,
  // Conversion options and results
  ConversionOptions,
  ConversionResult,
  ExampleBlock,
  ExportBlock,
  ExportHtmlBlock,
  HtmlBlock,
  JsxBlock,
  LatexBlock,
  OrgConversionResult,
  OrgKeywords,
  PluginContext,
  TableAlignmentInfo,
} from './types';

// =============================================================================
// TIME PARSING
// =============================================================================

/**
 * Time parsing utilities for org-mode timestamps and Hugo time formats
 */
export {
  formatAsOrgTimestamp,
  formatToISOString,
  type OrgTimestamp,
  type ParsedTimestamp,
  parseHugoTime,
  parseOrgTimestamp,
  parseTime,
} from './time';

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Keyword extraction and processing utilities
 */
export { extractOrgKeywords, getCalloutTypeFromOrgType } from './keywords';

/**
 * General utility functions
 */
export { generateDefaultTitle } from './utils';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Library constants and configuration
 */
export {
  CALLOUT_TYPE_MAP,
  DEFAULT_FRONTMATTER,
  FILE_EXTENSIONS,
  LANGUAGE_MAPPINGS,
  MARKERS,
  PATTERNS,
  SKIP_KEYWORDS,
} from './constants';

// =============================================================================
// PLUGINS
// =============================================================================

/**
 * Unified plugins for processing Org and MDX content
 */
export * from './plugins';
