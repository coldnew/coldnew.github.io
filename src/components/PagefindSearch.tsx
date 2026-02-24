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
  const pagefindRef = useRef<PagefindInstance | null>(null);
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

  useEffect(() => {
    if (open && !pagefindLoadedRef.current) {
      const script = document.createElement('script');
      script.src = '/pagefind/pagefind.js';
      script.onload = () => {
        if (window.pagefind) {
          window.pagefind.init();
          pagefindRef.current = window.pagefind;
          pagefindLoadedRef.current = true;
        }
      };
      script.onerror = (err) => {
        console.error('Failed to load pagefind:', err);
      };
      document.head.appendChild(script);
    }
  }, [open]);

  useEffect(() => {
    if (!search.trim()) {
      setResults(defaultItems);
      return;
    }

    const pf = pagefindRef.current;
    if (!pf) {
      return;
    }

    let cancelled = false;

    const runSearch = async () => {
      setIsLoading(true);
      try {
        const searchResult = await pf.search(search);
        if (cancelled) return;

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
        if (cancelled) return;
        setResults(items);
      } catch (err) {
        if (cancelled) return;
        console.error('Search error:', err);
        setResults([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    const debounce = setTimeout(runSearch, 150);
    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [search, defaultItems]);

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
