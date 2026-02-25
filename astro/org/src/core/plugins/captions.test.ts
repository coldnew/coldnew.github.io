import { describe, expect, it } from 'vitest';
import { createPluginContext } from '../types';
import { orgCaptions } from './captions';

describe('orgCaptions', () => {
  it('should extract captions from nodes with affiliated CAPTION', () => {
    const context = createPluginContext();
    const plugin = orgCaptions(context);

    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          affiliated: {
            CAPTION: [[{ type: 'text', value: 'This is a caption' }]],
          },
          children: [],
        },
      ],
    };

    plugin(tree);

    expect(context.captions).toEqual([
      { index: 0, caption: 'This is a caption' },
    ]);
  });

  it('should handle captions with formatting', () => {
    const context = createPluginContext();
    const plugin = orgCaptions(context);

    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          affiliated: {
            CAPTION: [
              [
                { type: 'text', value: 'Bold ' },
                { type: 'bold', children: [{ type: 'text', value: 'text' }] },
                { type: 'text', value: ' and ' },
                {
                  type: 'italic',
                  children: [{ type: 'text', value: 'italic' }],
                },
              ],
            ],
          },
          children: [],
        },
      ],
    };

    plugin(tree);

    expect(context.captions).toEqual([
      { index: 0, caption: 'Bold <strong>text</strong> and <em>italic</em>' },
    ]);
  });

  it('should handle code and verbatim in captions', () => {
    const context = createPluginContext();
    const plugin = orgCaptions(context);

    const tree = {
      type: 'root',
      children: [
        {
          type: 'link',
          affiliated: {
            CAPTION: [
              [
                { type: 'text', value: 'Code ' },
                { type: 'code', value: 'inline' },
                { type: 'text', value: ' and ' },
                { type: 'verbatim', value: 'verbatim' },
              ],
            ],
          },
          children: [],
        },
      ],
    };

    plugin(tree);

    expect(context.captions).toEqual([
      {
        index: 0,
        caption: 'Code <code>inline</code> and <code>verbatim</code>',
      },
    ]);
  });

  it('should handle multiple captions', () => {
    const context = createPluginContext();
    const plugin = orgCaptions(context);

    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          affiliated: {
            CAPTION: [[{ type: 'text', value: 'First caption' }]],
          },
          children: [],
        },
        {
          type: 'link',
          affiliated: {
            CAPTION: [[{ type: 'text', value: 'Second caption' }]],
          },
          children: [],
        },
      ],
    };

    plugin(tree);

    expect(context.captions).toEqual([
      { index: 0, caption: 'First caption' },
      { index: 1, caption: 'Second caption' },
    ]);
  });

  it('should remove affiliated data after processing', () => {
    const context = createPluginContext();
    const plugin = orgCaptions(context);

    const node = {
      type: 'paragraph',
      affiliated: {
        CAPTION: [[{ type: 'text', value: 'Test' }]],
      },
      children: [],
    };

    const tree = {
      type: 'root',
      children: [node],
    };

    plugin(tree);

    expect(node.affiliated).toBeUndefined();
  });

  it('should initialize captions array', () => {
    const context = createPluginContext();
    context.captions = [{ index: 0, caption: 'existing' }];
    const plugin = orgCaptions(context);

    const tree = {
      type: 'root',
      children: [],
    };

    plugin(tree);

    expect(context.captions).toEqual([]);
  });
});
