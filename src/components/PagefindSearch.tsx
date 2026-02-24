'use client';

import { useRouter } from 'fumadocs-core/framework';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
} from 'fumadocs-ui/components/dialog/search';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface PagefindResult {
  url: string;
  meta: {
    title: string;
  };
  excerpt: string;
  sub_results: Array<{
    title: string;
    url: string;
    excerpt: string;
  }>;
}

interface PagefindSearchResult {
  results: Array<{
    data: () => Promise<PagefindResult>;
  }>;
}

interface PagefindModule {
  init: () => Promise<void>;
  search: (query: string) => Promise<PagefindSearchResult>;
}

interface PagefindSearchDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  links?: Array<[string, string]>;
}

export function PagefindSearchDialog({
  open = false,
  onOpenChange = () => {},
  links = [],
}: PagefindSearchDialogProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<
    Array<{ type: 'page' | 'text'; id: string; content: string; url: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const pagefindRef = useRef<PagefindModule | null>(null);
  const pagefindLoadedRef = useRef(false);
  const defaultItems = useMemo(
    () =>
      links.map(([name, link]) => ({
        type: 'page' as const,
        id: name,
        content: name,
        url: link,
      })),
    [links]
  );

  const searchRef = useRef(search);
  searchRef.current = search;

  const runSearch = useCallback(
    async (query: string) => {
      const pf = pagefindRef.current;
      if (!pf) {
        return;
      }

      if (!query.trim()) {
        setResults(defaultItems);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResult = await pf.search(query);
        const items = await Promise.all(
          searchResult.results.slice(0, 10).flatMap(async (r) => {
            const data = await r.data();
            const pageItem = {
              type: 'page' as const,
              id: data.url,
              content: data.meta.title,
              url: data.url,
            };
            const subItems = (data.sub_results ?? [])
              .slice(0, 3)
              .map((sub, idx) => ({
                type: 'text' as const,
                id: `${data.url}#${idx}`,
                content: `${data.meta.title}: ${sub.excerpt.replace(/<[^>]*>/g, '')}`,
                url: sub.url || data.url,
              }));
            return [pageItem, ...subItems];
          })
        );
        setResults(items.flat());
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [defaultItems]
  );

  useEffect(() => {
    if (open && !pagefindLoadedRef.current) {
      const loadPagefind = async () => {
        try {
          const pagefindModule = (await import(
            /* @vite-ignore */
            '/pagefind/pagefind.js?url'.replace('?url', '').replace('?', '')
          )) as unknown as PagefindModule;
          await pagefindModule.init();
          pagefindRef.current = pagefindModule;
          pagefindLoadedRef.current = true;
          if (searchRef.current.trim()) {
            runSearch(searchRef.current);
          }
        } catch (err) {
          console.error('Failed to load pagefind:', err);
        }
      };
      loadPagefind();
    }
  }, [open, runSearch]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      runSearch(value);
    },
    [runSearch]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSelect = useCallback(
    (item: any) => {
      if (item.url) {
        router.push(item.url);
      }
      onOpenChange(false);
    },
    [router, onOpenChange]
  );

  return (
    <SearchDialog
      open={open}
      onOpenChange={onOpenChange}
      search={search}
      onSearchChange={handleSearchChange}
      isLoading={isLoading}
      onSelect={onSelect}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={results.length > 0 ? results : defaultItems} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
