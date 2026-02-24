import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx,org}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      pubDate: z.coerce.date().optional().default(new Date()),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      date: z.string().optional(),
    }),
});

export const collections = { blog };
