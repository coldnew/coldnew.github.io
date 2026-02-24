/**
 * Generate default title from filename
 */
export function generateDefaultTitle(filename: string): string {
  return filename
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
