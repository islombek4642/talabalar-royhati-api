import { create } from 'zustand';
import { api } from '@/lib/api';
import { User, Student, AuthResponse, RegisterData, LoginData } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  student: Student | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // New: tracks if storage has been loaded
  error: string | null;
  
  // Actions
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
  updateStudent: (student: Student) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  student: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  register: async (data: RegisterData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post<AuthResponse>('/api/v1/student/register', data);
      const { token, user, student } = response.data;
      
      console.log('Register Response:', { token, user, student });
      
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
      
      console.log('Login Response:', { token, user, student });
      
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
        try {
          const { user, student } = JSON.parse(userData);
          set({
            token,
            user,
            student,
            isAuthenticated: true,
            isInitialized: true,
          });
        } catch (error) {
          console.error('Failed to parse user data:', error);
          set({ isInitialized: true });
        }
      } else {
        set({ isInitialized: true });
      }
    }
  },

  updateStudent: (student: Student) => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      parsed.student = student;
      localStorage.setItem('user', JSON.stringify(parsed));
    }
    set({ student });
  },
}));
