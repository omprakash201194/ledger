import { create } from "zustand";

interface AlertState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: () => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  unreadCount: 0,

  setUnreadCount: (count: number) => set({ unreadCount: count }),

  decrementUnreadCount: () => {
    const current = get().unreadCount;
    if (current > 0) {
      set({ unreadCount: current - 1 });
    }
  },
}));
