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
import { useCallback, useEffect, useState } from 'react';

interface PagefindResult {
  url: string;
  meta: {
    title: string;
  };
  excerpt: string;
  score: number;
}

interface PagefindSearchResult {
  results: Array<{
    result: PagefindResult;
  }>;
}

interface PagefindSearchDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  links?: Array<[string, string]>;
}

declare global {
  interface Window {
    pagefind?: {
      init: () => Promise<void>;
      search: (query: string) => Promise<PagefindSearchResult>;
    };
  }
}

export function PagefindSearchDialog({
  open,
  onOpenChange,
  links = [],
}: PagefindSearchDialogProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<
    Array<{ type: 'page'; id: string; content: string; url: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagefindLoaded, setPagefindLoaded] = useState(false);

  useEffect(() => {
    if (open && !pagefindLoaded) {
      import('@pagefind/default-ui')
        .then((pagefind) => {
          window.pagefind = pagefind as unknown as typeof window.pagefind;
          window.pagefind?.init();
          setPagefindLoaded(true);
        })
        .catch((err) => {
          console.error('Failed to load pagefind:', err);
        });
    }
  }, [open, pagefindLoaded]);

  useEffect(() => {
    if (!search.trim()) {
      const defaultItems = links.map(([name, link]) => ({
        type: 'page' as const,
        id: name,
        content: name,
        url: link,
      }));
      setResults(defaultItems);
      return;
    }

    const runSearch = async () => {
      if (!window.pagefind) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResult = await window.pagefind.search(search);
        const items = searchResult.results.slice(0, 10).map((r) => ({
          type: 'page' as const,
          id: r.result.url,
          content: r.result.meta.title,
          url: r.result.url,
        }));
        setResults(items);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(runSearch, 150);
    return () => clearTimeout(debounce);
  }, [search, links]);

  const onSelect = useCallback(
    (item: { type: string; url: string }) => {
      if (item.url) {
        router.push(item.url);
      }
      onOpenChange?.(false);
    },
    [router, onOpenChange]
  );

  return (
    <SearchDialog
      open={open}
      onOpenChange={onOpenChange}
      search={search}
      onSearchChange={setSearch}
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
        <SearchDialogList items={results.length > 0 ? results : null} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
