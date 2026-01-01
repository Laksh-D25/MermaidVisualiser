import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '@supabase/supabase-js'

interface UserState {
  user: User | null
  profile: any | null
  isLoading: boolean 
  setSession: (user: User | null, profile: any | null) => void
  clearSession: () => void
  setLoading: (loading: boolean) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true, 

      setSession: (user, profile) => set({ user, profile, isLoading: false }),
      clearSession: () => set({ user: null, profile: null, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'mermaid-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
)