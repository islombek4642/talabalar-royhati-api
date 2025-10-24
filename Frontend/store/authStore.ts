import { create } from 'zustand';
import { api } from '@/lib/api';
import { User, Student, AuthResponse, RegisterData, LoginData } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  student: Student | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  student: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  register: async (data: RegisterData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post<AuthResponse>('/api/v1/student/register', data);
      const { token, user, student } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ user, student }));
      
      set({
        token,
        user,
        student,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (data: LoginData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post<AuthResponse>('/api/v1/student/login', data);
      const { token, user, student } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ user, student }));
      
      set({
        token,
        user,
        student,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      token: null,
      user: null,
      student: null,
      isAuthenticated: false,
    });
  },

  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const { user, student } = JSON.parse(userData);
        set({
          token,
          user,
          student,
          isAuthenticated: true,
        });
      }
    }
  },
}));
