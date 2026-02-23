import type { AstroIntegration, ContentEntryType, HookParameters } from 'astro';
import { unified } from 'unified';
import uniorgParse from 'uniorg-parse';
import uniorg2rehype from 'uniorg-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';

type SetupHookParams = HookParameters<'astro:config:setup'> & {
	addPageExtension: (extension: string) => void;
	addContentEntryType: (contentEntryType: ContentEntryType) => void;
};

export interface OrgOptions {
	remarkPlugins?: any[];
	rehypePlugins?: any[];
}

function extractMetadata(contents: string): Record<string, string> {
	const metadata: Record<string, string> = {};
	const lines = contents.split('\n');

	for (const line of lines) {
		const match = line.match(/^#\+(\w+):\s*(.*)$/);
		if (match) {
			const key = match[1].toUpperCase();
			metadata[key] = match[2].trim();
			
			if (key === 'TITLE') {
				metadata['title'] = match[2].trim();
			}
			if (key === 'DESCRIPTION') {
				metadata['description'] = match[2].trim();
			}
			if (key === 'DATE') {
				metadata['date'] = match[2].trim();
			}
		}
	}

	return metadata;
}

export async function parseOrgToHtml(contents: string): Promise<string> {
	const processor = unified()
		.use(uniorgParse)
		.use(uniorg2rehype)
		.use(remarkGfm)
		.use(rehypeStringify);

	const result = await processor.process(contents);
	return String(result);
}

export default function org(_options: OrgOptions = {}): AstroIntegration {
	return {
		name: 'org-mode',
		hooks: {
			'astro:config:setup': async (params) => {
				const { updateConfig, addPageExtension, addContentEntryType } = params as SetupHookParams;

				addPageExtension('.org');

				addContentEntryType({
					extensions: ['.org'],
					getEntryInfo: async ({ contents }: { contents: string }) => {
						const metadata = extractMetadata(contents);
						const slug = metadata.SLUG || metadata.TITLE?.toLowerCase().replace(/\s+/g, '-') || '';
						return {
							data: metadata,
							body: contents,
							rawData: contents,
							slug,
						};
					},
					handlePropagation: true,
				});

				updateConfig({
					vite: {
						plugins: [
							{
								name: 'org-mode-transform',
								enforce: 'pre',
								async transform(source, id) {
									if (!id.endsWith('.org')) {
										return;
									}

									const processor = unified()
										.use(uniorgParse)
										.use(uniorg2rehype)
										.use(remarkGfm)
										.use(rehypeStringify);

									const result = await processor.process(source);

									const code = `
export const Content = function(props) {
  return \`${String(result)}\`;
};
export default Content;
`;
									return {
										code,
										map: null,
									};
								},
							},
						],
					},
				});
			},
		},
	};
}

export { extractMetadata };
