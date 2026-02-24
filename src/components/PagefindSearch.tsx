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
}

interface PagefindInstance {
  init: () => Promise<void>;
  search: (query: string) => Promise<{
    results: Array<{ data: () => Promise<PagefindResult> }>;
  }>;
}

interface PagefindSearchDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  links?: Array<[string, string]>;
}

declare global {
  interface Window {
    pagefind?: PagefindInstance;
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
  const [pagefindInstance, setPagefindInstance] =
    useState<PagefindInstance | null>(null);

  useEffect(() => {
    if (open && !pagefindInstance) {
      const script = document.createElement('script');
      script.src = '/pagefind/pagefind.js';
      script.onload = () => {
        if (window.pagefind) {
          window.pagefind.init();
          setPagefindInstance(window.pagefind);
        }
      };
      script.onerror = (err) => {
        console.error('Failed to load pagefind:', err);
      };
      document.head.appendChild(script);
    }
  }, [open, pagefindInstance]);

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

    if (!pagefindInstance) {
      return;
    }

    const runSearch = async () => {
      setIsLoading(true);
      try {
        const searchResult = await pagefindInstance.search(search);
        const items = await Promise.all(
          searchResult.results.slice(0, 10).map(async (r) => {
            const data = await r.data();
            return {
              type: 'page' as const,
              id: data.url,
              content: data.meta.title,
              url: data.url,
            };
          })
        );
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
  }, [search, links, pagefindInstance]);

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
