# Agent Guidelines for This Project

## Overview

This is an **Astro blog** project - a static site generator using Astro framework with TypeScript, MDX content collections, org-mode support, and minimal styling.

## Build Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally before deploying |
| `npm run astro <cmd` | Run Astro CLI commands (e.g., `astro add`, `astro check`) |
| `npm run lint` | Run Biome linting |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format code with Biome |

### Running a Single Test

**No test framework is currently configured.** To add testing: `npx astro add vitest` or `npx astro add playwright`

### Type Checking

Run `npx astro check` to type-check the entire project.

---

## Code Style Guidelines

### Commit Messages

This project uses **Conventional Commits**. Format:

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example: `feat(org): add convertOrgToMdx support`

---

## Code Style Guidelines

### File Organization

```
src/
├── components/     # Reusable UI components (.astro files)
├── content/      # Content collections (blog posts in blog/)
├── layouts/      # Page layouts
├── pages/        # File-based routing
├── styles/      # Global CSS
├── assets/      # Images, fonts, etc.
└── consts.ts    # Global constants

astro-org/        # Custom org-mode integration
└── src/
    ├── core/       # Org-MDX conversion library
    └── index.ts   # Astro integration entry point
```

### TypeScript Conventions

Uses **strict TypeScript** via `astro/tsconfigs/strict` with `strictNullChecks`. Prefer `type` over `interface`, use optional chaining (`?.`) and nullish coalescing (`??`).

### Astro Component Guidelines

**Frontmatter**: Import statements at top, define `Props` interface:

```astro
---
import type { ImageMetadata } from 'astro';

interface Props {
  title: string;
  description: string;
  image?: ImageMetadata;
}

const { title, description, image } = Astro.props;
---
```

**Template**: Use `class` (not `className`), prefer `aria-*` attributes for accessibility.

### Content Collections

Define schemas in `src/content.config.ts`. Supports `.md`, `.mdx`, and `.org` files:

```typescript
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx,org}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      pubDate: z.coerce.date().optional(),
      heroImage: image().optional(),
    }),
});
```

### Import Order

1. External libraries (`astro:`, `@astrojs/`)
2. Internal imports (relative paths)
3. Type imports (`import type`)

### Naming Conventions

- **Components**: PascalCase (`BaseHead.astro`)
- **Files**: kebab-case, PascalCase for components
- **Constants**: SCREAMING_SCREAM for config, camelCase for exports

### CSS Guidelines

Global styles in `src/styles/global.css`. Use CSS custom properties, keep styles minimal.

### Error Handling

Use try/catch for async operations, provide fallback values for optional props.

---

## Dependencies

Core dependencies: `astro`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, `sharp`, `uniorg-parse`, `uniorg-rehype`, `rehype-remark`, `remark-stringify`

---

## Common Tasks

### Adding a new blog post

**Markdown/MDX** (`src/content/blog/post.md`):
```markdown
---
title: 'Post Title'
description: 'Post description'
pubDate: '2024-01-01'
---
```

**Org-mode** (`src/content/blog/post.org`):
```org
#+TITLE: Post Title
#+DESCRIPTION: Post description
#+DATE: 2024-01-01
#+STARTUP: content
* My Post Content
```

---

## VSCode Extensions

See `.vscode/extensions.json` for recommended extensions.
