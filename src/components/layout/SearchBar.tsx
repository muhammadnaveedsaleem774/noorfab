"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Clock, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

const RECENT_KEY = "alnoor-recent-searches";
const MAX_RECENT = 3;
const MAX_SUGGESTIONS = 5;
const DEBOUNCE_MS = 300;
const MIN_CHARS_FOR_SUGGESTIONS = 2;
const POPULAR_SEARCHES = ["cotton", "linen", "shirt", "kurti", "palazzo"];

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
  const recent = getRecentSearches().filter(
    (r) => r.toLowerCase() !== q.trim().toLowerCase()
  );
  recent.unshift(q.trim());
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    /* ignore */
  }
}

function removeRecentSearch(q: string, e: React.MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  const recent = getRecentSearches().filter(
    (r) => r.toLowerCase() !== q.trim().toLowerCase()
  );
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {
    /* ignore */
  }
}

async function fetchSuggestions(q: string): Promise<Product[]> {
  if (!q.trim() || q.trim().length < MIN_CHARS_FOR_SUGGESTIONS) return [];
  const res = await fetch(`/api/products?q=${encodeURIComponent(q.trim())}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data.slice(0, MAX_SUGGESTIONS) : [];
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
  const [recent, setRecent] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasQuery = value.trim().length > 0;
  const showSuggestions = hasQuery && value.trim().length >= MIN_CHARS_FOR_SUGGESTIONS;
  const showRecent = !hasQuery && recent.length > 0;
  const showPopular = !hasQuery;
  const showDropdown =
    open &&
    (showSuggestions || showRecent || showPopular);

  const buildDropdownItems = () => {
    if (hasQuery && showSuggestions) {
      const productItems = suggestions.map((p) => ({
        type: "product" as const,
        product: p,
      }));
      return [
        ...productItems,
        { type: "all" as const },
      ];
    }
    if (showRecent) {
      return recent.map((r) => ({ type: "recent" as const, query: r }));
    }
    return [];
  };

  const dropdownItems = buildDropdownItems();
  const totalItems = dropdownItems.length + (showPopular ? POPULAR_SEARCHES.length : 0) + (hasQuery && showSuggestions ? 1 : 0);

  const fetchSuggestionsDebounced = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < MIN_CHARS_FOR_SUGGESTIONS) {
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
    if (value.trim().length >= MIN_CHARS_FOR_SUGGESTIONS) fetchSuggestionsDebounced(value);
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
    if (!showDropdown) {
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
        if (highlightedIndex >= 0 && highlightedIndex < dropdownItems.length) {
          const item = dropdownItems[highlightedIndex];
          if (item) {
            if (item.type === "product") goToSearch(item.product.name);
            else if (item.type === "all") goToSearch(value);
            else if (item.type === "recent") goToSearch(item.query);
          }
        } else if (value.trim()) {
          goToSearch(value);
        }
        break;
      case "Escape":
        close();
        break;
      default:
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  const inputClasses = isMobile
    ? "h-[52px] rounded-2xl pl-12 pr-4 text-base"
    : "h-11 w-full max-w-[400px] rounded-[22px] border-[1.5px] border-[#ddd] pl-11 pr-5 transition-all focus:border-[#C4A747] focus:shadow-lg focus:shadow-[#C4A747]/10";

  const overlay = (
    <div
      ref={containerRef}
      className={
        isMobile
          ? "fixed inset-0 z-50 flex flex-col bg-white"
          : "absolute left-0 right-0 top-full z-50 mt-2"
      }
    >
      <div
        className={
          isMobile
            ? "flex flex-1 flex-col px-4 pt-6"
            : "container flex flex-col px-4 py-3"
        }
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#999]"
              style={{ opacity: 0.5 }}
            />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#999]" />
            )}
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
              className={inputClasses}
              autoComplete="off"
              aria-expanded={showDropdown}
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              id="search-input"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            className="h-10 w-10 shrink-0 text-[#333333] hover:text-[#C4A747] md:h-11 md:w-11"
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
            className="mt-2 max-h-[min(85vh,400px)] overflow-y-auto rounded-xl border border-[#eee] bg-white py-2 shadow-lg md:mt-2 md:max-h-[400px] md:max-w-[400px]"
          >
            {/* Suggestions (when typing) */}
            {hasQuery && showSuggestions && (
              <>
                <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#999]">
                  You might be looking for...
                </p>
                {loading && (
                  <div className="flex items-center gap-2 px-4 py-4 text-sm text-[#999]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </div>
                )}
                {!loading &&
                  dropdownItems.map((item, index) => {
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
                          className={`flex items-center gap-4 px-4 py-3 text-left transition hover:bg-[#F5F3EE] ${
                            highlightedIndex === index ? "bg-[#F5F3EE]" : ""
                          }`}
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={item.product.images[0]?.url ?? "/placeholder.svg"}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[#333333]">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-[#333333]/70">
                              {formatPrice(item.product.salePrice ?? item.product.price)}
                            </p>
                          </div>
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
                          className={`flex w-full items-center justify-between px-4 py-3 text-left font-medium text-[#C4A747] transition hover:bg-[#F5F3EE] ${
                            highlightedIndex === index ? "bg-[#F5F3EE]" : ""
                          }`}
                        >
                          View all results for &ldquo;{value}&rdquo;
                          <span className="text-sm">→</span>
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
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#333333] transition hover:bg-[#F5F3EE] ${
                          highlightedIndex === index ? "bg-[#F5F3EE]" : ""
                        }`}
                      >
                        <Clock className="h-4 w-4 shrink-0 text-[#999]" />
                        {item.query}
                      </button>
                    );
                  })}
              </>
            )}

            {/* Recent (when empty) */}
            {!hasQuery && showRecent && (
              <>
                <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#999]">
                  Recent
                </p>
                {recent.map((r, index) => (
                  <button
                    key={`recent-${r}-${index}`}
                    type="button"
                    onClick={() => goToSearch(r)}
                    role="option"
                    data-index={index}
                    aria-selected={highlightedIndex === index}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm text-[#333333] transition hover:bg-[#F5F3EE] ${
                      highlightedIndex === index ? "bg-[#F5F3EE]" : ""
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Clock className="h-4 w-4 shrink-0 text-[#999]" />
                      {r}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        removeRecentSearch(r, e);
                        setRecent(getRecentSearches());
                      }}
                      className="rounded p-1 text-[#999] hover:bg-[#eee] hover:text-[#333333]"
                      aria-label={`Remove ${r}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </button>
                ))}
              </>
            )}

            {/* Popular */}
            {!hasQuery && showPopular && (
              <>
                <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#999]">
                  Popular
                </p>
                {POPULAR_SEARCHES.map((term, index) => (
                  <Link
                    key={term}
                    href={`${ROUTES.search}?q=${encodeURIComponent(term)}`}
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-3 text-left text-sm text-[#333333] transition hover:bg-[#F5F3EE]"
                  >
                    <TrendingUp className="h-4 w-4 shrink-0 text-[#999]" />
                    {term}
                  </Link>
                ))}
              </>
            )}

            {/* View all results - when typing */}
            {hasQuery && value.trim().length >= MIN_CHARS_FOR_SUGGESTIONS && (
              <div className="border-t border-[#eee] px-4 py-2">
                <button
                  type="button"
                  onClick={() => goToSearch(value)}
                  className="flex w-full items-center justify-between text-sm font-medium text-[#C4A747] hover:underline"
                >
                  View all results →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return open ? overlay : null;
}
