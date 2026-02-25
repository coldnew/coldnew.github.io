import { describe, expect, it } from 'vitest';
import { processDrawerBlocks, restoreDrawerBlocks } from './drawer-blocks';
import { createBlockContext } from './types';

describe('processDrawerBlocks', () => {
  it('should process basic drawer blocks', () => {
    const content = `:notes:
Some notes content here
:end:`;

    const context = createBlockContext();

    const result = processDrawerBlocks(content, context);

    const expected = `\n\n<Accordions type="single" collapsible>
  <Accordion title="Notes" id="drawer-0">
Some notes content here
  </Accordion>
</Accordions>\n\n`;

    expect(result).toBe(expected);
  });

  it('should convert drawer names to title case', () => {
    const content = `:my_custom_drawer:
Content here
:end:`;

    const context = createBlockContext();

    const result = processDrawerBlocks(content, context);

    const expected = `\n\n<Accordions type="single" collapsible>
  <Accordion title="My Custom Drawer" id="drawer-0">
Content here
  </Accordion>
</Accordions>\n\n`;

    expect(result).toBe(expected);
  });

  it('should handle multiple drawers', () => {
    const content = `:first:
First content
:end:

:second:
Second content
:end:`;

    const context = createBlockContext();

    const result = processDrawerBlocks(content, context);

    const expected = `\n\n<Accordions type="single" collapsible>
  <Accordion title="First" id="drawer-0">
First content
  </Accordion>
</Accordions>\n\n\n\n\n\n<Accordions type="single" collapsible>
  <Accordion title="Second" id="drawer-1">
Second content
  </Accordion>
</Accordions>\n\n`;

    expect(result).toBe(expected);
  });

  it('should skip special drawers', () => {
    const content = `:properties:
:key: value
:end:

:logbook:
Some log entries
:end:

:clock:
Clock data
:end:

:effort:
Effort data
:end:`;

    const context = createBlockContext();

    const result = processDrawerBlocks(content, context);

    // Special drawers should not be converted
    expect(result).toBe(content);
  });

  it('should handle drawers with mixed case names', () => {
    const content = `:MyDrawer:
Content
:end:`;

    const context = createBlockContext();

    const result = processDrawerBlocks(content, context);

    const expected = `\n\n<Accordions type="single" collapsible>
  <Accordion title="My Drawer" id="drawer-0">
Content
  </Accordion>
</Accordions>\n\n`;

    expect(result).toBe(expected);
  });

  it('should process drawer content with indentation', () => {
    const content = `:notes:
  This is indented content
    More indentation
:end:`;

    const context = createBlockContext();

    const result = processDrawerBlocks(content, context);

    const expected = `\n\n<Accordions type="single" collapsible>
  <Accordion title="Notes" id="drawer-0">
  This is indented content
    More indentation
  </Accordion>
</Accordions>\n\n`;

    expect(result).toBe(expected);
  });

  it('should handle empty drawer content', () => {
    const content = `:empty:
:end:`;

    const context = createBlockContext();

    const result = processDrawerBlocks(content, context);

    const expected = `\n\n<Accordions type="single" collapsible>
  <Accordion title="Empty" id="drawer-0">

  </Accordion>
</Accordions>\n\n`;

    expect(result).toBe(expected);
  });

  it('should handle drawers with org markup in content', () => {
    const content = `:details:
* Heading in drawer
- List item 1
- List item 2
:end:`;

    const context = createBlockContext();

    const result = processDrawerBlocks(content, context);

    const expected = `\n\n<Accordions type="single" collapsible>
  <Accordion title="Details" id="drawer-0">
* Heading in drawer
- List item 1
- List item 2
  </Accordion>
</Accordions>\n\n`;

    expect(result).toBe(expected);
  });

  it('should preserve content outside drawers', () => {
    const content = `Some text before

:notes:
Drawer content
:end:

Some text after`;

    const context = createBlockContext();

    const result = processDrawerBlocks(content, context);

    const expected = `Some text before\n\n\n\n<Accordions type="single" collapsible>
  <Accordion title="Notes" id="drawer-0">
Drawer content
  </Accordion>
</Accordions>\n\n\n\nSome text after`;

    expect(result).toBe(expected);
  });

  it('should handle nested content within drawers', () => {
    const content = `:complex:
This is a drawer with
multiple lines and
different content types.

* A heading
- List item
  - Nested item

Some more text.
:end:`;

    const context = createBlockContext();

    const result = processDrawerBlocks(content, context);

    const expected = `\n\n<Accordions type="single" collapsible>
  <Accordion title="Complex" id="drawer-0">
This is a drawer with
multiple lines and
different content types.

* A heading
- List item
  - Nested item

Some more text.
  </Accordion>
</Accordions>\n\n`;

    expect(result).toBe(expected);
  });
});

describe('restoreDrawerBlocks', () => {
  it('should be a no-op for accordions', () => {
    const markdown = `\n\n<Accordions type="single" collapsible>
  <Accordion title="Notes" id="drawer-0">
Some content
  </Accordion>
</Accordions>\n\n`;

    const context = createBlockContext();

    const result = restoreDrawerBlocks(markdown, context);

    expect(result).toBe(markdown);
  });

  it('should handle multiple accordions', () => {
    const markdown = `<Accordion type="single" collapsible className="w-full">
  <AccordionItem value="drawer-0">
    <AccordionTrigger>First</AccordionTrigger>
    <AccordionContent>
First content
    </AccordionContent>
  </AccordionItem>
</Accordion>

<Accordion type="single" collapsible className="w-full">
  <AccordionItem value="drawer-1">
    <AccordionTrigger>Second</AccordionTrigger>
    <AccordionContent>
Second content
    </AccordionContent>
  </AccordionItem>
</Accordion>`;

    const context = createBlockContext();

    const result = restoreDrawerBlocks(markdown, context);

    expect(result).toBe(markdown);
  });
});
