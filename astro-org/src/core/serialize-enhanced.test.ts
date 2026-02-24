import { describe, expect, it } from 'vitest';
import { convertOrgToMdx } from './serialize';

describe('serialize - enhanced frontmatter processing', () => {
  it('should convert TAGS and CATEGORIES to arrays', async () => {
    const orgContent = `#+TITLE: Test Document
#+TAGS: emacs, org-mode, documentation
#+CATEGORIES: tech; tutorial; guide
#+AUTHOR: John Doe
#+DATE: 2024-01-15

Some content here.`;

    const result = await convertOrgToMdx(orgContent, 'test.org');

    // Check that frontmatter contains arrays for plural keywords
    expect(result.frontmatter).toContain('tags:');
    expect(result.frontmatter).toContain('categories:');
    expect(result.frontmatter).toContain('- emacs');
    expect(result.frontmatter).toContain('- org-mode');
    expect(result.frontmatter).toContain('- documentation');
    expect(result.frontmatter).toContain('- tech');
    expect(result.frontmatter).toContain('- tutorial');
    expect(result.frontmatter).toContain('- guide');
  });

  it('should handle single values in plural keywords', async () => {
    const orgContent = `#+TITLE: Test Document
#+TAGS: single-tag
#+CATEGORIES: tech

Some content here.`;

    const result = await convertOrgToMdx(orgContent, 'test.org');

    // Single values are converted to arrays by plural processor
    expect(result.frontmatter).toContain('tags:');
    expect(result.frontmatter).toContain('- single-tag');
    expect(result.frontmatter).toContain('categories:');
    expect(result.frontmatter).toContain('- tech');
  });

  it('should handle mixed delimiters in plural keywords', async () => {
    const orgContent = `#+TITLE: Test Document
#+TAGS: item1, item2;item3 item4
#+CATEGORIES: cat1;cat2, cat3

Some content here.`;

    const result = await convertOrgToMdx(orgContent, 'test.org');

    // Should handle all delimiters correctly
    expect(result.frontmatter).toContain('- item1');
    expect(result.frontmatter).toContain('- item2');
    expect(result.frontmatter).toContain('- item3');
    expect(result.frontmatter).toContain('- item4');
    expect(result.frontmatter).toContain('- cat1');
    expect(result.frontmatter).toContain('- cat2');
    expect(result.frontmatter).toContain('- cat3');
  });

  it('should filter out empty values in plural keywords', async () => {
    const orgContent = `#+TITLE: Test Document
#+TAGS: item1; ; item2; 
#+CATEGORIES: ; ; 

Some content here.`;

    const result = await convertOrgToMdx(orgContent, 'test.org');

    // Should filter out empty items
    expect(result.frontmatter).toContain('- item1');
    expect(result.frontmatter).toContain('- item2');
    // Empty categories should result in empty array
    expect(result.frontmatter).toContain('categories: []');
  });

  it('should process boolean and numeric keywords', async () => {
    const orgContent = `#+TITLE: Test Document
#+DRAFT: yes
#+PUBLISHED: true
#+PRIORITY: 1
#+WEIGHT: 5.5
#+ARCHIVED: false

Some content here.`;

    const result = await convertOrgToMdx(orgContent, 'test.org');

    // Should convert boolean and numeric values
    expect(result.frontmatter).toContain('draft: true');
    expect(result.frontmatter).toContain('published: true');
    expect(result.frontmatter).toContain('priority: 1');
    expect(result.frontmatter).toContain('weight: 5.5');
    expect(result.frontmatter).toContain('archived: false');
  });

  it('should apply field mappings', async () => {
    const orgContent = `#+TITLE: Test Document
#+FILETAGS: important, work
#+EMAIL: author@example.com

Some content here.`;

    const result = await convertOrgToMdx(orgContent, 'test.org');

    // Should apply field mappings
    expect(result.frontmatter).toContain('tags:');
    expect(result.frontmatter).toContain('- important');
    expect(result.frontmatter).toContain('- work');
    expect(result.frontmatter).toContain('author_email: author@example.com');
  });

  it('should skip keywords in skip list', async () => {
    const orgContent = `#+TITLE: Test Document
#+OPTIONS: toc:t
#+LATEX_HEADER: \\usepackage{amsmath}
#+INCLUDE: "file.org"
#+TAGS: test

Some content here.`;

    const result = await convertOrgToMdx(orgContent, 'test.org');

    // Should include tags but skip options, latex_header, and include
    expect(result.frontmatter).toContain('tags:');
    expect(result.frontmatter).toContain('- test');
    expect(result.frontmatter).not.toContain('options:');
    expect(result.frontmatter).not.toContain('latex_header:');
    expect(result.frontmatter).not.toContain('include:');
  });
});
