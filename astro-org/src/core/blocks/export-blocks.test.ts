import { describe, expect, it } from 'vitest';
import {
  processExportBlocks,
  processExportHtmlBlocks,
  restoreExportBlocks,
  restoreExportHtmlBlocks,
} from './export-blocks';
import { createBlockContext, createTestBlockContext } from './types';

describe('processExportHtmlBlocks', () => {
  it('should process HTML export blocks', () => {
    const content = `#+begin_export html
<div class="test">content</div>
#+end_export`;

    const context = createBlockContext();

    const result = processExportHtmlBlocks(content, context);

    expect(result).toBe('EXPORTHTMLMARKER0');
    expect(context.exportHtmlBlocks).toHaveLength(1);
    expect(context.exportHtmlBlocks[0]).toEqual({
      html: '<div class="test">content</div>',
      index: 0,
    });
  });

  it('should skip blocks with :noexport: property', () => {
    const content = `#+begin_export html :noexport:
<div class="test">content</div>
#+end_export`;

    const context = createBlockContext();

    const result = processExportHtmlBlocks(content, context);

    expect(result).toBe('');
    expect(context.exportHtmlBlocks).toHaveLength(0);
  });

  it('should handle multiple HTML export blocks', () => {
    const content = `#+begin_export html
<div>first</div>
#+end_export

#+begin_export html
<div>second</div>
#+end_export`;

    const context = createBlockContext();

    const result = processExportHtmlBlocks(content, context);

    expect(result).toBe(`EXPORTHTMLMARKER0

EXPORTHTMLMARKER1`);
    expect(context.exportHtmlBlocks).toHaveLength(2);
  });

  it('should trim content', () => {
    const content = `#+begin_export html

<div>content</div>

#+end_export`;

    const context = createBlockContext();

    processExportHtmlBlocks(content, context);

    expect(context.exportHtmlBlocks[0].html).toBe('<div>content</div>');
  });
});

describe('processExportBlocks', () => {
  it('should process generic export blocks', () => {
    const content = `#+begin_export markdown
# Header
Some content
#+end_export`;

    const context = createBlockContext();

    const result = processExportBlocks(content, context);

    expect(result).toBe('EXPORTBLOCKMARKER0');
    expect(context.exportBlocks).toHaveLength(1);
    expect(context.exportBlocks[0]).toEqual({
      content: '# Header\nSome content',
      type: 'markdown',
      index: 0,
    });
  });

  it('should skip HTML type blocks', () => {
    const content = `#+begin_export html
<div>content</div>
#+end_export`;

    const context = createBlockContext();

    const result = processExportBlocks(content, context);

    expect(result).toBe(content); // Should return original content unchanged
    expect(context.exportBlocks).toHaveLength(0);
  });

  it('should skip blocks with :noexport: property', () => {
    const content = `#+begin_export markdown :noexport:
# Header
#+end_export`;

    const context = createBlockContext();

    const result = processExportBlocks(content, context);

    expect(result).toBe('');
    expect(context.exportBlocks).toHaveLength(0);
  });

  it('should handle JSX export blocks', () => {
    const content = `#+begin_export jsx
<div>JSX content</div>
#+end_export`;

    const context = createBlockContext();

    const result = processExportBlocks(content, context);

    expect(result).toBe('EXPORTBLOCKMARKER0');
    expect(context.exportBlocks[0]).toEqual({
      content: '<div>JSX content</div>',
      type: 'jsx',
      index: 0,
    });
  });

  it('should trim content', () => {
    const content = `#+begin_export markdown

# Header

#+end_export`;

    const context = createBlockContext();

    processExportBlocks(content, context);

    expect(context.exportBlocks[0].content).toBe('# Header');
  });
});

describe('restoreExportHtmlBlocks', () => {
  it('should restore HTML export blocks', () => {
    const context = createTestBlockContext({
      exportHtmlBlocks: [
        {
          html: '<div class="test">content</div>',
          index: 0,
        },
      ],
    });

    const markdown = 'EXPORTHTMLMARKER0';
    const result = restoreExportHtmlBlocks(markdown, context);

    expect(result).toBe('<div className="test">content</div>');
  });

  it('should handle multiple markers', () => {
    const context = createTestBlockContext({
      exportHtmlBlocks: [
        { html: '<div>first</div>', index: 0 },
        { html: '<div>second</div>', index: 1 },
      ],
    });

    const markdown = `EXPORTHTMLMARKER0

EXPORTHTMLMARKER1`;
    const result = restoreExportHtmlBlocks(markdown, context);

    expect(result).toBe(`<div>first</div>

<div>second</div>`);
  });

  it('should return empty string for invalid markers', () => {
    const context = createBlockContext();

    const markdown = 'EXPORTHTMLMARKER0';
    const result = restoreExportHtmlBlocks(markdown, context);

    expect(result).toBe('');
  });
});

describe('restoreExportBlocks', () => {
  it('should restore generic export blocks', () => {
    const context = createTestBlockContext({
      exportBlocks: [
        {
          content: '# Header\nSome content',
          type: 'markdown',
          index: 0,
        },
      ],
    });

    const markdown = 'EXPORTBLOCKMARKER0';
    const result = restoreExportBlocks(markdown, context);

    expect(result).toBe('# Header\nSome content');
  });

  it('should handle multiple markers', () => {
    const context = createTestBlockContext({
      exportBlocks: [
        { content: 'JSX content', type: 'jsx', index: 0 },
        { content: 'Markdown content', type: 'markdown', index: 1 },
      ],
    });

    const markdown = `EXPORTBLOCKMARKER0

EXPORTBLOCKMARKER1`;
    const result = restoreExportBlocks(markdown, context);

    expect(result).toBe(`JSX content

Markdown content`);
  });

  it('should return empty string for invalid markers', () => {
    const context = createBlockContext();

    const markdown = 'EXPORTBLOCKMARKER0';
    const result = restoreExportBlocks(markdown, context);

    expect(result).toBe('');
  });
});
