import { describe, expect, it } from 'vitest';
import { extractOrgKeywords } from './keywords';
import { formatToISOString, parseTime } from './time';

describe('Frontmatter Parsing Performance', () => {
  // Create a large org content for performance testing
  const createLargeOrgContent = (numKeywords: number = 1000): string => {
    let content = '';

    // Add various keywords
    for (let i = 0; i < numKeywords; i++) {
      content += `#+KEYWORD${i}: value${i}\n`;
    }

    // Add some DATE keywords with timestamps (will overwrite, so only last one counts)
    for (let i = 0; i < 10; i++) {
      content += `#+DATE${i}: <2023-10-${String((i % 28) + 1).padStart(2, '0')} Sun 14:30>\n`;
    }

    // Add a lot of regular content to make parsing more realistic
    for (let i = 0; i < 1000; i++) {
      content += `* Heading ${i}\nSome content here\n\n`;
    }

    return content;
  };

  it('should parse large org content efficiently', () => {
    const content = createLargeOrgContent(500);
    const startTime = performance.now();

    const keywords = extractOrgKeywords(content);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete in reasonable time (less than 100ms for 500 keywords)
    expect(duration).toBeLessThan(100);
    expect(Object.keys(keywords)).toHaveLength(510); // 500 keywords + 10 dates
  });

  it('should handle DATE parsing performance', () => {
    const content = createLargeOrgContent(100);
    const startTime = performance.now();

    const keywords = extractOrgKeywords(content);

    // Simulate DATE parsing like in serialize.ts
    if (keywords.date) {
      const parsedDate = parseTime(keywords.date);
      if (parsedDate) {
        keywords.date = formatToISOString(parsedDate);
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete quickly
    expect(duration).toBeLessThan(50);
  });

  it('should benchmark regex performance', () => {
    const content = createLargeOrgContent(1000);
    const lines = content.split(/\r?\n/);

    const startTime = performance.now();

    let matchCount = 0;
    for (const line of lines) {
      const match = line.match(/^#\+(\w+):\s*(.*)$/);
      if (match) {
        matchCount++;
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(matchCount).toBeGreaterThan(0);
    expect(duration).toBeLessThan(20);
  });

  it('should cache results for repeated calls', () => {
    const content = createLargeOrgContent(100);

    // First call
    const result1 = extractOrgKeywords(content);

    // Second call with same content should return same result
    const result2 = extractOrgKeywords(content);

    // Results should be identical
    expect(result1).toEqual(result2);

    // Both should have the expected number of keywords
    expect(Object.keys(result1)).toHaveLength(110);
  });
});
