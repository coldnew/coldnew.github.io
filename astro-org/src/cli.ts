#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join } from 'node:path';
import { convertMdxToOrg, convertOrgToMdx } from './core/index.js';

const USAGE = `
astro-org - Convert between Org-mode and MDX formats

Usage:
  astro-org <input> [output]    Auto-detect format and convert
  astro-org --help              Show this help message

Auto-detection:
  - .org files → converted to .mdx
  - .md, .mdx files → converted to .org

Examples:
  astro-org document.org              # Converts to document.mdx
  astro-org document.org output.mdx   # Converts to output.mdx
  astro-org post.md                   # Converts to post.org
  astro-org post.mdx post.org         # Converts to post.org

If output file is not specified, the result is written to stdout.
`;

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(USAGE);
    process.exit(0);
  }

  const inputFile = args[0];
  const outputFile = args[1];

  try {
    const inputContent = await readFile(inputFile, 'utf-8');
    const inputBasename = basename(inputFile);
    const inputExt = extname(inputFile).toLowerCase();
    const inputDir = dirname(inputFile);

    let result: string;
    let defaultOutput: string;

    if (inputExt === '.org') {
      const conversion = await convertOrgToMdx(inputContent, inputBasename);
      result = conversion.frontmatter + conversion.markdown;
      defaultOutput = join(inputDir, basename(inputFile, '.org') + '.mdx');
    } else if (inputExt === '.md' || inputExt === '.mdx') {
      const conversion = await convertMdxToOrg(inputContent, inputBasename);
      result = conversion.org;
      defaultOutput = join(inputDir, basename(inputFile, inputExt) + '.org');
    } else {
      console.error(`Error: Unsupported file extension "${inputExt}"`);
      console.error('Supported formats: .org, .md, .mdx');
      process.exit(1);
    }

    if (outputFile) {
      await writeFile(outputFile, result);
      console.log(`Written to: ${outputFile}`);
    } else if (process.stdout.isTTY) {
      await writeFile(defaultOutput, result);
      console.log(`Written to: ${defaultOutput}`);
    } else {
      process.stdout.write(result);
    }
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
