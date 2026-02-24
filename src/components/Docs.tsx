import { FrameworkProvider } from 'fumadocs-core/framework';
import type { Root } from 'fumadocs-core/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { DocsPage, type DocsPageProps } from 'fumadocs-ui/layouts/docs/page';
import { RootProvider } from 'fumadocs-ui/provider/base';
import type { ReactNode } from 'react';
import { PagefindSearchDialog } from './PagefindSearch';

interface DocsProps {
  tree: Root;
  children: ReactNode;
  pathname: string;
  params?: Record<string, string | string[]>;
  page?: DocsPageProps;
  disableBreadcrumb?: boolean;
  disableFooter?: boolean;
}

export function Docs({
  tree,
  children,
  pathname,
  params = {},
  page,
  disableBreadcrumb = false,
  disableFooter = false,
}: DocsProps) {
  return (
    <FrameworkProvider
      usePathname={() => pathname}
      useParams={() => params}
      useRouter={() => ({
        push(path) {
          window.location.href = path;
        },
        refresh() {
          window.location.reload();
        },
      })}
    >
      <RootProvider
        theme={{
          defaultTheme: 'dark',
          enabled: true,
        }}
        search={{
          SearchDialog: PagefindSearchDialog,
        }}
      >
        <DocsLayout
          tree={tree}
          nav={{
            title: 'My Blog',
          }}
          links={[
            {
              text: 'Home',
              url: '/',
            },
            {
              text: 'Blog',
              url: '/blog',
            },
            {
              text: 'About',
              url: '/about',
            },
          ]}
        >
          <DocsPage
            {...page}
            breadcrumb={
              disableBreadcrumb ? { enabled: false } : page?.breadcrumb
            }
            footer={disableFooter ? { enabled: false } : page?.footer}
          >
            {children}
          </DocsPage>
        </DocsLayout>
      </RootProvider>
    </FrameworkProvider>
  );
}
