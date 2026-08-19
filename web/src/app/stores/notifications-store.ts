import { create } from "zustand"

export type NotificationLevel =
  | "info"
  | "success"
  | "warning"
  | "error"

export type Notification = {
  id: string
  eventId?: string | number
  title: string
  message: string
  level: NotificationLevel
  read: boolean
  timestamp: string
}

type NotificationsState = {
  notifications: Notification[]

  addNotification: (
    notification: Notification
  ) => void

  markAsRead: (
    id: string
  ) => void

  markAllAsRead: () => void

  removeNotification: (
    id: string
  ) => void

  clearNotifications: () => void
}

const MAX_NOTIFICATIONS = 50

export const useNotificationsStore =
  create<NotificationsState>((set) => ({
    notifications: [],

    addNotification: (notification) =>
      set((state) => {
        /*
         * Prevent duplicate notifications for
         * the same event + notification type.
         *
         * The same event can legitimately produce
         * multiple notification states:
         *
         * retrying
         *     ↓
         * dlq
         *
         * Therefore eventId alone is not enough.
         */
        const duplicate =
          notification.eventId !== undefined &&
          state.notifications.some(
            (item) =>
              item.eventId ===
                notification.eventId &&
              item.title ===
                notification.title
          )

        if (duplicate) {
          return state
        }

        return {
          notifications: [
            notification,
            ...state.notifications,
          ].slice(0, MAX_NOTIFICATIONS),
        }
      }),

    markAsRead: (id) =>
      set((state) => ({
        notifications:
          state.notifications.map(
            (notification) =>
              notification.id === id
                ? {
                    ...notification,
                    read: true,
                  }
                : notification
          ),
      })),

    markAllAsRead: () =>
      set((state) => ({
        notifications:
          state.notifications.map(
            (notification) => ({
              ...notification,
              read: true,
            })
          ),
      })),

    removeNotification: (id) =>
      set((state) => ({
        notifications:
          state.notifications.filter(
            (notification) =>
              notification.id !== id
          ),
      })),

    clearNotifications: () =>
      set({
        notifications: [],
      }),
  }))