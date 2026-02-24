import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import type { AstroIntegration, HookParameters } from 'astro';
import { convertOrgToMdx } from './core/index.js';

type SetupHookParams = HookParameters<'astro:config:setup'> & {
  addPageExtension: (extension: string) => void;
  addContentEntryType: (contentEntryType: any) => void;
  addRenderer: (renderer: any) => void;
  updateConfig: (config: any) => void;
};

function getSlug(frontmatter: Record<string, unknown>): string {
  const slug = frontmatter.SLUG as string | undefined;
  if (slug) return slug;
  const title = frontmatter.TITLE as string | undefined;
  if (title) return title.toLowerCase().replace(/\s+/g, '-');
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
      // Unescape escaped characters
      const value = match[2].trim().replace(/\\:/g, ':').replace(/\\n/g, '\n');
      data[key] = value;

      if (key === 'title' || key === 'TITLE') {
        data.title = value;
      }
      if (key === 'description' || key === 'DESCRIPTION') {
        data.description = value;
      }
      if (key === 'date' || key === 'DATE') {
        data.pubDate = new Date(value);
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
        } = params as SetupHookParams;

        addRenderer({
          name: 'astro:jsx',
          serverEntrypoint: '@astrojs/mdx/server.js',
        });

        addPageExtension('.org');

        const contentEntryType: any = {
          extensions: ['.org'],
          name: 'org',
          async getEntryInfo({ contents }: { contents: string }) {
            const result = await convertOrgToMdx(contents, 'untitled.org');
            const frontmatterData = parseFrontmatterToData(result.frontmatter);
            const slug = getSlug(frontmatterData);

            return {
              data: frontmatterData,
              body: result.markdown,
              slug,
              rawData: contents,
            };
          },
          handlePropagation: true,
          async getRenderFunction(config: any) {
            const processor = await createMarkdownProcessor(
              config.markdown ?? {}
            );
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
    },
  };
}
