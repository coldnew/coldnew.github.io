import { describe, expect, it } from 'vitest';
import { processCodeBlocks, restoreCodeBlocks } from './code-blocks';
import type { BlockContext } from './types';
import { createBlockContext, createTestBlockContext } from './types';

describe('processCodeBlocks', () => {
  it('should process basic code blocks', () => {
    const content = `#+begin_src javascript
console.log("hello");
#+end_src`;

    const context = createBlockContext();

    const result = processCodeBlocks(content, context);

    expect(result).toBe('CODEBLOCKMARKER0');
    expect(context.codeBlocks).toHaveLength(1);
    expect(context.codeBlocks[0]).toEqual({
      original: content,
      lang: 'javascript',
    });
  });

  it('should process code blocks without language', () => {
    const content = `#+begin_src

console.log('hello');
#+end_src`;

    const context = createBlockContext();

    const result = processCodeBlocks(content, context);

    expect(result).toBe('CODEBLOCKMARKER0');
    expect(context.codeBlocks[0]).toEqual({
      original: content,
      lang: '',
    });
  });

  it('should process text blocks', () => {
    const content = `#+begin_src text
This is text content
#+end_src`;

    const context = createBlockContext();

    const result = processCodeBlocks(content, context);

    expect(result).toBe('CODEBLOCKMARKER0');
    expect(context.codeBlocks[0]).toEqual({
      original: content,
      lang: 'text',
    });
  });

  it('should process org blocks', () => {
    const content = `#+begin_src org
* Heading
Some content
#+end_src`;

    const context = createBlockContext();

    const result = processCodeBlocks(content, context);

    expect(result).toBe('CODEBLOCKMARKER0');
    expect(context.codeBlocks[0]).toEqual({
      original: content,
      lang: 'org',
    });
  });

  it('should handle multiple code blocks', () => {
    const content = `#+begin_src javascript
console.log("first");
#+end_src

#+begin_src python
print("second")
#+end_src`;

    const context = createBlockContext();

    const result = processCodeBlocks(content, context);

    expect(result).toBe(`CODEBLOCKMARKER0

CODEBLOCKMARKER1`);
    expect(context.codeBlocks).toHaveLength(2);
    expect(context.codeBlocks[0].lang).toBe('javascript');
    expect(context.codeBlocks[1].lang).toBe('python');
  });

  it('should handle nested code blocks', () => {
    const content = `#+begin_src text
Outer text block
#+begin_src javascript
console.log("nested");
#+end_src
End of outer block
#+end_src`;

    const context = createBlockContext();

    const result = processCodeBlocks(content, context);

    expect(result).toBe('CODEBLOCKMARKER0');
    expect(context.codeBlocks).toHaveLength(1);
    expect(context.codeBlocks[0].lang).toBe('text');
  });

  it('should preserve content outside code blocks', () => {
    const content = `Some text before

#+begin_src javascript
code here
#+end_src

Some text after`;

    const context = createBlockContext();

    const result = processCodeBlocks(content, context);

    expect(result).toBe(`Some text before

CODEBLOCKMARKER0

Some text after`);
  });

  it('should parse tangle and exports attributes', () => {
    const content = `#+begin_src tsx :tangle mdx-components.tsx :exports none
import defaultComponents from 'fumadocs-ui/mdx';
#+end_src`;

    const context = createBlockContext();

    const result = processCodeBlocks(content, context);

    expect(result).toBe('CODEBLOCKMARKER0');
    expect(context.codeBlocks).toHaveLength(1);
    expect(context.codeBlocks[0]).toEqual({
      original: content,
      lang: 'tsx',
      tangle: 'mdx-components.tsx',
      exports: 'none',
    });
  });
});

describe('restoreCodeBlocks', () => {
  it('should restore basic code blocks', () => {
    const context = createTestBlockContext({
      codeBlocks: [
        {
          original: `#+begin_src javascript
console.log("hello");
#+end_src`,
          lang: 'javascript',
        },
      ],
    });

    const markdown = 'CODEBLOCKMARKER0';
    const result = restoreCodeBlocks(markdown, context);

    expect(result).toBe(`\`\`\`javascript
console.log("hello");
\`\`\``);
  });

  it('should restore code blocks without language', () => {
    const context = createTestBlockContext({
      codeBlocks: [
        {
          original: `#+begin_src
some code
#+end_src`,
          lang: '',
        },
      ],
    });

    const markdown = 'CODEBLOCKMARKER0';
    const result = restoreCodeBlocks(markdown, context);

    expect(result).toBe(`\`\`\`
some code
\`\`\``);
  });

  it('should restore text blocks', () => {
    const context = createTestBlockContext({
      codeBlocks: [
        {
          original: `#+begin_src text
This is text content
#+end_src`,
          lang: 'text',
        },
      ],
    });

    const markdown = 'CODEBLOCKMARKER0';
    const result = restoreCodeBlocks(markdown, context);

    expect(result).toBe(`\`\`\`text
This is text content
\`\`\``);
  });

  it('should restore org blocks as text', () => {
    const context: BlockContext = {
      codeBlocks: [
        {
          original: `#+begin_src org
* Heading
Some content
#+end_src`,
          lang: 'org',
        },
      ],
      latexBlocks: [],
      htmlBlocks: [],
      jsxBlocks: [],
      exportHtmlBlocks: [],
      exportBlocks: [],
      calloutBlocks: [],
      exampleBlocks: [],
    };

    const markdown = 'CODEBLOCKMARKER0';
    const result = restoreCodeBlocks(markdown, context);

    expect(result).toBe(`\`\`\`text
* Heading
Some content
\`\`\``);
  });

  it('should map math language to latex', () => {
    const context: BlockContext = {
      codeBlocks: [
        {
          original: `#+begin_src math
E = mc^2
#+end_src`,
          lang: 'math',
        },
      ],
      latexBlocks: [],
      htmlBlocks: [],
      jsxBlocks: [],
      exportHtmlBlocks: [],
      exportBlocks: [],
      calloutBlocks: [],
      exampleBlocks: [],
    };

    const markdown = 'CODEBLOCKMARKER0';
    const result = restoreCodeBlocks(markdown, context);

    expect(result).toBe(`\`\`\`latex
E = mc^2
\`\`\``);
  });

  it('should handle multiple markers', () => {
    const context: BlockContext = {
      codeBlocks: [
        {
          original: `#+begin_src javascript
first block
#+end_src`,
          lang: 'javascript',
        },
        {
          original: `#+begin_src python
second block
#+end_src`,
          lang: 'python',
        },
      ],
      latexBlocks: [],
      htmlBlocks: [],
      jsxBlocks: [],
      exportHtmlBlocks: [],
      exportBlocks: [],
      calloutBlocks: [],
      exampleBlocks: [],
    };

    const markdown = `CODEBLOCKMARKER0

CODEBLOCKMARKER1`;
    const result = restoreCodeBlocks(markdown, context);

    expect(result).toBe(`\`\`\`javascript
first block
\`\`\`

\`\`\`python
second block
\`\`\``);
  });

  it('should handle nested code blocks in content', () => {
    const context: BlockContext = {
      codeBlocks: [
        {
          original: `#+begin_src javascript
inner code
#+end_src`,
          lang: 'javascript',
        },
        {
          original: `#+begin_src text
Outer block
CODEBLOCKMARKER0
End outer
#+end_src`,
          lang: 'text',
        },
      ],
      latexBlocks: [],
      htmlBlocks: [],
      jsxBlocks: [],
      exportHtmlBlocks: [],
      exportBlocks: [],
      calloutBlocks: [],
      exampleBlocks: [],
    };

    const markdown = 'CODEBLOCKMARKER1';
    const result = restoreCodeBlocks(markdown, context);

    expect(result).toBe(`\`\`\`text
Outer block
CODEBLOCKMARKER0
End outer
\`\`\``);
  });

  it('should return empty string for invalid markers', () => {
    const context = createBlockContext();

    const markdown = 'CODEBLOCKMARKER0';
    const result = restoreCodeBlocks(markdown, context);

    expect(result).toBe('');
  });

  it('should not render code block when exports none', () => {
    const context: BlockContext = {
      codeBlocks: [
        {
          original: `#+begin_src tsx :tangle mdx-components.tsx :exports none
import defaultComponents from 'fumadocs-ui/mdx';
#+end_src`,
          lang: 'tsx',
          tangle: 'mdx-components.tsx',
          exports: 'none',
        },
      ],
      latexBlocks: [],
      htmlBlocks: [],
      jsxBlocks: [],
      exportHtmlBlocks: [],
      exportBlocks: [],
      calloutBlocks: [],
      exampleBlocks: [],
    };

    const markdown = 'CODEBLOCKMARKER0';
    const result = restoreCodeBlocks(markdown, context);

    expect(result).toBe('');
  });

  it('should add title when tangle present and exports not none', () => {
    const context: BlockContext = {
      codeBlocks: [
        {
          original: `#+begin_src python :tangle utils.py :exports code
def hello():
    pass
#+end_src`,
          lang: 'python',
          tangle: 'utils.py',
          exports: 'code',
        },
      ],
      latexBlocks: [],
      htmlBlocks: [],
      jsxBlocks: [],
      exportHtmlBlocks: [],
      exportBlocks: [],
      calloutBlocks: [],
      exampleBlocks: [],
    };

    const markdown = 'CODEBLOCKMARKER0';
    const result = restoreCodeBlocks(markdown, context);

    expect(result).toBe(`\`\`\`python title="utils.py"
def hello():
    pass
\`\`\``);
  });

  it('should dedent code block content', () => {
    const context: BlockContext = {
      codeBlocks: [
        {
          original: `#+begin_src sh
    # -*- mode: sh -*-
    export LC_CTYPE="zh_TW.UTF-8"

    # ibus
    export XMODIFIERS="@im=ibus"
#+end_src`,
          lang: 'sh',
        },
      ],
      latexBlocks: [],
      htmlBlocks: [],
      jsxBlocks: [],
      exportHtmlBlocks: [],
      exportBlocks: [],
      calloutBlocks: [],
      exampleBlocks: [],
    };

    const markdown = 'CODEBLOCKMARKER0';
    const result = restoreCodeBlocks(markdown, context);

    expect(result).toBe(`\`\`\`sh
# -*- mode: sh -*-
export LC_CTYPE="zh_TW.UTF-8"

# ibus
export XMODIFIERS="@im=ibus"
\`\`\``);
  });

  it('should dedent text block content', () => {
    const context: BlockContext = {
      codeBlocks: [
        {
          original: `#+begin_src text
    indented text
    more indented
#+end_src`,
          lang: 'text',
        },
      ],
      latexBlocks: [],
      htmlBlocks: [],
      jsxBlocks: [],
      exportHtmlBlocks: [],
      exportBlocks: [],
      calloutBlocks: [],
      exampleBlocks: [],
    };

    const markdown = 'CODEBLOCKMARKER0';
    const result = restoreCodeBlocks(markdown, context);

    expect(result).toBe(`\`\`\`text
indented text
more indented
\`\`\``);
  });

  it('should preserve intentional indentation in dedented content', () => {
    const context: BlockContext = {
      codeBlocks: [
        {
          original: `#+begin_src python
def hello():
    print("world")
    if True:
        print("nested")
#+end_src`,
          lang: 'python',
        },
      ],
      latexBlocks: [],
      htmlBlocks: [],
      jsxBlocks: [],
      exportHtmlBlocks: [],
      exportBlocks: [],
      calloutBlocks: [],
      exampleBlocks: [],
    };

    const markdown = 'CODEBLOCKMARKER0';
    const result = restoreCodeBlocks(markdown, context);

    expect(result).toBe(`\`\`\`python
def hello():
    print("world")
    if True:
        print("nested")
\`\`\``);
  });
});
