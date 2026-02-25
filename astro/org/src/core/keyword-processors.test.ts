import { beforeEach, describe, expect, it } from 'vitest';
import { createFrontmatterConfig } from './frontmatter-config';
import {
  ARRAY_PROCESSOR,
  BOOLEAN_PROCESSOR,
  clearCustomProcessors,
  DATE_PROCESSOR,
  getAllProcessors,
  NUMBER_PROCESSOR,
  PLURAL_PROCESSOR,
  registerKeywordProcessor,
} from './keyword-processors';
import { processKeywords } from './keywords';

describe('keyword-processors', () => {
  beforeEach(() => {
    clearCustomProcessors();
  });

  describe('DATE_PROCESSOR', () => {
    it('should process date keywords', () => {
      const context = {
        filename: 'test.org',
        options: {},
        originalContent: '',
      };
      const result = DATE_PROCESSOR.process('2024-01-15', 'date', context);
      expect(result).toBe('2024-01-15T00:00:00.000Z');
    });

    it('should return original value if date parsing fails', () => {
      const context = {
        filename: 'test.org',
        options: {},
        originalContent: '',
      };
      const result = DATE_PROCESSOR.process('invalid-date', 'date', context);
      expect(result).toBe('invalid-date');
    });

    it('should only process date keywords', () => {
      expect(DATE_PROCESSOR.shouldProcess?.('date', '2024-01-15')).toBe(true);
      expect(DATE_PROCESSOR.shouldProcess?.('title', 'Test')).toBe(false);
    });
  });

  describe('PLURAL_PROCESSOR', () => {
    it('should convert plural keywords with multiple values to arrays', () => {
      const context = {
        filename: 'test.org',
        options: {},
        originalContent: '',
      };
      const result = PLURAL_PROCESSOR.process(
        'item1, item2, item3',
        'tags',
        context
      );
      expect(result).toEqual(['item1', 'item2', 'item3']);
    });

    it('should return single value for single item', () => {
      const context = {
        filename: 'test.org',
        options: {},
        originalContent: '',
      };
      const result = PLURAL_PROCESSOR.process('singletag', 'tags', context);
      expect(result).toBe('singletag');
    });

    it('should handle various delimiters', () => {
      const context = {
        filename: 'test.org',
        options: {},
        originalContent: '',
      };
      const result = PLURAL_PROCESSOR.process(
        'item1; item2,item3',
        'tags',
        context
      );
      expect(result).toEqual(['item1', 'item2', 'item3']);
    });

    it('should filter out empty items', () => {
      const context = {
        filename: 'test.org',
        options: {},
        originalContent: '',
      };
      const result = PLURAL_PROCESSOR.process(
        'item1; ; item2; ',
        'tags',
        context
      );
      expect(result).toEqual(['item1', 'item2']);
    });

    it('should only process plural keywords', () => {
      expect(PLURAL_PROCESSOR.shouldProcess?.('tags', 'item1,item2')).toBe(
        true
      );
      expect(PLURAL_PROCESSOR.shouldProcess?.('categories', 'cat1,cat2')).toBe(
        true
      );
      expect(PLURAL_PROCESSOR.shouldProcess?.('title', 'Test')).toBe(false);
      expect(PLURAL_PROCESSOR.shouldProcess?.('class', 'test')).toBe(false); // Exception
    });
  });

  describe('ARRAY_PROCESSOR', () => {
    it('should process known array keywords', () => {
      expect(ARRAY_PROCESSOR.shouldProcess?.('tags', 'item1,item2')).toBe(true);
      expect(ARRAY_PROCESSOR.shouldProcess?.('categories', 'cat1;cat2')).toBe(
        true
      );
      expect(ARRAY_PROCESSOR.shouldProcess?.('filetags', 'tag1')).toBe(true);
    });

    it('should process keywords ending with tags', () => {
      expect(ARRAY_PROCESSOR.shouldProcess?.('mytags', 'tag1,tag2')).toBe(true);
      expect(ARRAY_PROCESSOR.shouldProcess?.('mytags', 'singletag')).toBe(
        false
      );
    });

    it('should convert to array', () => {
      const context = {
        filename: 'test.org',
        options: {},
        originalContent: '',
      };
      const result = ARRAY_PROCESSOR.process(
        'item1,item2,item3',
        'tags',
        context
      );
      expect(result).toEqual(['item1', 'item2', 'item3']);
    });
  });

  describe('BOOLEAN_PROCESSOR', () => {
    it('should convert true-like values to boolean true', () => {
      const context = {
        filename: 'test.org',
        options: {},
        originalContent: '',
      };
      expect(BOOLEAN_PROCESSOR.process('true', 'draft', context)).toBe(true);
      expect(BOOLEAN_PROCESSOR.process('yes', 'draft', context)).toBe(true);
      expect(BOOLEAN_PROCESSOR.process('on', 'draft', context)).toBe(true);
      expect(BOOLEAN_PROCESSOR.process('t', 'draft', context)).toBe(true);
      expect(BOOLEAN_PROCESSOR.process('y', 'draft', context)).toBe(true);
    });

    it('should convert false-like values to boolean false', () => {
      const context = {
        filename: 'test.org',
        options: {},
        originalContent: '',
      };
      expect(BOOLEAN_PROCESSOR.process('false', 'draft', context)).toBe(false);
      expect(BOOLEAN_PROCESSOR.process('no', 'draft', context)).toBe(false);
      expect(BOOLEAN_PROCESSOR.process('off', 'draft', context)).toBe(false);
      expect(BOOLEAN_PROCESSOR.process('f', 'draft', context)).toBe(false);
      expect(BOOLEAN_PROCESSOR.process('n', 'draft', context)).toBe(false);
    });

    it('should return original value for non-boolean strings', () => {
      const context = {
        filename: 'test.org',
        options: {},
        originalContent: '',
      };
      expect(BOOLEAN_PROCESSOR.process('maybe', 'draft', context)).toBe(
        'maybe'
      );
      expect(BOOLEAN_PROCESSOR.process('123', 'draft', context)).toBe('123');
    });
  });

  describe('NUMBER_PROCESSOR', () => {
    it('should convert numeric strings to numbers', () => {
      const context = {
        filename: 'test.org',
        options: {},
        originalContent: '',
      };
      expect(NUMBER_PROCESSOR.process('42', 'priority', context)).toBe(42);
      expect(NUMBER_PROCESSOR.process('3.14', 'priority', context)).toBe(3.14);
      expect(NUMBER_PROCESSOR.process('-10', 'priority', context)).toBe(-10);
    });

    it('should return original value for non-numeric strings', () => {
      const context = {
        filename: 'test.org',
        options: {},
        originalContent: '',
      };
      expect(NUMBER_PROCESSOR.process('high', 'priority', context)).toBe(
        'high'
      );
      expect(NUMBER_PROCESSOR.process('abc123', 'priority', context)).toBe(
        'abc123'
      );
    });
  });

  describe('processor registry', () => {
    beforeEach(() => {
      clearCustomProcessors();
    });

    it('should register custom processors', () => {
      const customProcessor = {
        name: 'custom',
        priority: 999,
        process: () => 'custom-result',
        shouldProcess: () => true,
      };

      registerKeywordProcessor(customProcessor);
      const processors = getAllProcessors();
      expect(processors).toContain(customProcessor);
    });

    it('should sort processors by priority', () => {
      const lowPriorityProcessor = {
        name: 'low',
        priority: 1,
        process: () => 'low',
        shouldProcess: () => true,
      };

      const highPriorityProcessor = {
        name: 'high',
        priority: 999,
        process: () => 'high',
        shouldProcess: () => true,
      };

      registerKeywordProcessor(lowPriorityProcessor);
      registerKeywordProcessor(highPriorityProcessor);

      const processors = getAllProcessors();
      const highIndex = processors.indexOf(highPriorityProcessor);
      const lowIndex = processors.indexOf(lowPriorityProcessor);

      expect(highIndex).toBeLessThan(lowIndex);
    });
  });
});

describe('processKeywords integration', () => {
  beforeEach(() => {
    clearCustomProcessors();
  });

  it('should process complex keyword combinations', () => {
    const keywords = {
      title: 'Test Document',
      date: '2024-01-15',
      tags: 'emacs, org-mode, documentation',
      categories: 'tech; tutorial',
      draft: 'yes',
      priority: '1',
      custom_field: 'single value',
      filetags: 'important, work',
    };

    const context = {
      filename: 'test.org',
      options: {},
      originalContent: '',
    };

    const result = processKeywords(keywords, context);

    expect(result).toEqual({
      title: 'Test Document',
      date: '2024-01-15T00:00:00.000Z',
      tags: ['important', 'work'], // filetags mapped to tags, overwriting original tags
      categories: ['tech', 'tutorial'],
      draft: true,
      priority: 1,
      custom_field: 'single value',
    });
  });

  it('should apply field mappings', () => {
    const keywords = {
      title: 'Test',
      filetags: 'tag1, tag2',
      email: 'test@example.com',
    };

    const context = {
      filename: 'test.org',
      options: {
        frontmatterConfig: createFrontmatterConfig({
          fieldMappings: {
            filetags: 'tags',
            email: 'author_email',
          },
        }),
      },
      originalContent: '',
    };

    const result = processKeywords(keywords, context);

    expect(result).toEqual({
      title: 'Test',
      tags: ['tag1', 'tag2'],
      author_email: 'test@example.com',
    });
  });

  it('should skip keywords in skip list', () => {
    const keywords = {
      title: 'Test',
      options: 'some options',
      latex_header: 'header content',
      tags: 'tag1, tag2',
    };

    const context = {
      filename: 'test.org',
      options: {},
      originalContent: '',
    };

    const result = processKeywords(keywords, context);

    expect(result).toEqual({
      title: 'Test',
      tags: ['tag1', 'tag2'],
    });
    expect(result.options).toBeUndefined();
    expect(result.latex_header).toBeUndefined();
  });

  it('should handle undefined values', () => {
    const keywords = {
      title: 'Test',
      description: undefined as string | undefined,
      tags: 'tag1, tag2',
    };

    const context = {
      filename: 'test.org',
      options: {},
      originalContent: '',
    };

    const result = processKeywords(keywords, context);

    expect(result).toEqual({
      title: 'Test',
      tags: ['tag1', 'tag2'],
    });
  });

  it('should handle edge cases for plural keywords', () => {
    const keywords = {
      tags: 'single-tag',
      empty_tags: '',
      categories: '; ; ',
      weird_tags: 'item1;;item2; ; item3',
      class: 'should-not-process', // Exception word
    };

    const context = {
      filename: 'test.org',
      options: {},
      originalContent: '',
    };

    const result = processKeywords(keywords, context);

    expect(result).toEqual({
      tags: ['single-tag'], // plural processor converts to array
      empty_tags: undefined, // empty string filtered out
      categories: [],
      weird_tags: ['item1', 'item2', 'item3'],
      class: 'should-not-process',
    });
  });
});
