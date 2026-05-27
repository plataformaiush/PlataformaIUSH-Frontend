import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type HiddenNavStore = {
  hiddenNav: boolean
  toggleHiddenNav: () => void
  setHiddenNav: (hiddenNav: boolean) => void
}

export const useHiddenNavStore = create<HiddenNavStore>()(
  persist(
    (set) => ({
      hiddenNav: false,
      toggleHiddenNav: () => set((state) => ({ hiddenNav: !state.hiddenNav })),
      setHiddenNav: (hiddenNav: boolean) => set({ hiddenNav }),
    }),
    {
      name: 'hiddenNav',
    }
  )
)