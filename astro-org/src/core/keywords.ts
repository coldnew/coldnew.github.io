import { SKIP_KEYWORDS } from './constants';
import { getFrontmatterConfig } from './frontmatter-config';
import type { ProcessingContext } from './keyword-processors';
import { getAllProcessors } from './keyword-processors';
import type { OrgKeywords } from './types';

// Simple LRU cache for keyword extraction results
const keywordCache = new Map<string, OrgKeywords>();
const MAX_CACHE_SIZE = 50;

/**
 * Extract all Org-mode keywords from content
 */
export function extractOrgKeywords(content: string): OrgKeywords {
  // Check cache first for performance
  const cacheKey = getCacheKey(content);
  const cached = keywordCache.get(cacheKey);
  if (cached) {
    return { ...cached }; // Return copy to prevent external modification
  }

  const keywords: OrgKeywords = {};

  // Optimized approach: split into lines once, then process each line
  // This is more predictable and handles edge cases better than multiline regex
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    // Early exit for lines that don't start with #+
    if (!line.startsWith('#+')) continue;

    const match = line.match(/^#\+(\w+):\s*(.*)$/);
    if (match) {
      const key = match[1].toLowerCase();
      const value = match[2].trim();

      // Skip keywords that may cause issues
      if (!SKIP_KEYWORDS.has(key)) {
        keywords[key] = value;
      }
    }
  }

  // Cache the result
  if (keywordCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry (simple FIFO)
    const firstKey = keywordCache.keys().next().value;
    if (firstKey) {
      keywordCache.delete(firstKey);
    }
  }
  keywordCache.set(cacheKey, { ...keywords });

  return keywords;
}

/**
 * Generate a cache key for content (using content hash for large content)
 */
function getCacheKey(content: string): string {
  // For small content, use the content directly
  if (content.length < 1000) {
    return content;
  }

  // For large content, use a simple hash
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

/**
 * Process keywords using registered processors
 */
export function processKeywords(
  keywords: Record<string, string | undefined>,
  context: ProcessingContext
): Record<string, any> {
  const config = getFrontmatterConfig(context.options);
  const processed: Record<string, any> = {};

  // Apply field mappings and filter out undefined values
  for (const [key, value] of Object.entries(keywords)) {
    if (value === undefined) continue;

    let finalKey = key;
    const mappedKey = config.fieldMappings[key.toLowerCase()];
    if (mappedKey && mappedKey !== key) {
      finalKey = mappedKey;
    }

    processed[finalKey] = value;
  }

  // Process each keyword
  for (const [key, value] of Object.entries(processed)) {
    // Skip if in skip list
    if (config.skipKeywords.has(key.toLowerCase())) {
      delete processed[key];
      continue;
    }

    // Apply processors in priority order
    const processors = getAllProcessors();
    let processedValue = value;

    for (const processor of processors) {
      if (
        !processor.shouldProcess ||
        processor.shouldProcess(key, processedValue)
      ) {
        try {
          processedValue = processor.process(processedValue, key, context);
          break; // Use first matching processor
        } catch (error) {
          console.warn(
            `[ORG] Processor ${processor.name} failed for ${key}:`,
            error
          );
          // Keep original value if processing fails
        }
      }
    }

    processed[key] = processedValue;
  }

  return processed;
}

/**
 * Get callout type from org-mode callout type
 */
export function getCalloutTypeFromOrgType(orgType: string): string | null {
  const calloutMap: Record<string, string> = {
    warning: 'warning',
    error: 'error',
    info: 'info',
    note: 'note',
    tip: 'tip',
    caution: 'caution',
  };

  return calloutMap[orgType.toLowerCase()] || null;
}
