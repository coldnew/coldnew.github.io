import { AstroJSX, jsx } from 'astro/jsx-runtime';
import { renderJSX } from 'astro/runtime/server/index.js';

const slotName = (str: string) =>
  str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());

async function check(
  Component: any,
  props: any,
  { default: children = null, ...slotted }: any = {}
) {
  if (typeof Component !== 'function') return false;
  const slots: Record<string, any> = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children });
    return result[AstroJSX];
  } catch {
    return false;
  }
}

async function renderToStaticMarkup(
  Component: any,
  props: Record<string, any> = {},
  { default: children = null, ...slotted }: any = {}
) {
  const slots: Record<string, any> = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  const html = await renderJSX(
    result,
    jsx(Component, { ...props, ...slots, children })
  );
  return { html };
}

export default {
  name: 'astro:jsx',
  check,
  renderToStaticMarkup,
};
