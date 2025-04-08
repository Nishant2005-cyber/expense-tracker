import axios, { AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface Transaction {
  _id?: string;  // MongoDB ObjectId
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const addTransaction = async (transaction: Omit<Transaction, '_id'>) => {
  try {
    const response = await api.post('/transactions', transaction);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(`Error adding transaction: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('Error adding transaction');
  }
};

export const updateTransaction = async (id: string, transaction: Omit<Transaction, '_id'>) => {
  try {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(`Error updating transaction: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('Error updating transaction');
  }
};

export const deleteTransaction = async (id: string) => {
  try {
    await api.delete(`/transactions/${id}`);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(`Error deleting transaction: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('Error deleting transaction');
  }
};

export const getTransactions = async () => {
  try {
    const response = await api.get('/transactions');
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(`Error fetching transactions: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('Error fetching transactions');
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/transactions/stats/dashboard');
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(`Error fetching dashboard stats: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('Error fetching dashboard stats');
  }
};

export default api; 