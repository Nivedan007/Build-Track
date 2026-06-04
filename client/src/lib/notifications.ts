import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotifications = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: `${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
              read: false
            }
          ]
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        })),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
        })),

      clearAll: () => set({ notifications: [] }),

      unreadCount: () => get().notifications.filter((n) => !n.read).length
    }),
    {
      name: "buildtrack-notifications"
    }
  )
);
