import { create } from "zustand"

type CommandStore = {
  open: boolean

  setOpen: (
    open: boolean
  ) => void

  toggle: () => void
}

export const useCommandStore =
  create<CommandStore>(
    (set) => ({
      open: false,

      setOpen: (open) =>
        set({
          open,
        }),

      toggle: () =>
        set((state) => ({
          open: !state.open,
        })),
    })
  )