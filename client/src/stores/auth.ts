import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  createdAt: string;
  isActive: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  
  // Profile methods
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      
      login: async (email, password) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to login');
          }
          
          const data = await response.json();
          set({ 
            token: data.token, 
            user: data.user, 
            isAuthenticated: true,
            loading: false
          });
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'An error occurred during login' 
          });
          throw error;
        }
      },
      
      register: async (username, email, password, fullName) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, fullName })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to register');
          }
          
          const data = await response.json();
          set({ 
            token: data.token, 
            user: data.user, 
            isAuthenticated: true,
            loading: false
          });
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'An error occurred during registration' 
          });
          throw error;
        }
      },
      
      logout: () => {
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false,
          error: null
        });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      updateProfile: async (userData) => {
        try {
          const { token } = get();
          if (!token) throw new Error('Not authenticated');
          
          set({ loading: true, error: null });
          
          const response = await fetch('/api/auth/profile', {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile');
          }
          
          const updatedUser = await response.json();
          set({ 
            user: updatedUser,
            loading: false
          });
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'An error occurred while updating profile' 
          });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage', // Storage key in localStorage
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);

// Utility to get the auth token for API requests
export const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};