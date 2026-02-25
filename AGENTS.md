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

astro/
├── mdx/          # Custom MDX integration for Astro
│   └── src/
│       ├── integration.ts  # Astro integration with getRenderModule
│       ├── vite-plugin.ts  # Vite plugin for MDX compilation
│       └── server.ts       # Server-side JSX renderer
└── org/          # Custom org-mode integration
    └── src/
        ├── core/           # Org→MDX conversion library
        ├── index.ts        # Astro integration entry point
        └── toolbar-app.ts  # Dev toolbar extension
```

### Org-Mode Rendering Pipeline

Org-mode files (`.org`) are rendered via the following pipeline:

1. **Conversion**: `astro/org/src/core/` converts org-mode to MDX using `uniorg-parse` → `uniorg-rehype` → `rehype-remark` → `remark-stringify`
2. **Compilation**: The generated MDX is compiled to JSX using `@mdx-js/mdx` with the same plugins as `.mdx` files
3. **Rendering**: `astro/mdx/src/server.ts` renders the JSX to HTML

Both `astro/mdx` and `astro/org` integrations use `getRenderModule` for deferred rendering, enabling proper dev mode support.

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

Core dependencies: `astro`, `@astrojs/sitemap`, `@astrojs/rss`, `sharp`, `uniorg-parse`, `uniorg-rehype`, `rehype-remark`, `remark-stringify`, `@mdx-js/mdx`

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

<!-- gitnexus:start -->
# GitNexus MCP

This project is indexed by GitNexus as **blog** (11655 symbols, 31078 relationships, 300 execution flows).

GitNexus provides a knowledge graph over this codebase — call chains, blast radius, execution flows, and semantic search.

## Always Start Here

For any task involving code understanding, debugging, impact analysis, or refactoring, you must:

1. **Read `gitnexus://repo/{name}/context`** — codebase overview + check index freshness
2. **Match your task to a skill below** and **read that skill file**
3. **Follow the skill's workflow and checklist**

> If step 1 warns the index is stale, run `npx gitnexus analyze` in the terminal first.

## Skills

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/refactoring/SKILL.md` |

## Tools Reference

| Tool | What it gives you |
|------|-------------------|
| `query` | Process-grouped code intelligence — execution flows related to a concept |
| `context` | 360-degree symbol view — categorized refs, processes it participates in |
| `impact` | Symbol blast radius — what breaks at depth 1/2/3 with confidence |
| `detect_changes` | Git-diff impact — what do your current changes affect |
| `rename` | Multi-file coordinated rename with confidence-tagged edits |
| `cypher` | Raw graph queries (read `gitnexus://repo/{name}/schema` first) |
| `list_repos` | Discover indexed repos |

## Resources Reference

Lightweight reads (~100-500 tokens) for navigation:

| Resource | Content |
|----------|---------|
| `gitnexus://repo/{name}/context` | Stats, staleness check |
| `gitnexus://repo/{name}/clusters` | All functional areas with cohesion scores |
| `gitnexus://repo/{name}/cluster/{clusterName}` | Area members |
| `gitnexus://repo/{name}/processes` | All execution flows |
| `gitnexus://repo/{name}/process/{processName}` | Step-by-step trace |
| `gitnexus://repo/{name}/schema` | Graph schema for Cypher |

## Graph Schema

**Nodes:** File, Function, Class, Interface, Method, Community, Process
**Edges (via CodeRelation.type):** CALLS, IMPORTS, EXTENDS, IMPLEMENTS, DEFINES, MEMBER_OF, STEP_IN_PROCESS

```cypher
MATCH (caller)-[:CodeRelation {type: 'CALLS'}]->(f:Function {name: "myFunc"})
RETURN caller.name, caller.filePath
```

<!-- gitnexus:end -->
