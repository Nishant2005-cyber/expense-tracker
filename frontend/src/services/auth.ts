import api from './api';
import jwtDecode from 'jwt-decode';

interface User {
  id: string;
  name?: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface DecodedToken {
  exp: number;
  user: User;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Store auth data
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));

    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Login failed');
  }
};

export const signup = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/signup', { name, email, password });
    const { token, user } = response.data;

    // Store auth data
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));

    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Signup failed');
  }
};

export const loginWithGoogle = async (): Promise<void> => {
  window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
};

export const loginWithFacebook = async (): Promise<void> => {
  window.location.href = `${process.env.REACT_APP_API_URL}/auth/facebook`;
};

export const loginWithGithub = async (): Promise<void> => {
  window.location.href = `${process.env.REACT_APP_API_URL}/auth/github`;
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await api.post('/auth/forgot-password', { email });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to send reset email');
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  try {
    await api.post('/auth/reset-password', { token, newPassword });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to reset password');
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('rememberMe');
  window.location.href = '/auth';
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      // Token expired
      logout();
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}; 