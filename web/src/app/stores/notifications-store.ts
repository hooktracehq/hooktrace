import { create } from "zustand"
import { persist } from "zustand/middleware"

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
  ) => boolean

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
  create<NotificationsState>()(
    persist(
      (set) => ({
        notifications: [],

        // -------------------------------------------------
        // ADD NOTIFICATION
        // -------------------------------------------------

        addNotification: (notification) => {
          let added = false

          set((state) => {
            /*
             * Prevent duplicate notifications for the
             * same event + notification type.
             *
             * Example:
             *
             * event 165
             *   retrying -> added
             *   retrying -> ignored
             *   retrying -> ignored
             *
             * event 165
             *   dlq -> added
             *
             * retrying and dlq remain separate states.
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

            added = true

            return {
              notifications: [
                notification,
                ...state.notifications,
              ].slice(
                0,
                MAX_NOTIFICATIONS
              ),
            }
          })

          return added
        },

        // -------------------------------------------------
        // MARK AS READ
        // -------------------------------------------------

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

        // -------------------------------------------------
        // MARK ALL AS READ
        // -------------------------------------------------

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

        // -------------------------------------------------
        // REMOVE
        // -------------------------------------------------

        removeNotification: (id) =>
          set((state) => ({
            notifications:
              state.notifications.filter(
                (notification) =>
                  notification.id !== id
              ),
          })),

        // -------------------------------------------------
        // CLEAR
        // -------------------------------------------------

        clearNotifications: () =>
          set({
            notifications: [],
          }),
      }),
      {
        name: "hooktrace-notifications",

        partialize: (state) => ({
          notifications:
            state.notifications,
        }),
      }
    )
  )