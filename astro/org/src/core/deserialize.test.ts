import { describe, expect, it } from 'vitest';
import { convertMdxToOrg } from './deserialize';

describe('deserialize (MDX → Org)', () => {
  it('should convert basic MDX to Org', async () => {
    const mdxContent = `# Hello World

This is a test paragraph.

- List item 1
- List item 2

\`\`\`javascript
console.log('hello');
\`\`\`

Some **bold** and *italic* text.`;

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe('');
    expect(result.org).toBe(`* Hello World

This is a test paragraph.

- List item 1
- List item 2

#+begin_src javascript
console.log('hello');
#+end_src

Some *bold* and /italic/ text.

`);
  });

  it('should convert headings', async () => {
    const mdxContent = `# Level 1
## Level 2
### Level 3

Content under headings.`;

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe('');
    expect(result.org).toBe(`* Level 1

** Level 2

*** Level 3

Content under headings.

`);
  });

  it('should convert lists', async () => {
    const mdxContent = `- Item 1
- Item 2
  - Nested item
- Item 3`;

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe('');
    expect(result.org).toBe(`- Item 1
- Item 2  - Nested item
- Item 3

`);
  });

  it('should convert code blocks', async () => {
    const mdxContent = `\`\`\`javascript
function test() {
  console.log('hello');
}
\`\`\``;

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe('');
    expect(result.org).toBe(`#+begin_src javascript
function test() {
  console.log('hello');
}
#+end_src

`);
  });

  it('should convert inline code', async () => {
    const mdxContent = `Some \`inline code\` in text.`;

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe('');
    expect(result.org).toBe('Some =inline code= in text.\n\n');
  });

  it('should convert links', async () => {
    const mdxContent = `[Example Link](https://example.com)`;

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe('');
    expect(result.org).toBe('[[https://example.com][Example Link]]\n\n');
  });

  it('should convert bold and italic', async () => {
    const mdxContent = `Some **bold** and *italic* text.`;

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe('');
    expect(result.org).toBe('Some *bold* and /italic/ text.\n\n');
  });

  it('should convert JSX to export blocks', async () => {
    const mdxContent = `<Button>Click me</Button>`;

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe('');
    expect(result.org).toBe(`#+begin_export jsx
<Button>Click me</Button>
#+end_export

`);
  });

  it('should convert frontmatter to Org keywords', async () => {
    const mdxContent = `---
title: Test Title
description: Test Description
---

Content here.`;

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe(
      '#+TITLE: Test Title\n#+DESCRIPTION: Test Description\n\n'
    );
    expect(result.org).toBe('Content here.\n\n');
  });

  it('should handle tables', async () => {
    const mdxContent = `| Name | Age |
|------|-----|
| Alice | 25 |
| Bob | 30 |`;

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe('');
    expect(result.org).toBe(`| Name | Age |
|------|-----|
| Alice | 25 |
| Bob | 30 |

`);
  });

  it('should handle blockquotes', async () => {
    const mdxContent = `> This is a blockquote
> with multiple lines.`;

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe('');
    expect(result.org).toBe('This is a blockquote\nwith multiple lines.\n\n');
  });

  it('should handle horizontal rules', async () => {
    const mdxContent = `Before

---

After`;

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe('');
    expect(result.org).toBe('Before\n\n-----\n\nAfter\n\n');
  });

  it('should handle empty content', async () => {
    const mdxContent = '';

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe('');
    expect(result.org).toBe('');
  });

  it('should handle malformed MDX gracefully', async () => {
    const mdxContent = `# Heading without proper spacing

Some text.`;

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe('');
    expect(result.org).toBe(`* Heading without proper spacing

Some text.

`);
  });

  it('should convert include tags back to INCLUDE directives', async () => {
    const mdxContent = `# Main Document

<include>included.shared.org.mdx</include>

End of main document.`;

    const result = await convertMdxToOrg(mdxContent, 'test');

    expect(result.keywords).toBe('');
    expect(result.org).toBe(`* Main Document

#+INCLUDE: "included.org"

End of main document.

`);
  });
});
