import { describe, expect, it } from 'vitest';
import { extractOrgKeywords } from './keywords';

describe('extractOrgKeywords', () => {
  it('should extract TITLE keyword', () => {
    const content = `#+TITLE: My Document

Some content here.`;

    const result = extractOrgKeywords(content);

    expect(result).toEqual({
      title: 'My Document',
    });
  });

  it('should extract multiple keywords', () => {
    const content = `#+TITLE: Test Document
#+AUTHOR: John Doe
#+DESCRIPTION: A test document
#+DATE: 2024-01-01

Content here.`;

    const result = extractOrgKeywords(content);

    expect(result).toEqual({
      title: 'Test Document',
      author: 'John Doe',
      description: 'A test document',
      date: '2024-01-01',
    });
  });

  it('should handle keywords with special characters', () => {
    const content = `#+TITLE: Document with (special) [chars] & symbols!
#+DESCRIPTION: Description with "quotes" and 'apostrophes'`;

    const result = extractOrgKeywords(content);

    expect(result).toEqual({
      title: 'Document with (special) [chars] & symbols!',
      description: 'Description with "quotes" and \'apostrophes\'',
    });
  });

  it('should skip options keyword', () => {
    const content = `#+OPTIONS: toc:nil num:nil
#+TITLE: Document Title`;

    const result = extractOrgKeywords(content);

    expect(result).toEqual({
      title: 'Document Title',
    });
  });

  it('should skip latex_header keyword', () => {
    const content = `#+LATEX_HEADER: \\usepackage{amsmath}
#+TITLE: Math Document`;

    const result = extractOrgKeywords(content);

    expect(result).toEqual({
      title: 'Math Document',
    });
  });

  it('should extract date keyword', () => {
    const content = `#+DATE: 2024-01-01
#+TITLE: Dated Document`;

    const result = extractOrgKeywords(content);

    expect(result).toEqual({
      title: 'Dated Document',
      date: '2024-01-01',
    });
  });

  it('should handle keywords with extra whitespace', () => {
    const content = `#+TITLE:   Spaced Title
#+AUTHOR:Trailing Spaces   `;

    const result = extractOrgKeywords(content);

    expect(result).toEqual({
      title: 'Spaced Title',
      author: 'Trailing Spaces',
    });
  });

  it('should handle keywords in different cases', () => {
    const content = `#+title: Lowercase Title
#+Author: Mixed Case Author`;

    const result = extractOrgKeywords(content);

    expect(result).toEqual({
      title: 'Lowercase Title',
      author: 'Mixed Case Author',
    });
  });

  it('should handle keywords with colons in values', () => {
    const content = `#+TITLE: Document: Subtitle
#+DESCRIPTION: Time: 10:30 AM`;

    const result = extractOrgKeywords(content);

    expect(result).toEqual({
      title: 'Document: Subtitle',
      description: 'Time: 10:30 AM',
    });
  });

  it('should handle multiple occurrences of same keyword', () => {
    const content = `#+TITLE: First Title
#+TITLE: Second Title
#+AUTHOR: Author Name`;

    const result = extractOrgKeywords(content);

    // Should take the last occurrence
    expect(result).toEqual({
      title: 'Second Title',
      author: 'Author Name',
    });
  });

  it('should handle keywords at different positions in content', () => {
    const content = `Some initial content.

#+TITLE: Document Title

More content.

#+AUTHOR: Author Name

Final content.`;

    const result = extractOrgKeywords(content);

    expect(result).toEqual({
      title: 'Document Title',
      author: 'Author Name',
    });
  });

  it('should handle empty keyword values', () => {
    const content = `#+TITLE:
#+AUTHOR: Valid Author`;

    const result = extractOrgKeywords(content);

    expect(result).toEqual({
      title: '',
      author: 'Valid Author',
    });
  });

  it('should return empty object when no keywords found', () => {
    const content = `Just regular content
with no keywords.`;

    const result = extractOrgKeywords(content);

    expect(result).toEqual({});
  });

  it('should handle malformed keywords', () => {
    const content = `#+TITLE Document without colon
#+TITLE: Valid Title
#COMMENT: Not a keyword`;

    const result = extractOrgKeywords(content);

    expect(result).toEqual({
      title: 'Valid Title',
    });
  });
});
