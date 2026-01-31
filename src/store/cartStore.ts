import { create } from "zustand";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";
import type { Product } from "@/types";

const CART_STORAGE_KEY = "noor-g-cart";
const CART_EXPIRY_DAYS = 30;
const CART_EXPIRY_MS = CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export interface CartStoreItem {
  id: string;
  product: Product;
  variantSKU: string;
  quantity: number;
}

type PersistedCart = { items: CartStoreItem[] };

interface CartState {
  items: CartStoreItem[];
  addToCart: (product: Product, variantSKU: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

function generateItemId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function safeGetStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

const cartStorage: PersistStorage<PersistedCart> = {
  getItem: (name: string): StorageValue<PersistedCart> | null => {
    try {
      const storage = safeGetStorage();
      if (!storage) return null;
      const raw = storage.getItem(name);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        state?: PersistedCart;
        savedAt?: number;
        version?: number;
      };
      const savedAt = parsed?.savedAt;
      if (typeof savedAt === "number" && Date.now() - savedAt > CART_EXPIRY_MS) {
        storage.removeItem(name);
        return { state: { items: [] }, version: parsed?.version ?? 0 };
      }
      if (parsed?.state) {
        return { state: parsed.state, version: parsed.version };
      }
      return null;
    } catch (e) {
      console.warn("[cartStore] Failed to read from localStorage:", e);
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<PersistedCart>): void => {
    try {
      const storage = safeGetStorage();
      if (!storage) return;
      const withExpiry = { ...value, savedAt: Date.now() };
      storage.setItem(name, JSON.stringify(withExpiry));
    } catch (e) {
      console.warn("[cartStore] Failed to write to localStorage:", e);
    }
  },
  removeItem: (name: string): void => {
    try {
      safeGetStorage()?.removeItem(name);
    } catch (e) {
      console.warn("[cartStore] Failed to remove from localStorage:", e);
    }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, variantSKU, quantity) => {
        if (quantity <= 0) return;
        const variant = product.variants.find((v) => v.variantSKU === variantSKU);
        if (!variant) {
          console.warn("[cartStore] addToCart: variant not found", { productId: product.id, variantSKU });
          return;
        }
        if (variant.stock < quantity) {
          console.warn("[cartStore] addToCart: insufficient stock", { variantSKU, stock: variant.stock, quantity });
        }
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id && i.variantSKU === variantSKU
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: generateItemId(),
                product,
                variantSKU,
                quantity,
              },
            ],
          };
        });
      },

      removeFromCart: (itemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () =>
        get().items.reduce((sum, i) => sum + (i.product.salePrice ?? i.product.price) * i.quantity, 0),

      getCartItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: { getItem: cartStorage.getItem, setItem: cartStorage.setItem, removeItem: cartStorage.removeItem },
      partialize: (state) => ({ items: state.items }),
    }
  )
);
