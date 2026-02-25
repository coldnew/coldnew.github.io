/**
 * Keyword processors for transforming org-mode keywords to frontmatter
 */

import { formatToISOString, parseTime } from './time';
import type { ConversionOptions } from './types';

export interface KeywordProcessor {
  name: string;
  priority: number;
  process: (value: string, key: string, context: ProcessingContext) => any;
  shouldProcess?: (key: string, value: string) => boolean;
}

export interface ProcessingContext {
  filename: string;
  options: ConversionOptions;
  originalContent: string;
}

/**
 * Date processor - converts org-mode dates to ISO format
 */
export const DATE_PROCESSOR: KeywordProcessor = {
  name: 'date',
  priority: 100,
  shouldProcess: (key) => key === 'date',
  process: (value) => {
    const parsedDate = parseTime(value);
    return parsedDate ? formatToISOString(parsedDate) : value;
  },
};

/**
 * Plural keyword processor - converts keywords ending with 's' to arrays
 */
export const PLURAL_PROCESSOR: KeywordProcessor = {
  name: 'plural',
  priority: 50,
  shouldProcess: (key) => {
    // Only process if key ends with 's' and is not a common singular word ending with 's'
    return (
      key.endsWith('s') &&
      key.length > 1 &&
      !['as', 'is', 'was', 'has', 'does', 'goes', 'class', 'pass'].includes(
        key.toLowerCase()
      )
    );
  },
  process: (value) => {
    // Split by common delimiters and clean up
    const items = value
      .split(/[,;\s]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    // Return as array if multiple items, otherwise return as single value
    return items.length > 1 ? items : items[0];
  },
};

/**
 * Array processor - handles known array-like keywords
 */
export const ARRAY_PROCESSOR: KeywordProcessor = {
  name: 'array',
  priority: 60,
  shouldProcess: (key, value) => {
    // Known array keywords from org-mode
    const arrayKeywords = [
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
    ];
    return (
      arrayKeywords.includes(key.toLowerCase()) ||
      (key.toLowerCase().endsWith('tags') &&
        (value.includes(';') || value.includes(',')))
    );
  },
  process: (value) => {
    return value
      .split(/[,;\s]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  },
};

/**
 * Boolean processor - converts string values to booleans
 */
export const BOOLEAN_PROCESSOR: KeywordProcessor = {
  name: 'boolean',
  priority: 70,
  shouldProcess: (key) => {
    const booleanKeywords = [
      'todo',
      'draft',
      'published',
      'archived',
      'private',
    ];
    return booleanKeywords.includes(key.toLowerCase());
  },
  process: (value) => {
    const lowerValue = value.toLowerCase().trim();
    if (['true', 'yes', 'on', 't', 'y'].includes(lowerValue)) return true;
    if (['false', 'no', 'off', 'f', 'n'].includes(lowerValue)) return false;
    return value; // Return original if not clearly boolean
  },
};

/**
 * Number processor - converts numeric strings to numbers
 */
export const NUMBER_PROCESSOR: KeywordProcessor = {
  name: 'number',
  priority: 80,
  shouldProcess: (key) => {
    const numberKeywords = ['priority', 'level', 'order', 'weight', 'score'];
    return numberKeywords.includes(key.toLowerCase());
  },
  process: (value) => {
    const num = Number(value.trim());
    return Number.isNaN(num) ? value : num;
  },
};

// Registry of built-in processors
export const BUILTIN_PROCESSORS: KeywordProcessor[] = [
  DATE_PROCESSOR,
  BOOLEAN_PROCESSOR,
  NUMBER_PROCESSOR,
  ARRAY_PROCESSOR,
  PLURAL_PROCESSOR,
];

// Runtime registry for custom processors
const customProcessors: KeywordProcessor[] = [];

/**
 * Register a custom keyword processor
 */
export function registerKeywordProcessor(processor: KeywordProcessor): void {
  customProcessors.push(processor);
}

/**
 * Get all processors (built-in + custom) sorted by priority
 */
export function getAllProcessors(): KeywordProcessor[] {
  return [...BUILTIN_PROCESSORS, ...customProcessors].sort(
    (a, b) => b.priority - a.priority
  );
}

/**
 * Clear all custom processors
 */
export function clearCustomProcessors(): void {
  customProcessors.length = 0;
}
