import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import { createProcessor, nodeTypes } from '@mdx-js/mdx';
import type { AstroIntegration } from 'astro';
import { init, parse } from 'es-module-lexer';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { SourceMapGenerator } from 'source-map';
import { VFile } from 'vfile';
import { type AstroMdxOptions, vitePluginAstroMdx } from './vite-plugin.js';

export {
  type AstroMdxOptions,
  vitePluginAstroMdx,
} from './vite-plugin.js';

export function astroMdx(options: AstroMdxOptions = {}): AstroIntegration {
  const mdxOptions = options;

  function getRemarkPlugins(opts: AstroMdxOptions): any[] {
    const plugins: any[] = [];
    if (opts.gfm !== false) {
      plugins.push(remarkGfm);
    }
    if (opts.remarkPlugins) {
      plugins.push(...opts.remarkPlugins);
    }
    return plugins;
  }

  function getRehypePlugins(opts: AstroMdxOptions): any[] {
    const plugins: any[] = [[rehypeRaw, { passThrough: nodeTypes }]];
    if (opts.rehypePlugins) {
      plugins.push(...opts.rehypePlugins);
    }
    return plugins;
  }

  function createMdxProcessor(opts: AstroMdxOptions = {}) {
    return createProcessor({
      remarkPlugins: getRemarkPlugins(opts),
      rehypePlugins: getRehypePlugins(opts),
      recmaPlugins: opts.recmaPlugins,
      jsxImportSource: 'astro',
      format: 'mdx',
      mdExtensions: [],
      elementAttributeNameCase: 'html',
      SourceMapGenerator: opts.sourcemap ? SourceMapGenerator : undefined,
    });
  }

  async function transformMdxOutput(
    code: string,
    id: string,
    ssr: boolean,
    frontmatter: Record<string, any>
  ): Promise<string> {
    await init;
    const [imports] = parse(code) as any;

    const hasFragment = imports.some((imp: any) => {
      if (imp.n !== 'astro/jsx-runtime') return false;
      const stmt = code.slice(imp.ss, imp.se);
      return /[\s,{]Fragment[\s,}]/.test(stmt);
    });

    if (!hasFragment) {
      code += `\nimport { Fragment as _Fragment } from 'astro/jsx-runtime';`;
    }

    const frontmatterStr = JSON.stringify(frontmatter, null, 2);
    code += `\nexport const frontmatter = ${frontmatterStr};`;

    if (!code.includes('export const Content')) {
      code = code.replace(
        'export default function MDXContent',
        'function MDXContent'
      );

      code += `
export const Content = (props = {}) => MDXContent({
  ...props,
  components: { Fragment: _Fragment, ...props.components },
});
export default Content;`;
    }

    code += `\nContent[Symbol.for('mdx-component')] = true;`;
    code += `\nContent[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter?.layout);`;
    code += `\nContent.moduleId = ${JSON.stringify(id)};`;

    if (ssr) {
      const hasTagComponent = imports.some((imp: any) => {
        if (imp.n !== 'astro/runtime/server/index.js') return false;
        const stmt = code.slice(imp.ss, imp.se);
        return /[\s,{]__astro_tag_component__[\s,}]/.test(stmt);
      });

      if (!hasTagComponent) {
        code += `\nimport { __astro_tag_component__ } from 'astro/runtime/server/index.js';`;
      }
      code += `\n__astro_tag_component__(Content, 'astro:jsx');`;
    }

    return code;
  }

  return {
    name: 'astro-mdx',
    hooks: {
      'astro:config:setup': async (params) => {
        const { updateConfig, addRenderer, addContentEntryType } =
          params as any;

        addRenderer({
          name: 'astro:jsx',
          serverEntrypoint: fileURLToPath(
            new URL('./server.ts', import.meta.url)
          ),
        });

        addContentEntryType({
          extensions: ['.mdx'],
          name: 'mdx',
          contentModuleTypes: `
declare module 'astro:content' {
  interface RenderResult {
    '.mdx': {
      Content: (props: any) => any;
      frontmatter: Record<string, any>;
      headings: { depth: number; slug: string; text: string }[];
      components: Record<string, any>;
    };
  }
  interface Render {
    '.mdx': Promise<{
      Content: (props: any) => any;
      frontmatter: Record<string, any>;
      headings: { depth: number; slug: string; text: string }[];
      components: Record<string, any>;
    }>;
  }
}
`,
          async getEntryInfo({
            contents,
            fileUrl,
          }: {
            contents: string;
            fileUrl: string | URL;
          }) {
            const frontmatterMatch = contents.match(
              /^---\r?\n([\s\S]*?)\r?\n---/
            );
            const frontmatter: Record<string, any> = {};
            let body = contents;

            if (frontmatterMatch) {
              const fmContent = frontmatterMatch[1];
              body = contents.slice(frontmatterMatch[0].length).trim();

              for (const line of fmContent.split('\n')) {
                const match = line.match(/^(\w+):\s*(.*)$/);
                if (match) {
                  const key = match[1];
                  let value: any = match[2].trim();
                  if (
                    (value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))
                  ) {
                    value = value.slice(1, -1);
                  }
                  frontmatter[key] = value;
                }
              }
            }

            const fileUrlStr =
              typeof fileUrl === 'string' ? fileUrl : fileUrl.toString();
            const slug =
              fileUrlStr
                .split('/')
                .pop()
                ?.replace(/\.mdx$/, '') || '';

            return {
              data: frontmatter,
              body,
              slug,
              rawData: contents,
            };
          },
          async getRenderModule({ contents, fileUrl, viteId }) {
            const { frontmatter, content } = parseFrontmatter(contents, {
              frontmatter: 'empty-with-spaces',
            });

            const vfile = new VFile({
              value: content,
              path: fileUrl instanceof URL ? fileUrl : new URL(fileUrl),
              data: {
                astro: {
                  frontmatter,
                },
              },
            });

            const processor = createMdxProcessor(mdxOptions);
            const compiled = await processor.process(vfile);
            let outputCode = String(compiled.value);
            outputCode = await transformMdxOutput(
              outputCode,
              viteId,
              true,
              frontmatter
            );

            return { code: outputCode };
          },
        });

        updateConfig({
          vite: {
            plugins: [vitePluginAstroMdx(options)],
          },
        });
      },
    },
  };
}

export default astroMdx;
