import { visit } from 'unist-util-visit';
import type { AstNode, PluginContext } from '../types';

/**
 * Plugin to handle Org table alignment
 */
export function orgTableAlignment(context: PluginContext) {
  return (tree: AstNode) => {
    context.tableAlignments = [];
    let tableIndex = 0;

    visit(tree, 'table', (table: AstNode) => {
      const rows = table.children || [];

      // Check if we have at least 3 rows (header, separator, potential alignment)
      if (rows.length < 3) return;

      // Check if the third row contains alignment markers
      const alignmentRow = rows[2];
      if (!alignmentRow || (alignmentRow as any).rowType !== 'standard') return;

      const alignmentCells = alignmentRow.children || [];
      const alignments: (string | null)[] = [];

      // Extract alignment from each cell
      for (const cell of alignmentCells) {
        const text = (cell.children?.[0] as any)?.value?.trim();
        if (text === '<l>') {
          alignments.push('left');
        } else if (text === '<c>') {
          alignments.push('center');
        } else if (text === '<r>') {
          alignments.push('right');
        } else {
          alignments.push(null); // default (no alignment marker)
        }
      }

      // Check if this row actually contains alignment markers
      const hasAlignmentMarkers = alignments.some((align) => align !== null);
      if (!hasAlignmentMarkers) return;

      // Store alignment info with table index
      context.tableAlignments.push({ index: tableIndex++, alignments });

      // Check if the header row is empty - if so, use the data row as header
      const headerRow = rows[0];
      const dataRow = rows[3];

      if (headerRow && (headerRow as any).rowType === 'standard') {
        const headerCells = headerRow.children || [];
        const isEmptyHeader = headerCells.every(
          (cell: any) =>
            !cell.children ||
            !cell.children[0] ||
            !cell.children[0].value.trim()
        );

        if (isEmptyHeader && dataRow) {
          // Replace empty header with data row content
          headerRow.children = dataRow.children;
          // Remove the data row (now duplicated)
          table.children?.splice(3, 1);
        }
      }

      // Remove the alignment row from the table
      table.children?.splice(2, 1);
    });
  };
}
