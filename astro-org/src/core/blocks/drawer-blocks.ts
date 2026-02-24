import type { BlockContext } from './types';

/**
 * Process drawer blocks in org content
 * Converts :drawername: ... :end: to accordion JSX
 */
export function processDrawerBlocks(
  content: string,
  context: BlockContext
): string {
  // Match drawer blocks: :drawername: ... :end:
  // The regex uses non-greedy matching to handle nested content
  const drawerRegex = /:([a-zA-Z][a-zA-Z0-9_]*):\s*\n([\s\S]*?)\s*:end:/g;

  let result = content;
  let match;
  let index = 0;

  while ((match = drawerRegex.exec(content)) !== null) {
    const [, drawerName, drawerContent] = match;

    // Skip special drawers that shouldn't be converted to accordions
    if (shouldSkipDrawer(drawerName)) {
      continue;
    }

    // Create unique ID for the accordion
    const accordionId = `drawer-${index++}`;

    // Convert drawer to accordion JSX
    const accordionJSX = createAccordionJSX(
      drawerName,
      drawerContent,
      accordionId
    );

    // Replace the drawer block with the accordion
    result = result.replace(match[0], accordionJSX);
  }

  return result;
}

/**
 * Restore drawer blocks in markdown (no-op for accordions)
 */
export function restoreDrawerBlocks(
  markdown: string,
  context: BlockContext
): string {
  // Accordions are final output, no restoration needed
  return markdown;
}

/**
 * Check if a drawer should be skipped (not converted to accordion)
 */
function shouldSkipDrawer(drawerName: string): boolean {
  // Skip common special drawers that shouldn't be converted to accordions
  const skipDrawers = new Set([
    'properties',
    'logbook',
    'clock',
    'effort',
    'task',
  ]);

  return skipDrawers.has(drawerName.toLowerCase());
}

/**
 * Create accordion JSX for a drawer
 */
function createAccordionJSX(
  title: string,
  content: string,
  id: string
): string {
  // Convert drawer name to readable title
  const displayTitle = title
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Handle camelCase
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // Process the content (convert org markup to markdown)
  const processedContent = processDrawerContent(content);

  return `\n\n<Accordions type="single" collapsible>
  <Accordion title="${displayTitle}" id="${id}">
${processedContent}
  </Accordion>
</Accordions>\n\n`;
}

/**
 * Process drawer content (basic org to markdown conversion)
 */
function processDrawerContent(content: string): string {
  // For drawers, preserve the content as-is
  return content;
}
