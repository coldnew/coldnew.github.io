import { parseFrontmatter } from '@astrojs/markdown-remark';
import { createProcessor, nodeTypes } from '@mdx-js/mdx';
import { init, parse } from 'es-module-lexer';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { SourceMapGenerator } from 'source-map';
import { VFile } from 'vfile';
import type { Plugin } from 'vite';

export interface AstroMdxOptions {
  remarkPlugins?: any[];
  rehypePlugins?: any[];
  recmaPlugins?: any[];
  gfm?: boolean;
  sourcemap?: boolean;
}

function getRemarkPlugins(options: AstroMdxOptions): any[] {
  const plugins: any[] = [];
  if (options.gfm !== false) {
    plugins.push(remarkGfm);
  }
  if (options.remarkPlugins) {
    plugins.push(...options.remarkPlugins);
  }
  return plugins;
}

function getRehypePlugins(options: AstroMdxOptions): any[] {
  const plugins: any[] = [[rehypeRaw, { passThrough: nodeTypes }]];
  if (options.rehypePlugins) {
    plugins.push(...options.rehypePlugins);
  }
  return plugins;
}

export function createMdxProcessor(options: AstroMdxOptions = {}) {
  return createProcessor({
    remarkPlugins: getRemarkPlugins(options),
    rehypePlugins: getRehypePlugins(options),
    recmaPlugins: options.recmaPlugins,
    jsxImportSource: 'astro',
    format: 'mdx',
    mdExtensions: [],
    elementAttributeNameCase: 'html',
    SourceMapGenerator: options.sourcemap ? SourceMapGenerator : undefined,
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

  code = injectFragmentImport(code, imports);
  code = injectFrontmatterExport(code, frontmatter);
  code = transformContentExport(code);
  code = annotateContent(code, id, ssr, imports);

  return code;
}

function injectFragmentImport(code: string, imports: any[]): string {
  const hasFragment = imports.some((imp: any) => {
    if (imp.n !== 'astro/jsx-runtime') return false;
    const stmt = code.slice(imp.ss, imp.se);
    return /[\s,{]Fragment[\s,}]/.test(stmt);
  });

  if (!hasFragment) {
    code += `\nimport { Fragment as _Fragment } from 'astro/jsx-runtime';`;
  }
  return code;
}

function injectFrontmatterExport(
  code: string,
  frontmatter: Record<string, any>
): string {
  const frontmatterStr = JSON.stringify(frontmatter, null, 2);
  code += `\nexport const frontmatter = ${frontmatterStr};`;
  return code;
}

function transformContentExport(code: string): string {
  if (code.includes('export const Content')) return code;

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

  return code;
}

function annotateContent(
  code: string,
  id: string,
  ssr: boolean,
  imports: any[]
): string {
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

export function vitePluginAstroMdx(options: AstroMdxOptions = {}): Plugin {
  let processor: ReturnType<typeof createMdxProcessor>;
  let ssr = false;

  return {
    name: 'astro-mdx:compile',
    enforce: 'pre',
    configResolved(config) {
      ssr = !!config.build.ssr;
    },
    buildEnd() {
      processor = undefined as any;
    },
    async transform(code, id) {
      const normalizedId = id.split('?')[0];

      // Skip content collection files - they are handled by getRenderModule
      if (
        normalizedId.includes('/src/content/') &&
        normalizedId.endsWith('.mdx')
      ) {
        return undefined;
      }

      if (!normalizedId.endsWith('.mdx')) return undefined;

      console.log('[astro-mdx] transform called:', id);

      const { frontmatter, content } = parseFrontmatter(code, {
        frontmatter: 'empty-with-spaces',
      });

      const vfile = new VFile({
        value: content,
        path: id,
        data: {
          astro: {
            frontmatter,
          },
        },
      });

      if (!processor) {
        processor = createMdxProcessor(options);
      }

      try {
        const compiled = await processor.process(vfile);
        let outputCode = String(compiled.value);
        outputCode = await transformMdxOutput(outputCode, id, ssr, frontmatter);

        return {
          code: outputCode,
          map: compiled.map,
        };
      } catch (e: any) {
        e.name = 'MDXError';
        e.loc = { file: id, line: e.line, column: e.column };
        Error.captureStackTrace(e);
        throw e;
      }
    },
  };
}

export async function compileMdxToModule(
  source: string,
  options: AstroMdxOptions = {}
): Promise<string> {
  const processor = createMdxProcessor(options);
  const vfile = new VFile({
    value: source,
    data: {
      astro: {
        frontmatter: {},
      },
    },
  });
  const compiled = await processor.process(vfile);
  let code = String(compiled.value);
  code = await transformMdxOutput(code, 'virtual.mdx', true, {});
  return code;
}
