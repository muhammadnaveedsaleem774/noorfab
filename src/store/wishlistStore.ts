import { create } from "zustand";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";

const WISHLIST_STORAGE_KEY = "noor-g-wishlist";

type PersistedWishlist = { productIds: string[] };

interface WishlistState {
  productIds: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
}

function safeGetStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

const wishlistStorage: PersistStorage<PersistedWishlist> = {
  getItem: (name: string): StorageValue<PersistedWishlist> | null => {
    try {
      const raw = safeGetStorage()?.getItem(name) ?? null;
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StorageValue<PersistedWishlist>;
      return parsed?.state != null ? { state: parsed.state, version: parsed.version } : null;
    } catch (e) {
      console.warn("[wishlistStore] Failed to read from localStorage:", e);
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<PersistedWishlist>): void => {
    try {
      safeGetStorage()?.setItem(name, JSON.stringify(value));
    } catch (e) {
      console.warn("[wishlistStore] Failed to write to localStorage:", e);
    }
  },
  removeItem: (name: string): void => {
    try {
      safeGetStorage()?.removeItem(name);
    } catch (e) {
      console.warn("[wishlistStore] Failed to remove from localStorage:", e);
    }
  },
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      addToWishlist: (productId) => {
        if (!productId?.trim()) {
          console.warn("[wishlistStore] addToWishlist: invalid productId");
          return;
        }
        set((state) => {
          if (state.productIds.includes(productId)) return state;
          return { productIds: [...state.productIds, productId] };
        });
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        }));
      },

      clearWishlist: () => set({ productIds: [] }),

      isInWishlist: (productId) => get().productIds.includes(productId),
    }),
    {
      name: WISHLIST_STORAGE_KEY,
      storage: wishlistStorage,
      partialize: (state) => ({ productIds: state.productIds }),
    }
  )
);
