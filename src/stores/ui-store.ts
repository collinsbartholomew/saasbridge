"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UiStore = {
  isCollapsed: boolean;
  setCollapsed: (isCollapsed: boolean) => void;
  toggleCollapsed: () => void;
};

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      setCollapsed: (isCollapsed) => set({ isCollapsed }),
      toggleCollapsed: () => set({ isCollapsed: !get().isCollapsed }),
    }),
    {
      name: "nextbase-ui-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
