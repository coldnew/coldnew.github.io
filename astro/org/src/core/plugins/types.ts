import type { AstNode, CheckboxItem, PluginContext } from '../types';

/**
 * Plugin function signature
 */
export type PluginFunction = (tree: AstNode, context: PluginContext) => void;

/**
 * Plugin registry interface
 */
export interface PluginRegistry {
  [key: string]: PluginFunction;
}

/**
 * Checkbox processing utilities
 */
export interface CheckboxProcessor {
  extractCheckboxes: (orgContent: string) => CheckboxItem[];
  restoreCheckboxes: (orgContent: string, markdown: string) => string;
}

/**
 * Table processing utilities
 */
export interface TableProcessor {
  extractAlignments: (tree: AstNode, context: PluginContext) => void;
  applyAlignments: (tree: AstNode, context: PluginContext) => void;
}

/**
 * Caption processing utilities
 */
export interface CaptionProcessor {
  extractCaptions: (tree: AstNode, context: PluginContext) => void;
  applyCaptions: (tree: AstNode, context: PluginContext) => void;
}

/**
 * Math processing utilities
 */
export interface MathProcessor {
  processMathElements: (tree: AstNode) => void;
}
