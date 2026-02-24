import { fileURLToPath } from 'node:url';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import type { AstroIntegration, HookParameters } from 'astro';
import { rehypeCode, remarkHeading } from 'fumadocs-core/mdx-plugins';
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

      // Remove surrounding quotes if present
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
        // Try to parse date, keep as string if parsing fails
        const parsedDate = new Date(value);
        if (!Number.isNaN(parsedDate.getTime())) {
          data.pubDate = parsedDate.toISOString();
        } else {
          // For org-mode dates like <2012-12-15 Sat 14:43>, extract just the date part
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

export default function org(): AstroIntegration {
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
          serverEntrypoint: '@astrojs/mdx/server.js',
        });

        addPageExtension('.org');

        const contentEntryType: any = {
          extensions: ['.org'],
          name: 'org',
          async getEntryInfo({
            contents,
            fileUrl,
          }: {
            contents: string;
            fileUrl: string | URL;
          }) {
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

            return {
              data: frontmatterData,
              body: result.markdown,
              slug: fileSlug,
              rawData: contents,
            };
          },
          handlePropagation: true,
          async getRenderFunction(config: any) {
            const processor = await createMarkdownProcessor({
              ...config.markdown,
              syntaxHighlight: false,
              remarkPlugins: [remarkHeading],
              rehypePlugins: [rehypeCode],
            });
            return async function renderToString(entry: any) {
              const result = await processor.render(entry.body ?? '', {
                frontmatter: entry.data,
              });
              return {
                html: result.code,
                metadata: {
                  ...result.metadata,
                  imagePaths: result.metadata.localImagePaths.concat(
                    result.metadata.remoteImagePaths
                  ),
                },
              };
            };
          },
        };

        addContentEntryType(contentEntryType);

        updateConfig({
          vite: {
            plugins: [],
          },
        });
      },
      'astro:server:setup': ({ toolbar }) => {
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
