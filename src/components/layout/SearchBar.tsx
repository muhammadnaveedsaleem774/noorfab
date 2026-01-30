"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Product } from "@/types";

const RECENT_KEY = "alnoor-recent-searches";
const MAX_RECENT = 5;
const DEBOUNCE_MS = 300;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(q: string) {
  if (!q.trim()) return;
  const recent = getRecentSearches().filter((r) => r.toLowerCase() !== q.trim().toLowerCase());
  recent.unshift(q.trim());
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    /* ignore */
  }
}

async function fetchSuggestions(q: string): Promise<Product[]> {
  if (!q.trim()) return [];
  const res = await fetch(`/api/products?q=${encodeURIComponent(q.trim())}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data.slice(0, 5) : [];
}

interface SearchBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchBar({ open, onOpenChange }: SearchBarProps) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  // Start empty so server and initial client render match; populate from localStorage in useEffect when open.
  const [recent, setRecent] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showDropdown = open && (value.trim().length > 0 ? true : recent.length > 0);
  const dropdownItems = value.trim()
    ? [...suggestions.map((p) => ({ type: "product" as const, product: p })), { type: "all" as const }]
    : recent.map((r) => ({ type: "recent" as const, query: r }));
  const totalItems = dropdownItems.length;

  const fetchSuggestionsDebounced = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query).then((data) => {
        setSuggestions(data);
        setLoading(false);
      });
      debounceRef.current = null;
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    if (value.trim()) fetchSuggestionsDebounced(value);
    else setSuggestions([]);
  }, [value, fetchSuggestionsDebounced]);

  useEffect(() => {
    if (open) {
      setRecent(getRecentSearches());
      setValue("");
      setHighlightedIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const goToSearch = useCallback(
    (query: string) => {
      if (query.trim()) addRecentSearch(query.trim());
      close();
      router.push(`${ROUTES.search}?q=${encodeURIComponent(query.trim())}`);
    },
    [close, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || totalItems === 0) {
      if (e.key === "Enter" && value.trim()) {
        e.preventDefault();
        goToSearch(value);
      }
      if (e.key === "Escape") close();
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => (i < totalItems - 1 ? i + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => (i > 0 ? i - 1 : totalItems - 1));
        break;
      case "Enter":
        e.preventDefault();
        const item = dropdownItems[highlightedIndex];
        if (item) {
          if (item.type === "product") goToSearch(item.product.name);
          else if (item.type === "all") goToSearch(value);
          else if (item.type === "recent") goToSearch(item.query);
        }
        break;
      case "Escape":
        close();
        break;
      default:
        break;
    }
  };

  const overlay = (
    <div
      className={
        isMobile
          ? "fixed inset-0 z-50 bg-white"
          : "absolute left-0 right-0 top-full z-50 mt-0 border-t border-border bg-white shadow-lg"
      }
    >
      <div className="container flex flex-col gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search products..."
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              className="pl-9 text-[#333333] placeholder:text-muted-foreground"
              autoComplete="off"
              aria-expanded={showDropdown}
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              id="search-input"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={close}
            className="shrink-0 text-[#333333] hover:text-[#C4A747]"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {showDropdown && (
          <div
            id="search-suggestions"
            ref={listRef}
            role="listbox"
            className="max-h-[min(60vh,400px)] overflow-y-auto rounded-md border border-border bg-white py-1"
          >
            {value.trim() && (
              <>
                {loading && (
                  <div className="px-4 py-2 text-sm text-muted-foreground">Searching...</div>
                )}
                {dropdownItems.map((item, index) => {
                    if (item.type === "product") {
                      return (
                        <Link
                          key={item.product.id}
                          href={`/products/${item.product.slug}`}
                          onClick={() => {
                            addRecentSearch(value.trim());
                            close();
                          }}
                          role="option"
                          data-index={index}
                          aria-selected={highlightedIndex === index}
                          className={`flex items-center gap-3 px-4 py-2.5 text-left text-sm text-[#333333] hover:bg-[#C4A747]/10 ${
                            highlightedIndex === index ? "bg-[#C4A747]/10" : ""
                          }`}
                        >
                          <span className="line-clamp-1">{item.product.name}</span>
                        </Link>
                      );
                    }
                    if (item.type === "all") {
                      return (
                        <button
                          key="view-all"
                          type="button"
                          onClick={() => goToSearch(value)}
                          role="option"
                          data-index={index}
                          aria-selected={highlightedIndex === index}
                          className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-[#C4A747] hover:bg-[#C4A747]/10 ${
                            highlightedIndex === index ? "bg-[#C4A747]/10" : ""
                          }`}
                        >
                          View all results for &ldquo;{value}&rdquo;
                        </button>
                      );
                    }
                    return (
                      <button
                        key={`recent-${item.query}-${index}`}
                        type="button"
                        onClick={() => goToSearch(item.query)}
                        role="option"
                        data-index={index}
                        aria-selected={highlightedIndex === index}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#333333] hover:bg-[#C4A747]/10 ${
                          highlightedIndex === index ? "bg-[#C4A747]/10" : ""
                        }`}
                      >
                        <Search className="h-4 w-4 text-muted-foreground" />
                        {item.query}
                      </button>
                    );
                  })}
              </>
            )}
            {!value.trim() &&
              recent.map((r, index) => (
                <button
                  key={`recent-${r}-${index}`}
                  type="button"
                  onClick={() => goToSearch(r)}
                  role="option"
                  data-index={index}
                  aria-selected={highlightedIndex === index}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#333333] hover:bg-[#C4A747]/10 ${
                    highlightedIndex === index ? "bg-[#C4A747]/10" : ""
                  }`}
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  {r}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );

  return open ? overlay : null;
}
