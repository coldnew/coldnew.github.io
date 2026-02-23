# Agent Guidelines for This Project

## Overview

This is an **Astro blog** project - a static site generator using Astro framework with TypeScript, MDX content collections, org-mode support, and minimal styling.

## Build Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally before deploying |
| `npm run astro <cmd>` | Run Astro CLI commands (e.g., `astro add`, `astro check`) |

### Running a Single Test

**No test framework is currently configured.** To add testing: `npx astro add vitest` or `npx astro add playwright`

### Type Checking

Run `npx astro check` to type-check the entire project.

---

## Code Style Guidelines

### File Organization

```
src/
├── components/     # Reusable UI components (.astro files)
├── content/        # Content collections (blog posts in blog/)
├── layouts/        # Page layouts
├── pages/          # File-based routing
├── styles/         # Global CSS
├── assets/         # Images, fonts, etc.
└── consts.ts       # Global constants

astro-org/          # Custom org-mode integration (can be published as standalone)
└── src/
    └── index.ts    # Main integration code
```

### TypeScript Conventions

- Uses **strict TypeScript** via `astro/tsconfigs/strict` with `strictNullChecks`
- Prefer `type` over `interface` for simple object types
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safety

```typescript
// Good
const { title, description, image = FallbackImage } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
```

### Astro Component Guidelines

**Frontmatter (TypeScript)** - Import statements at top, define `Props` interface:

```astro
---
import type { ImageMetadata } from 'astro';
import FallbackImage from '../assets/blog-placeholder.jpg';

interface Props {
  title: string;
  description: string;
  image?: ImageMetadata;
}

const { title, description, image = FallbackImage } = Astro.props;
---

<!-- Template below -->
```

**Template Section** - Use `class` (not `className`), prefer `aria-*` attributes for accessibility

### Content Collections

Define schemas using Zod in `src/content.config.ts`. Use `image()` helper for images, `z.coerce.date()` for dates. The glob pattern supports `.md`, `.mdx`, and `.org` files:

```typescript
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx,org}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
    }),
});
```

### Import Order

1. External libraries (`astro:`, `@astrojs/`)
2. Internal imports (relative paths)
3. Type imports (`import type`)

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import type { ImageMetadata } from 'astro';
import FallbackImage from '../assets/blog-placeholder.jpg';
import { SITE_TITLE } from '../consts';
```

### Naming Conventions

- **Components**: PascalCase (`BaseHead.astro`, `BlogPost.astro`)
- **Files**: kebab-case for regular files, PascalCase for components
- **Constants**: SCREAMING_SCREAM for config, camelCase for exports
- **Props**: camelCase for destructured props

### CSS Guidelines

- Global styles in `src/styles/global.css`
- Use CSS custom properties for theme values
- Keep styles minimal

### Error Handling

- Use try/catch for async operations
- Provide fallback values for optional props
- Handle missing images gracefully (use FallbackImage pattern)

### Accessibility

- Always include `alt` text for images
- Use semantic HTML (`<main>`, `<nav>`, `<article>`, etc.)
- Include `meta` description for SEO
- Use proper heading hierarchy (h1 → h2 → h3)

---

## Dependencies

Core dependencies (do not remove): `astro`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, `sharp`, `astro-org`, `uniorg-parse`, `uniorg-rehype`

---

## Environment Variables

Create `.env` file for local development if needed. Not required for basic operation.

---

## Common Tasks

### Adding a new blog post
Create `.md`, `.mdx`, or `.org` file in `src/content/blog/` with frontmatter:
```markdown
---
title: 'Post Title'
description: 'Post description'
pubDate: '2024-01-01'
---
```

Org-mode files use #+TITLE, #+DESCRIPTION, #+DATE keywords:
```org
#+TITLE: Post Title
#+DESCRIPTION: Post description
#+DATE: 2024-01-01
#+STARTUP: content
* My Post Content
```

### Adding a new component/page
1. Create `.astro` file in `src/components/` or `src/pages/`
2. Import and use in layouts/pages

---

## VSCode Extensions

See `.vscode/extensions.json` for recommended extensions.
