import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Agency } from '@/types'
import api from '@/lib/api'

interface AuthState {
  agency: Agency | null
  isAuthenticated: boolean
  isLoading: boolean
  setAgency: (agency: Agency | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      agency: null,
      isAuthenticated: false,
      isLoading: false,

      setAgency: (agency) =>
        set({ agency, isAuthenticated: !!agency }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch {
          // silent
        } finally {
          set({ agency: null, isAuthenticated: false })
        }
      },

      refreshProfile: async () => {
        const state = get()
        if (!state.isAuthenticated) return
        try {
          const res = await api.get('/agency/me')
          set({ agency: res.data.data, isAuthenticated: true })
        } catch {
          set({ agency: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'nexaxotics-auth',
      partialize: (state) => ({
        agency: state.agency,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
