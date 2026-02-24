import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx,org}' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        pubDate: z.coerce.date().optional(),
        updatedDate: z.coerce.date().optional(),
        heroImage: image().optional(),
        date: z.coerce.date().optional(),
      })
      .transform((entry) => ({
        ...entry,
        pubDate: entry.pubDate ?? entry.date ?? new Date(),
      })),
});

export const collections = { blog };
