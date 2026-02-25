import {
  CodeBlock,
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  Pre,
} from 'fumadocs-ui/components/codeblock';
import type { HTMLAttributes, ReactNode } from 'react';

export const components = {
  pre: (props: HTMLAttributes<HTMLPreElement> & { children?: ReactNode }) => {
    return (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    );
  },
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
};

export default components;
