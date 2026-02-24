import { describe, expect, it } from 'vitest';
import { LANGUAGE_MAPPINGS, MARKERS, PATTERNS } from './constants';

describe('MARKERS', () => {
  it('should have all required marker constants', () => {
    expect(MARKERS).toHaveProperty('CODE_BLOCK');
    expect(MARKERS).toHaveProperty('LATEX_BLOCK');
    expect(MARKERS).toHaveProperty('HTML_BLOCK');
    expect(MARKERS).toHaveProperty('JSX_BLOCK');
    expect(MARKERS).toHaveProperty('EXPORT_HTML_BLOCK');
    expect(MARKERS).toHaveProperty('EXPORT_BLOCK');
    expect(MARKERS).toHaveProperty('EXAMPLE_BLOCK');
    expect(MARKERS).toHaveProperty('CALLOUT_BLOCK');
  });

  it('should have unique marker values', () => {
    const values = Object.values(MARKERS);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  it('should have marker values as strings', () => {
    Object.values(MARKERS).forEach((marker) => {
      expect(typeof marker).toBe('string');
      expect(marker.length).toBeGreaterThan(0);
    });
  });
});

describe('PATTERNS', () => {
  describe('CODE_BLOCK', () => {
    it('should match basic code blocks', () => {
      const pattern = PATTERNS.CODE_BLOCK;
      const content = `#+begin_src javascript
console.log("hello");
#+end_src`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[1]).toBe('javascript');
      expect(match[3].trim()).toContain('console.log("hello");');
    });

    it('should match code blocks without language', () => {
      const pattern = PATTERNS.CODE_BLOCK;
      const content = `#+begin_src
some code
#+end_src`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[1]).toBeUndefined();
      expect(match[3].trim()).toContain('some code');
    });

    it('should match code blocks with header args', () => {
      const pattern = PATTERNS.CODE_BLOCK;
      const content = `#+begin_src javascript :exports code
function test() {}
#+end_src`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[1]).toBe('javascript');
      expect(match[2]).toBe(' :exports code');
      expect(match[3].trim()).toContain('function test() {}');
    });

    it('should match code blocks without language', () => {
      const pattern = PATTERNS.CODE_BLOCK;
      const content = `#+begin_src
some code
#+end_src`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[1]).toBeUndefined();
      expect(match[3].trim()).toContain('some code');
    });

    it('should not match incomplete blocks', () => {
      const pattern = PATTERNS.CODE_BLOCK;
      const content = `#+begin_src javascript
incomplete block`;

      const match = content.match(pattern);
      expect(match).toBeNull();
    });
  });

  describe('CHECKBOX_ITEM', () => {
    it('should match checked checkboxes', () => {
      const pattern = PATTERNS.CHECKBOX_ITEM;
      const content = `- [X] Completed task`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[1]).toBe(''); // indent
      expect(match[2]).toBe('X'); // state
      expect(match[3]).toBe('Completed task'); // text
    });

    it('should match unchecked checkboxes', () => {
      const pattern = PATTERNS.CHECKBOX_ITEM;
      const content = `- [ ] Pending task`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[2]).toBe(' ');
      expect(match[3]).toBe('Pending task');
    });

    it('should match indeterminate checkboxes', () => {
      const pattern = PATTERNS.CHECKBOX_ITEM;
      const content = `- [-] Partial task`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[2]).toBe('-');
      expect(match[3]).toBe('Partial task');
    });

    it('should match indented checkboxes', () => {
      const pattern = PATTERNS.CHECKBOX_ITEM;
      const content = `  - [X] Indented task`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[1]).toBe('  ');
      expect(match[2]).toBe('X');
      expect(match[3]).toBe('Indented task');
    });

    it('should not match regular list items', () => {
      const pattern = PATTERNS.CHECKBOX_ITEM;
      const content = `- Regular item`;

      const match = content.match(pattern);
      expect(match).toBeNull();
    });
  });

  describe('EXPORT_HTML_BLOCK', () => {
    it('should match HTML export blocks', () => {
      const pattern = PATTERNS.EXPORT_HTML_BLOCK;
      const content = `#+begin_export html
<div>content</div>
#+end_export`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[2].trim()).toBe('<div>content</div>');
    });

    it('should match HTML export blocks with properties', () => {
      const pattern = PATTERNS.EXPORT_HTML_BLOCK;
      const content = `#+begin_export html :noexport:
<div>content</div>
#+end_export`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[1]).toBe(' :noexport:');
      expect(match[2].trim()).toBe('<div>content</div>');
    });
  });

  describe('EXPORT_BLOCK', () => {
    it('should match generic export blocks', () => {
      const pattern = PATTERNS.EXPORT_BLOCK;
      const content = `#+begin_export markdown
# Header
Content
#+end_export`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[1]).toBe('markdown');
      expect(match[3].trim()).toBe('# Header\nContent');
    });

    it('should match export blocks with properties', () => {
      const pattern = PATTERNS.EXPORT_BLOCK;
      const content = `#+begin_export jsx :noexport:
<div>JSX</div>
#+end_export`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[1]).toBe('jsx');
      expect(match[2]).toBe(' :noexport:');
      expect(match[3].trim()).toBe('<div>JSX</div>');
    });
  });

  describe('LATEX_BLOCK', () => {
    it('should match LaTeX blocks', () => {
      const pattern = PATTERNS.LATEX_BLOCK;
      const content = `#+begin_latex
\\begin{equation}
E = mc^2
\\end{equation}
#+end_latex`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[1].trim()).toBe(
        '\\begin{equation}\nE = mc^2\n\\end{equation}'
      );
    });
  });

  describe('HTML_BLOCK', () => {
    it('should match HTML blocks', () => {
      const pattern = PATTERNS.HTML_BLOCK;
      const content = `#+HTML: <div class="alert">Warning</div>`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[1]).toBe('<div class="alert">Warning</div>');
    });
  });

  describe('JSX_BLOCK', () => {
    it('should match JSX blocks', () => {
      const pattern = PATTERNS.JSX_BLOCK;
      const content = `#+JSX: <div className="component">JSX</div>`;

      const matches = [...content.matchAll(pattern)];
      expect(matches).toHaveLength(1);
      const match = matches[0];
      expect(match[1]).toBe('<div className="component">JSX</div>');
    });
  });
});

describe('LANGUAGE_MAPPINGS', () => {
  it('should have language mappings as an object', () => {
    expect(typeof LANGUAGE_MAPPINGS).toBe('object');
    expect(LANGUAGE_MAPPINGS).not.toBeNull();
  });

  it('should contain common language mappings', () => {
    // This test assumes some common mappings exist
    // The actual mappings may vary based on implementation
    expect(Object.keys(LANGUAGE_MAPPINGS).length).toBeGreaterThan(0);
  });

  it('should have string keys and values', () => {
    Object.entries(LANGUAGE_MAPPINGS).forEach(([key, value]) => {
      expect(typeof key).toBe('string');
      expect(typeof value).toBe('string');
      expect(key.length).toBeGreaterThan(0);
      expect(value.length).toBeGreaterThan(0);
    });
  });
});
