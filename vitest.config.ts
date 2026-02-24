import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['astro-org/**/*.test.ts'],
  },
});
