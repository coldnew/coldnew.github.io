/**
 * Configuration for frontmatter processing
 */

import type { KeywordProcessor } from './keyword-processors';

export interface FrontmatterConfig {
  // Known org-mode keywords that should always be processed as arrays
  arrayKeywords: Set<string>;

  // Keywords that should be skipped during processing
  skipKeywords: Set<string>;

  // Custom keyword processors
  customProcessors: KeywordProcessor[];

  // Whether to auto-detect plural keywords as arrays
  autoDetectPlurals: boolean;

  // Whether to auto-detect boolean values
  autoDetectBooleans: boolean;

  // Whether to auto-detect numeric values
  autoDetectNumbers: boolean;

  // Default values for required fields
  defaults: {
    title?: string;
    description?: string;
  };

  // Custom field mappings (org-key -> yaml-key)
  fieldMappings: Record<string, string>;
}

export const DEFAULT_FRONTMATTER_CONFIG: FrontmatterConfig = {
  arrayKeywords: new Set([
    'tags',
    'categories',
    'keywords',
    'authors',
    'filetags',
    'archives',
    'properties',
    'links',
    'select_tags',
    'exclude_tags',
    'export_select_tags',
    'export_exclude_tags',
  ]),
  skipKeywords: new Set([
    'options',
    'latex_header',
    'include',
    'startup',
    'language',
    'html_head',
    'html_head_extra',
    'latex_class',
    'latex_class_options',
    'latex_header_extra',
    'bind',
    'filevars',
    'property',
  ]),
  customProcessors: [],
  autoDetectPlurals: true,
  autoDetectBooleans: true,
  autoDetectNumbers: true,
  defaults: {
    title: 'Generated from Org-mode',
    description: 'Generated from Org-mode',
  },
  fieldMappings: {
    // Common org-mode to frontmatter mappings
    filetags: 'tags',
    email: 'author_email',
    archive: 'archived',
    num: 'numbering',
    toc: 'table_of_contents',
  },
};

/**
 * Create a new frontmatter config with custom options
 */
export function createFrontmatterConfig(
  overrides: Partial<FrontmatterConfig>
): FrontmatterConfig {
  return {
    ...DEFAULT_FRONTMATTER_CONFIG,
    ...overrides,
    arrayKeywords: new Set([
      ...DEFAULT_FRONTMATTER_CONFIG.arrayKeywords,
      ...(overrides.arrayKeywords || []),
    ]),
    skipKeywords: new Set([
      ...DEFAULT_FRONTMATTER_CONFIG.skipKeywords,
      ...(overrides.skipKeywords || []),
    ]),
    fieldMappings: {
      ...DEFAULT_FRONTMATTER_CONFIG.fieldMappings,
      ...(overrides.fieldMappings || {}),
    },
  };
}

/**
 * Get the effective frontmatter config from conversion options
 */
export function getFrontmatterConfig(options: any = {}): FrontmatterConfig {
  if (options.frontmatterConfig) {
    return options.frontmatterConfig;
  }

  // Apply any legacy options
  const legacyOverrides: Partial<FrontmatterConfig> = {};

  if (options.defaultTitle) {
    legacyOverrides.defaults = {
      ...DEFAULT_FRONTMATTER_CONFIG.defaults,
      title: options.defaultTitle,
    };
  }

  if (options.defaultDescription) {
    legacyOverrides.defaults = {
      ...(legacyOverrides.defaults || DEFAULT_FRONTMATTER_CONFIG.defaults),
      description: options.defaultDescription,
    };
  }

  return legacyOverrides.defaults
    ? createFrontmatterConfig(legacyOverrides)
    : DEFAULT_FRONTMATTER_CONFIG;
}
