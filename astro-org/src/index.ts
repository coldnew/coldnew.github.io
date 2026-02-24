import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import type { AstroIntegration, HookParameters } from 'astro';
import rehype2remark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import parse from 'uniorg-parse';
import uniorg2rehype from 'uniorg-rehype';

type SetupHookParams = HookParameters<'astro:config:setup'> & {
  addPageExtension: (extension: string) => void;
  addContentEntryType: (contentEntryType: any) => void;
  addRenderer: (renderer: any) => void;
  updateConfig: (config: any) => void;
};

function extractMetadata(contents: string): Record<string, any> {
  const metadata: Record<string, any> = {};
  const lines = contents.split('\n');
  const bodyLines: string[] = [];
  let inFrontmatter = true;

  for (const line of lines) {
    if (inFrontmatter) {
      const match = line.match(/^#\+(\w+):\s*(.*)$/);
      if (match) {
        const key = match[1].toUpperCase();
        const value = match[2].trim();

        metadata[key] = value;

        if (key === 'TITLE') {
          metadata.title = value;
        }
        if (key === 'DESCRIPTION') {
          metadata.description = value;
        }
        if (key === 'DATE') {
          metadata.date = value;
        }
      } else if (line.trim() === '' && Object.keys(metadata).length === 0) {
      } else if (!line.match(/^#\+/) && line.trim() !== '') {
        inFrontmatter = false;
        bodyLines.push(line);
      }
    } else {
      bodyLines.push(line);
    }
  }

  metadata._body = bodyLines.join('\n');
  return metadata;
}

function orgToMarkdown(orgBody: string): string {
  const processor = unified()
    .use(parse)
    .use(uniorg2rehype)
    .use(rehype2remark)
    .use(remarkGfm)
    .use(remarkStringify);

  const result = processor.processSync(orgBody);
  return String(result);
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
            const parsed = extractMetadata(contents);
            const slug =
              parsed.SLUG ||
              parsed.TITLE?.toLowerCase().replace(/\s+/g, '-') ||
              '';
            const markdownBody = orgToMarkdown(parsed._body || '');

            const frontmatter = {
              title: parsed.TITLE || parsed.title || '',
              description: parsed.DESCRIPTION || parsed.description || '',
              pubDate: parsed.DATE ? new Date(parsed.DATE) : undefined,
            };

            return {
              data: frontmatter,
              body: markdownBody,
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
