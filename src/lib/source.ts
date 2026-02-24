import { type CollectionEntry, getCollection } from 'astro:content';
import type { Source } from 'fumadocs-core/source';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  source: await createBlogSource(),
  baseUrl: '/blog/',
});

async function createBlogSource(): Promise<Source> {
  const out: Source = {
    files: [],
  };

  const pages = await getCollection('blog');

  for (const page of pages) {
    out.files.push({
      type: 'page',
      path: page.id,
      data: {
        title: page.data.title || page.id,
        description: page.data.description,
      },
    });
  }

  return out;
}

export function getBlogPosts(): CollectionEntry<'blog'>[] {
  return [];
}
