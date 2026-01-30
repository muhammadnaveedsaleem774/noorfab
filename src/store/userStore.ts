import { create } from "zustand";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";
import type { User } from "@/types";

const USER_STORAGE_KEY = "al-noor-user";

type UserProfileUpdate = Partial<
  Pick<User, "fullName" | "phone" | "profileImage" | "email">
>;

type PersistedUser = { user: User | null; isAuthenticated: boolean };

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  updateProfile: (data: UserProfileUpdate) => void;
}

function safeGetStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

const userStorage: PersistStorage<PersistedUser> = {
  getItem: (name: string): StorageValue<PersistedUser> | null => {
    try {
      const raw = safeGetStorage()?.getItem(name) ?? null;
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StorageValue<PersistedUser>;
      return parsed?.state != null ? { state: parsed.state, version: parsed.version } : null;
    } catch (e) {
      console.warn("[userStore] Failed to read from localStorage:", e);
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<PersistedUser>): void => {
    try {
      safeGetStorage()?.setItem(name, JSON.stringify(value));
    } catch (e) {
      console.warn("[userStore] Failed to write to localStorage:", e);
    }
  },
  removeItem: (name: string): void => {
    try {
      safeGetStorage()?.removeItem(name);
    } catch (e) {
      console.warn("[userStore] Failed to remove from localStorage:", e);
    }
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      updateProfile: (data) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              ...data,
            },
          };
        });
      },
    }),
    {
      name: USER_STORAGE_KEY,
      storage: userStorage,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
