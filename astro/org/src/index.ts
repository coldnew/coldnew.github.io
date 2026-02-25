import { fileURLToPath } from 'node:url';
import { createProcessor, nodeTypes } from '@mdx-js/mdx';
import type { AstroIntegration, HookParameters } from 'astro';
import { init, parse } from 'es-module-lexer';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { VFile } from 'vfile';
import type { Plugin } from 'vite';
import { convertOrgToMdx } from './core/index.js';

type SetupHookParams = HookParameters<'astro:config:setup'> & {
  addPageExtension: (extension: string) => void;
  addContentEntryType: (contentEntryType: any) => void;
  addRenderer: (renderer: any) => void;
  updateConfig: (config: any) => void;
};

type OrgDebugData = {
  markdown: string;
  frontmatter: string;
  sourceFile: string;
  slug: string;
};

const orgDebugDataStore = new Map<string, OrgDebugData>();

function getSlug(frontmatter: Record<string, unknown>): string {
  const explicitSlug = frontmatter.SLUG as string | undefined;
  if (explicitSlug) return explicitSlug;

  const title = (frontmatter.TITLE || frontmatter.title) as string | undefined;
  if (title) {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
  return '';
}

function parseFrontmatterToData(
  frontmatterStr: string
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  const lines = frontmatterStr.split('\n');

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2].trim().replace(/\\:/g, ':').replace(/\\n/g, '\n');

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      data[key] = value;

      if (key === 'title' || key === 'TITLE') {
        data.title = value;
      }
      if (key === 'description' || key === 'DESCRIPTION') {
        data.description = value;
      }
      if (key === 'date' || key === 'DATE') {
        const parsedDate = new Date(value);
        if (!Number.isNaN(parsedDate.getTime())) {
          data.pubDate = parsedDate.toISOString();
        } else {
          const dateMatch = value.match(/<(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
            data.pubDate = dateMatch[1];
          } else {
            data.pubDate = value;
          }
        }
      }
    }
  }
  return data;
}

function createOrgMdxProcessor(options: any) {
  const remarkPlugins: any[] = [];
  const rehypePlugins: any[] = [];

  if (options?.gfm !== false) {
    remarkPlugins.push(remarkGfm);
  }
  rehypePlugins.push([rehypeRaw, { passThrough: nodeTypes }]);

  // Add custom plugins from options
  if (options?.remarkPlugins) {
    remarkPlugins.push(...options.remarkPlugins);
  }
  if (options?.rehypePlugins) {
    rehypePlugins.push(...options.rehypePlugins);
  }

  return createProcessor({
    remarkPlugins,
    rehypePlugins,
    recmaPlugins: options?.recmaPlugins,
    jsxImportSource: 'astro',
    format: 'mdx',
    mdExtensions: [],
    elementAttributeNameCase: 'html',
  });
}

async function transformMdxOutput(code: string): Promise<string> {
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

  code += `\nexport const frontmatter = {};`;

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

  code += `\nContent[Symbol.for('mdx-component')] = true;`;
  code += `\nContent[Symbol.for('astro.needsHeadRendering')] = true;`;
  code += `\nContent.moduleId = 'virtual.org';`;
  code += `\nimport { __astro_tag_component__ } from 'astro/runtime/server/index.js';`;
  code += `\n__astro_tag_component__(Content, 'astro:jsx');`;

  return code;
}

function vitePluginOrg(options: any): Plugin {
  let processor: ReturnType<typeof createOrgMdxProcessor>;

  return {
    name: 'astro-org:compile',
    enforce: 'pre',
    config() {
      console.log('[astro-org] config hook called');
    },
    buildStart() {
      console.log('[astro-org] buildStart hook called');
    },
    transform: {
      handler: async (code: string, id: string) => {
        const normalizedId = id.split('?')[0];

        // Skip content collection files - they are handled by getRenderModule
        if (
          normalizedId.includes('/src/content/') &&
          normalizedId.endsWith('.org')
        ) {
          return undefined;
        }

        if (!normalizedId.endsWith('.org')) return undefined;

        const result = await convertOrgToMdx(code, id);
        const mdxSource = result.markdown;
        console.log('[astro-org] converted to mdx, length:', mdxSource.length);

        if (!processor) {
          processor = createOrgMdxProcessor(options);
        }

        const vfile = new VFile({
          value: mdxSource,
          path: id,
        });

        const compiled = await processor.process(vfile);
        let outputCode = String(compiled.value);
        outputCode = await transformMdxOutput(outputCode);

        return {
          code: outputCode,
          map: compiled.map,
        };
      },
    },
  };
}

export interface OrgOptions {
  mdxOptions?: {
    remarkPlugins?: any[];
    rehypePlugins?: any[];
    recmaPlugins?: any[];
    gfm?: boolean;
    sourcemap?: boolean;
  };
}

export default function org(options: OrgOptions = {}): AstroIntegration {
  return {
    name: 'org-mode',
    hooks: {
      'astro:config:setup': async (params) => {
        const {
          addPageExtension,
          addContentEntryType,
          addRenderer,
          updateConfig,
          addDevToolbarApp,
        } = params as SetupHookParams;

        const isDev = params.command === 'dev';

        if (isDev) {
          addDevToolbarApp({
            id: 'org-mode-debug',
            name: 'Org-Mode Debug',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
            entrypoint: fileURLToPath(
              new URL('./toolbar-app.ts', import.meta.url)
            ),
          });
        }

        addRenderer({
          name: 'astro:jsx',
          serverEntrypoint: fileURLToPath(
            new URL('../mdx/src/server.ts', import.meta.url)
          ),
        });

        addPageExtension('.org');

        const contentEntryType: any = {
          extensions: ['.org'],
          name: 'org',
          contentModuleTypes: `
declare module 'astro:content' {
  interface RenderResult {
    '.org': {
      Content: (props: any) => any;
      frontmatter: Record<string, any>;
      headings: { depth: number; slug: string; text: string }[];
      components: Record<string, any>;
    };
  }
  interface Render {
    '.org': Promise<{
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
            console.log('[astro-org] getEntryInfo called for:', fileUrl);
            console.log('[astro-org] contents length:', contents.length);
            const result = await convertOrgToMdx(contents, 'untitled.org');
            const frontmatterData = parseFrontmatterToData(result.frontmatter);

            const fileUrlStr =
              typeof fileUrl === 'string' ? fileUrl : fileUrl?.toString() || '';
            const fileSlug = fileUrlStr
              ? decodeURIComponent(
                  fileUrlStr
                    .split('/')
                    .pop()
                    ?.replace(/\.org$/, '') || ''
                )
              : getSlug(frontmatterData);

            if (fileSlug) {
              orgDebugDataStore.set(fileSlug, {
                markdown: result.markdown,
                frontmatter: result.frontmatter,
                sourceFile: fileUrlStr,
                slug: fileSlug,
              });
            }

            console.log('[astro-org] body length:', result.markdown.length);
            return {
              data: frontmatterData,
              body: result.markdown,
              slug: fileSlug,
              rawData: contents,
            };
          },
          async getRenderModule({ contents, fileUrl, viteId }) {
            console.log('[astro-org] getRenderModule called for:', viteId);
            const result = await convertOrgToMdx(contents, 'untitled.org');
            const mdxSource = result.markdown;
            console.log(
              '[astro-org] converted to mdx, length:',
              mdxSource.length
            );

            const processor = createOrgMdxProcessor(options.mdxOptions);
            const vfile = new VFile({
              value: mdxSource,
              path: fileUrl instanceof URL ? fileUrl : new URL(fileUrl),
            });

            const compiled = await processor.process(vfile);
            let outputCode = String(compiled.value);
            outputCode = await transformMdxOutput(outputCode);
            console.log('[astro-org] compiled code length:', outputCode.length);

            return { code: outputCode };
          },
        };

        addContentEntryType(contentEntryType);

        updateConfig({
          vite: {
            plugins: [vitePluginOrg(options.mdxOptions)],
          },
        });
      },
      'astro:server:setup': ({ toolbar }: any) => {
        toolbar.on('org-mode:get-markdown', (data: { path: string }) => {
          const path = data.path;

          const blogMatch = path.match(/^\/blog\/([^/]+)\/?$/);
          if (blogMatch) {
            const urlEncodedSlug = blogMatch[1];
            const slug = decodeURIComponent(urlEncodedSlug);

            const orgData =
              orgDebugDataStore.get(slug) ||
              orgDebugDataStore.get(urlEncodedSlug);
            if (orgData) {
              toolbar.send('org-mode:markdown-data', {
                path,
                markdown: orgData.markdown,
                frontmatter: orgData.frontmatter,
                isOrgFile: true,
                sourceFile: orgData.sourceFile,
              });
              return;
            }
          }

          toolbar.send('org-mode:markdown-data', {
            path,
            markdown: '',
            frontmatter: '',
            isOrgFile: false,
            sourceFile: 'not an org file',
          });
        });
      },
    },
  };
}
