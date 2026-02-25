import { describe, expect, it } from 'vitest';
import { createPluginContext } from '../types';
import {
  extractCheckboxes,
  orgCheckboxes,
  restoreCheckboxes,
} from './checkboxes';

describe('orgCheckboxes plugin', () => {
  it('should add checkbox markers to list items', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'list',
          children: [
            {
              type: 'listItem',
              checkbox: 'checked',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'Completed task',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              checkbox: 'unchecked',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'Pending task',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              checkbox: 'indeterminate',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'Partial task',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const context = createPluginContext();

    const plugin = orgCheckboxes(context);
    plugin(tree);

    expect(tree.children[0].children[0].children[0].children[0].value).toBe(
      '[x] Completed task'
    );
    expect(tree.children[0].children[1].children[0].children[0].value).toBe(
      '[ ] Pending task'
    );
    expect(tree.children[0].children[2].children[0].children[0].value).toBe(
      '[-] Partial task'
    );
  });

  it('should handle list items without checkboxes', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'list',
          children: [
            {
              type: 'listItem',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'Regular item',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const context = createPluginContext();

    const plugin = orgCheckboxes(context);
    plugin(tree);

    expect(tree.children[0].children[0].children[0].children[0].value).toBe(
      'Regular item'
    );
  });
});

describe('extractCheckboxes', () => {
  it('should extract checked checkboxes', () => {
    const orgContent = `- [X] Completed task
- [X] Another completed task`;

    const result = extractCheckboxes(orgContent);

    expect(result).toEqual([
      { indent: '', state: 'X', text: 'Completed task' },
      { indent: '', state: 'X', text: 'Another completed task' },
    ]);
  });

  it('should extract unchecked checkboxes', () => {
    const orgContent = `- [ ] Pending task
- [ ] Another pending task`;

    const result = extractCheckboxes(orgContent);

    expect(result).toEqual([
      { indent: '', state: ' ', text: 'Pending task' },
      { indent: '', state: ' ', text: 'Another pending task' },
    ]);
  });

  it('should extract indeterminate checkboxes', () => {
    const orgContent = `- [-] Partial task`;

    const result = extractCheckboxes(orgContent);

    expect(result).toEqual([{ indent: '', state: '-', text: 'Partial task' }]);
  });

  it('should handle indented checkboxes', () => {
    const orgContent = `  - [X] Indented task`;

    const result = extractCheckboxes(orgContent);

    expect(result).toEqual([
      { indent: '  ', state: 'X', text: 'Indented task' },
    ]);
  });

  it('should return empty array when no checkboxes found', () => {
    const orgContent = `- Regular item
- Another item`;

    const result = extractCheckboxes(orgContent);

    expect(result).toEqual([]);
  });

  it('should handle mixed content', () => {
    const orgContent = `Some text
- [X] Task 1
Some more text
- [ ] Task 2
End text`;

    const result = extractCheckboxes(orgContent);

    expect(result).toEqual([
      { indent: '', state: 'X', text: 'Task 1' },
      { indent: '', state: ' ', text: 'Task 2' },
    ]);
  });
});

describe('restoreCheckboxes', () => {
  it('should restore checked checkboxes', () => {
    const orgContent = `- [X] Completed task`;
    const markdown = `* [x] Completed task`;

    const result = restoreCheckboxes(orgContent, markdown);

    expect(result).toBe(`* [x] Completed task`);
  });

  it('should restore unchecked checkboxes', () => {
    const orgContent = `- [ ] Pending task`;
    const markdown = `* [ ] Pending task`;

    const result = restoreCheckboxes(orgContent, markdown);

    expect(result).toBe(`* [ ] Pending task`);
  });

  it('should restore indeterminate checkboxes', () => {
    const orgContent = `- [-] Partial task`;
    const markdown = `* [-] Partial task`;

    const result = restoreCheckboxes(orgContent, markdown);

    expect(result).toBe(`* [-] Partial task`);
  });

  it('should handle multiple checkboxes', () => {
    const orgContent = `- [X] Task 1
- [ ] Task 2
- [-] Task 3`;
    const markdown = `* Task 1
* Task 2
* Task 3`;

    const result = restoreCheckboxes(orgContent, markdown);

    expect(result).toBe(`* [x] Task 1
* [ ] Task 2
* [-] Task 3`);
  });

  it('should handle indented checkboxes', () => {
    const orgContent = `  - [X] Indented task`;
    const markdown = `  * Indented task`;

    const result = restoreCheckboxes(orgContent, markdown);

    expect(result).toBe(`  * [x] Indented task`);
  });

  it('should return original markdown when no checkboxes found', () => {
    const orgContent = `- Regular item`;
    const markdown = `* Regular item`;

    const result = restoreCheckboxes(orgContent, markdown);

    expect(result).toBe(`* Regular item`);
  });

  it('should handle complex content with special characters', () => {
    const orgContent = `- [X] Task with (special) [chars] and *formatting*`;
    const markdown = `* Task with (special) [chars] and *formatting*`;

    const result = restoreCheckboxes(orgContent, markdown);

    expect(result).toBe(`* [x] Task with (special) [chars] and *formatting*`);
  });
});
