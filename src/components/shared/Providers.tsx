"use client";

import { QueryClient, QueryClientProvider } from "react-query";
import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useState } from "react";
import { ToastProvider } from "@/components/ui/toast";

// Search overlay state - shared by Header and BottomNav
const SearchOpenContext = createContext<{
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
} | null>(null);

export function useSearchOpen() {
  const ctx = useContext(SearchOpenContext);
  if (!ctx) throw new Error("useSearchOpen must be used within Providers");
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SearchOpenContext.Provider value={{ searchOpen, setSearchOpen }}>
          <ToastProvider>{children}</ToastProvider>
        </SearchOpenContext.Provider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
