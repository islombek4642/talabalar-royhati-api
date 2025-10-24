export interface Student {
  id: string;
  full_name: string;
  faculty: string;
  group: string;
  email: string | null;
  phone: string | null;
  birth_date: string;
  enrollment_year: number;
  status: 'active' | 'graduated' | 'expelled' | 'academic_leave';
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'STUDENT';
}

export interface AuthResponse {
  token: string;
  user: User;
  student: Student;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  faculty: string;
  group: string;
  birth_date: string;
  enrollment_year: number;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}
