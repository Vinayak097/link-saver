import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,

      login: async (email: string, password: string) => {
        set({ loading: true });
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Login failed');
          }

          const data = await response.json();
          set({ user: data.user });
          
          // Force a page refresh to ensure all components recognize the auth state change
          window.location.href = '/dashboard';
        } finally {
          set({ loading: false });
        }
      },

      register: async (email: string, password: string) => {
        set({ loading: true });
        
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Registration failed');
          }
          
          // Redirect to login page on successful registration
          window.location.href = '/login?registered=true';
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        set({ loading: true });
        
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
          });
          
          set({ user: null });
          
          // Force a page refresh to ensure all components recognize the auth state change
          window.location.href = '/login';
        } finally {
          set({ loading: false });
        }
      },

      checkAuth: async () => {
        try {
          set({ loading: true });
          const response = await fetch('/api/auth/me');
          console.log("response / checking me " , response)
          if (response.ok) {
            const data = await response.json();
            set({ user: data.user });
          } else {
            set({ user: null });
          }
        } catch (error) {
          console.error('Auth check error:', error);
          set({ user: null });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ user: state.user }), // only persist the user
    }
  )
);
